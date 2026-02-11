/* -------------------------------------------------------------------------
File: app/dashboard/products/add/page.jsx
Purpose: 7-Step Mobile-First Product Upload Wizard (Single Page on Desktop)
------------------------------------------------------------------------- */

"use client";

import React, { useState, useReducer, useMemo, useEffect } from 'react';
import {
    X, AlertTriangle, CheckCircle, Upload,
    ChevronRight, ChevronLeft, Save, Briefcase,
    Layers, FileText, Tag, Settings, Truck, Image as ImageIcon,
    Check, MapPin, Box
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { offlineQueue } from '@/lib/apiClient';
import LocationSelector from '@/components/LocationSelector';
import CategoryTreeSelector from '@/components/CategoryTreeSelector';
import BrandTreeSelector from '@/components/BrandTreeSelector';
import AttributeSelector from '@/components/AttributeSelector';
import LoadingDots from '@/components/LoadingDots';
import { useLocalData } from '@/hooks/useLocalData';
import { stripHtml } from '@/lib/string-utils';

// Dynamic import for RichTextEditor to avoid unused CSS preload warnings
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse border border-gray-200 rounded-xl"></div>
});

// --- 1. INITIAL STATE & REDUCER ---
const initialState = {
    formData: {
        name: "",
        productType: "simple",
        short_description: "",
        description: "",
        sku: "",
        regular_price: "",
        sale_price: "",
        sale_start: "",
        sale_end: "",
        stock_quantity: "",
        manage_stock: true,
        weight: "",
        length: "",
        width: "",
        height: "",
        category_ids: [],
        brand_ids: [],
        location_ids: [],
        attributes: [],
        variations: [],
        images: []
    },
    status: 'idle',
    message: ''
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_FORM': return { ...state, formData: { ...state.formData, ...action.payload } };
        case 'SET_FIELD': return { ...state, formData: { ...state.formData, [action.field]: action.value } };
        case 'SET_STATUS': return { ...state, status: action.payload };
        case 'SET_MESSAGE': return { ...state, message: action.payload };
        case 'RESET_FORM': return initialState;
        default: return state;
    }
}

// --- 2. MAIN COMPONENT ---
export default function AddProduct() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [currentStep, setCurrentStep] = useState(1);
    const [validationError, setValidationError] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const router = useRouter();

    const {
        categories,
        brands,
        attributes: globalAttributes,
        locations,
        categoryTree,
        brandTree,
        getAttributesForCategories,
        loading: isDataLoading,
        syncing,
        syncProgress
    } = useLocalData();

    const isSubmitting = state.status === 'loading';

    // Manage Image Previews
    useEffect(() => {
        const newPreviews = state.formData.images.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
        return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
    }, [state.formData.images]);

    // Memoized attribute filtering
    const filteredAttributes = useMemo(() => {
        return getAttributesForCategories(state.formData.category_ids);
    }, [state.formData.category_ids, getAttributesForCategories]);

    // --- STEPS CONFIGURATION ---
    const totalSteps = 7;

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({ type: 'SET_FIELD', field: name, value });
        if (validationError) setValidationError(null); // Clear error on change
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const currentImages = state.formData.images;
        const combinedImages = [...currentImages, ...files].slice(0, 8); // Max 8 hard limit here
        dispatch({ type: 'SET_FIELD', field: 'images', value: combinedImages });
        e.target.value = null; // Reset input
        if (validationError) setValidationError(null);
    };

    const removeImage = (index) => {
        const updated = state.formData.images.filter((_, i) => i !== index);
        dispatch({ type: 'SET_FIELD', field: 'images', value: updated });
    };

    const generateVariations = () => {
        const validAttrs = state.formData.attributes.filter(attr => attr.name.trim() && attr.options.length > 0);
        if (validAttrs.length === 0) {
            setValidationError('Add attributes with options first.');
            return;
        }

        const attrOptions = validAttrs.map(attr => ({
            name: attr.name,
            options: Array.isArray(attr.options) ? attr.options : attr.options.split(',').map(s => s.trim())
        }));

        const generateCombinations = (arrays) => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = generateCombinations(rest);
            return first.flatMap(item => restCombinations.map(combo => [item, ...combo]));
        };

        const combinations = generateCombinations(attrOptions.map(a => a.options));
        const newVariations = combinations.map((combo, index) => ({
            id: `temp-${index}`,
            attributes: combo.map((option, i) => ({ name: attrOptions[i].name, option })),
            regular_price: state.formData.regular_price || '',
            sale_price: state.formData.sale_price || '',
            stock_quantity: state.formData.stock_quantity || '',
            sku: `${state.formData.sku || 'SKU'}-${index + 1}`,
            enabled: true
        }));

        dispatch({ type: 'SET_FIELD', field: 'variations', value: newVariations });
        setValidationError(null);
    };

    const handleVariationChange = (index, field, value) => {
        const updated = state.formData.variations.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        dispatch({ type: 'SET_FIELD', field: 'variations', value: updated });
    };

    // --- VALIDATION & NAVIGATION ---
    const validateStep = (step = currentStep) => {
        const { formData } = state;

        switch (step) {
            case 1: // Basics
                if (!formData.name.trim()) return "Product title is required.";
                if (formData.category_ids.length === 0) return "Please select a category.";
                break;
            case 2: // Images
                if (formData.images.length < 2) return "Please select at least 2 images.";
                if (formData.images.length > 8) return "Maximum 8 images allowed.";
                break;
            case 3: // Specs
                const validateDim = (val, name) => {
                    if (val && (parseFloat(val) < 0.1 || parseFloat(val) > 999.9)) return `${name} must be between 0.1 and 999.9`;
                    return null;
                };
                const lErr = validateDim(formData.length, "Length");
                if (lErr) return lErr;
                const wErr = validateDim(formData.width, "Width");
                if (wErr) return wErr;
                const hErr = validateDim(formData.height, "Height");
                if (hErr) return hErr;
                break;
            case 4: // Descriptions
                if (stripHtml(formData.short_description).length > 255) return "Short description must be under 255 characters.";
                if (stripHtml(formData.description).length > 2000) return "Long description must be under 2000 characters.";
                break;
            case 5: // Inventory
                if (!formData.regular_price || parseFloat(formData.regular_price) < 0.01) return "Price must be at least 0.01.";
                if (formData.stock_quantity === "" || parseInt(formData.stock_quantity) < 0) return "Valid stock quantity is required.";
                break;
            case 6: // Attributes
                break;
            case 7: // Variations/Publish
                if (formData.productType === 'variable') {
                    if (formData.variations.length === 0) return "Please generate variations before publishing.";
                }
                if (locations.length > 0 && formData.location_ids.length === 0) return "Please select a location in Step 3.";
                break;
        }
        return null;
    };

    const nextStep = () => {
        const error = validateStep(currentStep);
        if (error) {
            setValidationError(error);
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setValidationError(null);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setValidationError(null);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        // Validate all steps
        let error = null;
        for (let i = 1; i <= 7; i++) {
            error = validateStep(i);
            if (error) break;
        }

        if (error) {
            setValidationError(error);
            // On desktop, we might want to scroll to the error, but for now toast is fine
            return;
        }

        if (isSubmitting) return;

        console.log('🚀 POST triggered for New Product');
        console.log('📦 Form Data Snapshot:', state.formData);

        dispatch({ type: 'SET_STATUS', payload: 'loading' });
        dispatch({ type: 'SET_MESSAGE', payload: 'Uploading your product...' });

        const dataToSend = new FormData();
        const { formData } = state;

        // Core fields
        dataToSend.append('name', formData.name);
        dataToSend.append('productType', formData.productType);
        dataToSend.append('regular_price', formData.regular_price);
        dataToSend.append('sale_price', formData.sale_price);
        dataToSend.append('stock_quantity', formData.stock_quantity);
        dataToSend.append('description', formData.description);
        dataToSend.append('short_description', formData.short_description);
        dataToSend.append('sku', formData.sku);
        dataToSend.append('weight', formData.weight);
        dataToSend.append('length', formData.length);
        dataToSend.append('width', formData.width);
        dataToSend.append('height', formData.height);
        dataToSend.append('manage_stock', 'true');

        // JSON fields
        dataToSend.append('category_ids_json', JSON.stringify(formData.category_ids));
        dataToSend.append('brand_ids_json', JSON.stringify(formData.brand_ids));
        dataToSend.append('location_ids_json', JSON.stringify(formData.location_ids));
        dataToSend.append('attributes_json', JSON.stringify(formData.attributes));
        dataToSend.append('variations_json', JSON.stringify(formData.variations.filter(v => v.enabled)));

        // Images
        formData.images.forEach(file => dataToSend.append('images[]', file));

        try {
            if (!navigator.onLine) {
                offlineQueue.add({ url: '/api/vendor/products', options: { method: 'POST', body: dataToSend } });
                dispatch({ type: 'SET_STATUS', payload: 'success' });
                dispatch({ type: 'SET_MESSAGE', payload: 'Offline. Product will sync automatically when back online!' });
                return;
            }

            const res = await fetch('/api/vendor/products', { method: 'POST', body: dataToSend });
            console.log('📡 Response status:', res.status);

            let data;
            try {
                data = await res.json();
            } catch (e) {
                const text = await res.text();
                console.error('❌ Failed to parse JSON response:', text.slice(0, 500));
                throw new Error(`Server returned invalid response (${res.status})`);
            }

            if (res.ok) {
                dispatch({ type: 'SET_STATUS', payload: 'success' });
                dispatch({ type: 'SET_MESSAGE', payload: `"${data.product?.name || formData.name}" added successfully!` });
                setTimeout(() => router.push('/dashboard/products'), 1500);
            } else {
                dispatch({ type: 'SET_STATUS', payload: 'error' });
                dispatch({ type: 'SET_MESSAGE', payload: data.error || data.message || `Failed to add product (Status ${res.status})` });
            }
        } catch (err) {
            console.error('❌ Error adding product:', err);
            dispatch({ type: 'SET_STATUS', payload: 'error' });
            dispatch({ type: 'SET_MESSAGE', payload: err.message || 'Network error. Please try again.' });
        }
    };

    const inputStyle = "w-full rounded-none border-b border-gray-300 p-3 text-sm focus:ring-0 focus:border-indigo-600 transition-all outline-none bg-white font-medium placeholder-gray-400";
    const labelStyle = "block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide";

    return (
        <div className="min-h-screen bg-gray-50 pb-48 md:pb-24 font-sans flex flex-col">
            {/* Sticky Progress Bar (Mobile Only) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 md:hidden">
                <div className="w-full px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-none transition-all duration-300 ${i + 1 === currentStep ? 'w-8 bg-indigo-600' :
                                    i + 1 < currentStep ? 'w-2 bg-indigo-400' : 'w-2 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-xs font-bold text-gray-500">
                        Step {currentStep}/{totalSteps}
                    </div>
                </div>
                {/* Validation Error Toast */}
                {validationError && (
                    <div className="bg-red-50 px-4 py-2 border-t border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-red-700">{validationError}</span>
                    </div>
                )}
            </div>
            
            {/* Desktop Header & Validation Toast */}
            <div className="hidden md:block bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    {validationError && (
                        <div className="bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-bold text-red-700">{validationError}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full">
                {/* Content Area */}
                <div className="p-0 bg-white min-h-[calc(100vh-140px)] md:max-w-4xl md:mx-auto md:bg-transparent md:space-y-6 md:p-8">

                    {/* STEP 1: BASICS */}
                    <div className={`p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 1 ? 'block' : 'hidden md:block'}`}>
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">Basic Details</h2>
                            <p className="text-sm text-gray-500 mt-1">Product name and type</p>
                        </div>

                        <div>
                            <label className={labelStyle}>Product Title *</label>
                            <input
                                type="text"
                                name="name"
                                value={state.formData.name}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="e.g. Nike Air Max 90"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Product Type</label>
                            <div className="grid grid-cols-2 gap-0 border border-gray-200">
                                <label className={`cursor-pointer p-4 flex flex-col items-center gap-2 transition-all border-r border-gray-200 ${state.formData.productType === 'simple' ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" name="productType" value="simple" checked={state.formData.productType === 'simple'} onChange={handleChange} className="hidden" />
                                    <Tag className={`w-5 h-5 ${state.formData.productType === 'simple' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-bold ${state.formData.productType === 'simple' ? 'text-indigo-900' : 'text-gray-600'}`}>Simple</span>
                                </label>
                                <label className={`cursor-pointer p-4 flex flex-col items-center gap-2 transition-all ${state.formData.productType === 'variable' ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" name="productType" value="variable" checked={state.formData.productType === 'variable'} onChange={handleChange} className="hidden" />
                                    <Layers className={`w-5 h-5 ${state.formData.productType === 'variable' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-bold ${state.formData.productType === 'variable' ? 'text-indigo-900' : 'text-gray-600'}`}>Variable</span>
                                </label>
                            </div>
                        </div>

                        <CategoryTreeSelector
          selectedIds={state.formData.category_ids}
          onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'category_ids', value: ids })}
          label="Category *"
          categoryTree={categoryTree}
          loading={isDataLoading}
          closeOnSelect={true}
        />
                    </div>

                    {/* STEP 2: IMAGES */}
                    <div className={`p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 2 ? 'block' : 'hidden md:block'}`}>
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
                            <p className="text-sm text-gray-500 mt-1">Upload 2-8 images</p>
                        </div>

                        <div className="border border-dashed border-gray-300 p-8 text-center hover:bg-gray-50 transition-colors relative bg-gray-50">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={state.formData.images.length >= 8}
                            />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                                <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center text-indigo-600">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="font-bold text-gray-900">Tap to upload</p>
                                <p className="text-xs text-gray-500">{state.formData.images.length} / 8 selected</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((url, i) => (
                                <div key={i} className="relative aspect-square bg-gray-100 overflow-hidden group border border-gray-200">
                                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {i === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold py-1 text-center uppercase tracking-wider">
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STEP 3: SPECS & LOGISTICS */}
                    <div className={`p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 3 ? 'block' : 'hidden md:block'}`}>
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">Logistics</h2>
                            <p className="text-sm text-gray-500 mt-1">SKU, weight, and dimensions</p>
                        </div>

                        <div>
                            <label className={labelStyle}>SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={state.formData.sku}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="e.g. NKE-AM90-001"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Weight (kg)</label>
                                <input type="number" name="weight" value={state.formData.weight} onChange={handleChange} className={inputStyle} placeholder="0.5" step="0.1" />
                            </div>
                            <div>
                                <label className={labelStyle}>Length (cm)</label>
                                <input type="number" name="length" value={state.formData.length} onChange={handleChange} className={inputStyle} placeholder="10.0" step="0.1" />
                            </div>
                            <div>
                                <label className={labelStyle}>Width (cm)</label>
                                <input type="number" name="width" value={state.formData.width} onChange={handleChange} className={inputStyle} placeholder="10.0" step="0.1" />
                            </div>
                            <div>
                                <label className={labelStyle}>Height (cm)</label>
                                <input type="number" name="height" value={state.formData.height} onChange={handleChange} className={inputStyle} placeholder="10.0" step="0.1" />
                            </div>
                        </div>

                        <BrandTreeSelector
                            selectedIds={state.formData.brand_ids}
                            onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'brand_ids', value: ids })}
                            brandTree={brandTree}
                            loading={isDataLoading}
                        />

                        <LocationSelector
                            locations={locations}
                            selectedIds={state.formData.location_ids}
                            onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'location_ids', value: ids })}
                            label="Listing Location"
                            loading={isDataLoading}
                        />
                    </div>

                    {/* STEP 4: DESCRIPTIONS */}
                    <div className={`p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 4 ? 'block' : 'hidden md:block'}`}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Tell the story</h2>
                            <p className="text-sm text-gray-500 mt-1">Describe your product to customers.</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className={`text-xs ml-auto ${stripHtml(state.formData.short_description).length > 255 ? 'text-red-500' : 'text-gray-400'}`}>{stripHtml(state.formData.short_description).length}/255</span>
                            </div>
                            <RichTextEditor
                                label="Short Description"
                                value={state.formData.short_description}
                                onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'short_description', value: val })}
                                placeholder="A quick summary..."
                                height="h-32"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className={`text-xs ml-auto ${stripHtml(state.formData.description).length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>{stripHtml(state.formData.description).length}/2000</span>
                            </div>
                            <RichTextEditor
                                label="Long Description"
                                value={state.formData.description}
                                onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'description', value: val })}
                                placeholder="Detailed features, specs, and benefits..."
                            />
                        </div>
                    </div>

                    {/* STEP 5: PRICE & STOCK */}
                    <div className={`p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 5 ? 'block' : 'hidden md:block'}`}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Inventory & Pricing</h2>
                            <p className="text-sm text-gray-500 mt-1">Set your price and availability.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Regular Price *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">GH₵</span>
                                    <input
                                        type="number"
                                        name="regular_price"
                                        value={state.formData.regular_price}
                                        onChange={handleChange}
                                        className={`${inputStyle} pl-10`}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Sale Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">GH₵</span>
                                    <input
                                        type="number"
                                        name="sale_price"
                                        value={state.formData.sale_price}
                                        onChange={handleChange}
                                        className={`${inputStyle} pl-10`}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Stock Quantity *</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={state.formData.stock_quantity}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* STEP 6: ATTRIBUTES */}
                    <div className={`p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 6 ? 'block' : 'hidden md:block'}`}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Product Attributes</h2>
                            <p className="text-sm text-gray-500 mt-1">Add details like color, size, or material.</p>
                        </div>

                        <AttributeSelector
                            globalAttributes={filteredAttributes}
                            selectedAttributes={state.formData.attributes}
                            onChange={(attrs) => dispatch({ type: 'SET_FIELD', field: 'attributes', value: attrs })}
                            productType={state.formData.productType}
                        />

                        {state.formData.productType === 'variable' && (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-none md:rounded-lg text-sm text-indigo-800">
                                <strong>Note:</strong> You must add attributes with options (e.g., Size: S, M, L) to generate variations in the next step.
                            </div>
                        )}
                    </div>

                    {/* STEP 7: VARIATIONS / PUBLISH */}
                    <div className={`p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 ${currentStep === 7 ? 'block' : 'hidden md:block'}`}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Final Review</h2>
                            <p className="text-sm text-gray-500 mt-1">Review your product and publish.</p>
                        </div>

                        {state.formData.productType === 'variable' ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Variations Matrix</h3>
                                    <button
                                        type="button"
                                        onClick={generateVariations}
                                        className="text-xs font-bold text-indigo-600 uppercase hover:underline"
                                    >
                                        Regenerate
                                    </button>
                                </div>

                                {state.formData.variations.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 border border-dashed rounded-xl">
                                        <p className="text-gray-500 mb-4">No variations generated yet.</p>
                                        <button
                                            onClick={generateVariations}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                                        >
                                            Generate Variations
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                        {state.formData.variations.map((v, i) => (
                                            <div key={v.id} className="p-4 bg-gray-50 rounded-none md:rounded-xl border border-gray-200 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900">{v.attributes.map(a => a.option).join(' / ')}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={v.enabled}
                                                        onChange={(e) => handleVariationChange(i, 'enabled', e.target.checked)}
                                                        className="w-5 h-5 accent-indigo-600"
                                                    />
                                                </div>
                                                {v.enabled && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="number"
                                                            value={v.regular_price}
                                                            onChange={(e) => handleVariationChange(i, 'regular_price', e.target.value)}
                                                            className={inputStyle}
                                                            placeholder="Price"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={v.stock_quantity}
                                                            onChange={(e) => handleVariationChange(i, 'stock_quantity', e.target.value)}
                                                            className={inputStyle}
                                                            placeholder="Stock"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={v.sku}
                                                            onChange={(e) => handleVariationChange(i, 'sku', e.target.value)}
                                                            className={inputStyle}
                                                            placeholder="SKU"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-green-50 border border-green-100 rounded-none md:rounded-xl flex flex-col items-center text-center gap-3">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                                <div>
                                    <h3 className="text-lg font-bold text-green-900">Ready to Publish!</h3>
                                    <p className="text-green-700 text-sm">Your simple product is ready to go live.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Submit Button */}
                    <div className="hidden md:flex justify-end pt-4 pb-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingDots className="w-5 h-5 text-white" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Publish Product</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Fixed Bottom Action Bar (Mobile Only) */}
            <div className="fixed bottom-[90px] left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex items-center gap-3 z-40 md:hidden shadow-xl pb-safe">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className={`flex-1 py-3.5 rounded-none font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors ${currentStep === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    Back
                </button>
                {currentStep < totalSteps ? (
                    <button
                        onClick={nextStep}
                        className="flex-[2] py-3.5 rounded-none font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Next Step
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-3.5 rounded-none font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <LoadingDots className="w-5 h-5 text-white" /> : (
                            <>
                                Publish
                                <Check className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
