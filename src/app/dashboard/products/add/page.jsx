// src/app/dashboard/products/add/page.jsx
"use client";

import React, { useReducer, useMemo } from 'react';
import { Loader2, X, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { offlineQueue } from '@/lib/apiClient';
import HierarchicalSelector from '@/components/HierarchicalSelector';
import CategoryTreeSelector from '@/components/CategoryTreeSelector';
import BrandTreeSelector from '@/components/BrandTreeSelector';
import AttributeSelector from '@/components/AttributeSelector';
import { useCategoryAttributes } from '@/hooks/useCategoryAttributes';
import { useLocalData } from '@/hooks/useLocalData';

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
    weight: "",
    length: "",
    width: "",
    height: "",
    category_ids: [],
    brand_ids: [],
    location_ids: [],
    attributes: [{ id: '', name: "", options: "" }],
    variations: [],
    images: []
  },
  status: 'idle', // idle | loading | success | error
  message: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FORM': return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'SET_FIELD': return { ...state, formData: { ...state.formData, [action.field]: action.value } };
    case 'SET_STATUS': return { ...state, status: action.payload };
    case 'SET_MESSAGE': return { ...state, message: action.payload };
    case 'RESET_FORM': return { ...state, formData: initialState.formData };
    default: return state;
  }
}

// --- 2. MAIN COMPONENT ---
export default function AddProduct() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  // Load data from local storage (IndexedDB) - all pre-computed!
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

  // Memoize filtered attributes - only recalculate when category IDs change (instant!)
  const filteredAttributes = useMemo(() => {
    return getAttributesForCategories(state.formData.category_ids);
  }, [state.formData.category_ids, getAttributesForCategories]);
  
  // Check if attributes are filtered (different from all attributes) - memoized
  const hasMapping = useMemo(() => {
    return state.formData.category_ids.length > 0 && 
           filteredAttributes.length < globalAttributes.length;
  }, [state.formData.category_ids.length, filteredAttributes.length, globalAttributes.length]);

  // --- FORM HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, files, selectedOptions } = e.target;

    if (name === "images" && files) {
      const newFiles = [...state.formData.images, ...Array.from(files)].slice(0, 4);
      dispatch({ type: 'SET_FIELD', field: 'images', value: newFiles });
      e.target.value = null;
    } else {
      dispatch({ type: 'SET_FIELD', field: name, value });
    }
  };

  const removeImage = (index) => {
    const updated = state.formData.images.filter((_, i) => i !== index);
    dispatch({ type: 'SET_FIELD', field: 'images', value: updated });
  };

  const addAttribute = () => {
    dispatch({ type: 'SET_FIELD', field: 'attributes', value: [...state.formData.attributes, { id: '', name: "", options: "" }] });
  };

  const removeAttribute = (index) => {
    const updated = [...state.formData.attributes];
    updated.splice(index, 1);
    dispatch({ type: 'SET_FIELD', field: 'attributes', value: updated });
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttrs = [...state.formData.attributes];
    if (field === "name") {
      const selectedAttr = filteredAttributes.find(attr => attr.name === value);
      updatedAttrs[index] = { ...updatedAttrs[index], id: selectedAttr ? selectedAttr.id : '', name: value };
    } else if (field === "options") {
      updatedAttrs[index][field] = value;
    }
    dispatch({ type: 'SET_FIELD', field: 'attributes', value: updatedAttrs });
  };

  // Generate variations from attributes
  const generateVariations = () => {
    const validAttrs = state.formData.attributes.filter(attr => attr.name.trim() && attr.options.trim());
    
    if (validAttrs.length === 0) {
      dispatch({ type: 'SET_MESSAGE', payload: 'Please add at least one attribute with options first.' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return;
    }

    // Parse options for each attribute
    const attrOptions = validAttrs.map(attr => ({
      name: attr.name,
      options: getAttributeOptionsValue(attr.options).split(',').map(s => s.trim()).filter(Boolean)
    }));

    // Generate all combinations
    const generateCombinations = (arrays) => {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restCombinations = generateCombinations(rest);
      return first.flatMap(item => restCombinations.map(combo => [item, ...combo]));
    };

    const combinations = generateCombinations(attrOptions.map(a => a.options));
    
    const newVariations = combinations.map((combo, index) => {
      const attributes = combo.map((option, i) => ({
        name: attrOptions[i].name,
        option
      }));
      
      return {
        id: `temp-${index}`,
        attributes,
        regular_price: '',
        sale_price: '',
        stock_quantity: '',
        sku: '',
        enabled: true
      };
    });

    dispatch({ type: 'SET_FIELD', field: 'variations', value: newVariations });
    dispatch({ type: 'SET_MESSAGE', payload: `Generated ${newVariations.length} variations` });
    dispatch({ type: 'SET_STATUS', payload: 'success' });
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...state.formData.variations];
    updated[index][field] = value;
    dispatch({ type: 'SET_FIELD', field: 'variations', value: updated });
  };

  const getAttributeOptionsValue = (options) => {
    if (Array.isArray(options)) return options.join(', ');
    return options;
  };

  // --- 5. FORM SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isDataLoading) return;

    // Validation
    if (!state.formData.name) {
      dispatch({ type: 'SET_MESSAGE', payload: 'Product Name is required.' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return;
    }
    // Only validate location if locations are available
    if (locations.length > 0 && state.formData.location_ids.length === 0) {
      dispatch({ type: 'SET_MESSAGE', payload: 'Product Location is required. Please select at least one location.' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return;
    }
    if (state.formData.productType === 'simple' && (!state.formData.regular_price || !state.formData.stock_quantity)) {
      dispatch({ type: 'SET_MESSAGE', payload: 'For simple products, regular price and stock quantity are required.' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return;
    }
    if (state.formData.productType === 'variable') {
      if (state.formData.attributes.filter(a => a.name.trim() && a.options.trim()).length === 0) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Variable products require at least one attribute with options.' });
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        return;
      }
      if (state.formData.variations.filter(v => v.enabled).length === 0) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Please generate variations and set prices/stock for at least one variation.' });
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        return;
      }
      const invalidVariations = state.formData.variations.filter(v => v.enabled && (!v.regular_price || !v.stock_quantity));
      if (invalidVariations.length > 0) {
        dispatch({ type: 'SET_MESSAGE', payload: 'All enabled variations must have regular price and stock quantity.' });
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        return;
      }
    }

    dispatch({ type: 'SET_STATUS', payload: 'loading' });
    dispatch({ type: 'SET_MESSAGE', payload: 'Uploading product...' });

    const dataToSend = new FormData();

    const { formData } = state;

    // Core fields
    dataToSend.append('name', formData.name);
    dataToSend.append('productType', formData.productType);

    if (formData.productType === 'simple') {
      dataToSend.append('regular_price', formData.regular_price);
      dataToSend.append('sale_price', formData.sale_price);
      dataToSend.append('stock_quantity', formData.stock_quantity);
    }

    // Optional fields
    Object.entries(formData).forEach(([key, value]) => {
      // Exclude special fields handled separately
      if (!['regular_price', 'stock_quantity', 'category_ids', 'attributes', 'images', 'productType', 'name'].includes(key)) {
        if (typeof value === 'string') {
          dataToSend.append(key, value.trim());
        } else if (value !== null && value !== undefined) {
             dataToSend.append(key, String(value));
        }
      }
    });

    // JSON fields
    dataToSend.append('category_ids_json', JSON.stringify(formData.category_ids));
    dataToSend.append('brand_ids_json', JSON.stringify(formData.brand_ids));
    dataToSend.append('location_ids_json', JSON.stringify(formData.location_ids));

    const validAttributes = formData.attributes
      .filter(attr => attr.name.trim() !== '' && attr.options.trim() !== '')
      .map(attr => ({
        id: attr.id || '',
        name: attr.name.trim(),
        options: getAttributeOptionsValue(attr.options).split(',').map(s => s.trim()).filter(Boolean)
      }));

    dataToSend.append('attributes_json', JSON.stringify(validAttributes));

    // Variations (for variable products)
    if (formData.productType === 'variable') {
      const validVariations = formData.variations
        .filter(v => v.enabled && v.regular_price && v.stock_quantity)
        .map(v => ({
          attributes: v.attributes,
          regular_price: v.regular_price,
          sale_price: v.sale_price || '',
          stock_quantity: parseInt(v.stock_quantity, 10),
          sku: v.sku || '',
          manage_stock: true
        }));
      dataToSend.append('variations_json', JSON.stringify(validVariations));
    }

    // Images
    formData.images.forEach(file => dataToSend.append('images[]', file));

    try {
      // Check if online
      if (!navigator.onLine) {
        // Queue the request for later
        offlineQueue.add({
          url: '/api/vendor/products',
          options: { method: 'POST', body: dataToSend }
        });
        
        dispatch({ type: 'SET_STATUS', payload: 'success' });
        dispatch({ type: 'SET_MESSAGE', payload: 'You are offline. Product will be uploaded when connection is restored.' });
        
        // Don't redirect, let user continue working
        return;
      }

      const res = await fetch('/api/vendor/products', { method: 'POST', body: dataToSend });
      const data = await res.json();

      if (res.ok) {
        dispatch({ type: 'SET_STATUS', payload: 'success' });
        dispatch({ type: 'SET_MESSAGE', payload: `Product "${data.product.name}" added successfully!` });
        setTimeout(() => router.push('/dashboard/products'), 1500);
      } else {
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        
        // Provide helpful error messages
        let errorMsg = data.error || 'Failed to add product.';
        if (data.suggestion) {
          errorMsg += ` ${data.suggestion}`;
        }
        if (data.retryable) {
          errorMsg += ' You can try again.';
        }
        
        dispatch({ type: 'SET_MESSAGE', payload: errorMsg });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      
      // Better error messages based on error type
      let errorMsg = 'Network error during upload.';
      if (err.message.includes('Failed to fetch')) {
        errorMsg = 'Unable to reach the server. Please check your internet connection and try again.';
      } else if (err.message.includes('timeout')) {
        errorMsg = 'Request timed out. The server is taking too long to respond. Please try again.';
      }
      
      dispatch({ type: 'SET_MESSAGE', payload: errorMsg });
    }
  };

  const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150";

  // --- 6. RENDER ---
  // Always show form - don't block on data loading

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Product</h1>

      {/* No Data Warning */}
      {!isDataLoading && !syncing && categories.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                No product data available
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Please sync data from the dashboard before adding products. Go to Dashboard → Sync Data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Sync Indicator */}
      {syncing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Syncing {syncProgress?.current || 'data'} in background...
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {syncProgress?.details || 'You can continue using the form'}
              </p>
            </div>
            {syncProgress && (
              <div className="text-xs text-blue-600 font-medium">
                {syncProgress.step}/{syncProgress.total}
              </div>
            )}
          </div>
          {syncProgress && (
            <div className="mt-2 w-full bg-blue-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(syncProgress.step / syncProgress.total) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {state.message && !isDataLoading && (
        <div className={`p-3 mb-6 rounded-lg text-sm flex items-start ${
          state.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
          state.status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
          'bg-blue-100 text-blue-700 border border-blue-200'
        }`} aria-live="polite">
          {state.status === 'success' && <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />}
          {state.status === 'error' && <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />}
          {state.status === 'loading' && <Loader2 className="w-4 h-4 mr-2 mt-0.5 animate-spin" />}
          <span className="flex-1">{state.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 p-5 bg-white rounded-lg border border-gray-200">
        
        {/* Step 1: Product Name */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">1</span>
              Product Name
            </h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                id="name"
                value={state.formData.name}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="e.g., Ultra-Comfort Running Shoes"
              />
              <p className="mt-1 text-xs text-gray-500">Give your product a clear, descriptive name</p>
            </div>
        </section>

        {/* Step 2: Category Selection */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">2</span>
              Category Selection
            </h2>
            
            <CategoryTreeSelector
                selectedIds={state.formData.category_ids}
                onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'category_ids', value: ids })}
                label="Select Product Category"
                categoryTree={categoryTree}
            />
            
            {state.formData.category_ids.length > 0 && hasMapping && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        ✓ Category selected! Relevant attributes will be shown for this category.
                    </p>
                </div>
            )}
        </section>

        {/* Step 3: Product Type */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">3</span>
              Product Type
            </h2>
            
            <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">Product Type <span className="text-red-500">*</span></label>
                <select
                    name="productType"
                    id="productType"
                    value={state.formData.productType}
                    onChange={handleChange}
                    className={inputStyle}
                >
                    <option value="simple">Simple Product (Single item with one price)</option>
                    <option value="variable">Variable Product (Multiple variations like size, color)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {state.formData.productType === 'simple' 
                    ? 'Simple products have a single price and stock quantity' 
                    : 'Variable products have multiple variations (e.g., different sizes or colors)'}
                </p>
            </div>
        </section>

        {/* Step 4: Product Details */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">4</span>
              Product Details
            </h2>
            
            {/* Short Description */}
            <div className="mb-6">
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                name="short_description"
                id="short_description"
                rows="2"
                value={state.formData.short_description}
                onChange={handleChange}
                className={inputStyle}
                placeholder="A brief, attention-grabbing summary (max 160 chars recommended)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
              <textarea
                name="description"
                id="description"
                rows="4"
                value={state.formData.description}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Detailed product information..."
              />
            </div>
        </section>

        {/* Step 5: Pricing & Inventory (Simple Products) */}
        {state.formData.productType === 'simple' && (
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">5</span>
              Pricing & Inventory
            </h2>

            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="regular_price" className="block text-sm font-medium text-gray-700 mb-1">Regular Price <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="regular_price"
                            id="regular_price"
                            value={state.formData.regular_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className={inputStyle}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                        <input
                            type="number"
                            name="sale_price"
                            id="sale_price"
                            value={state.formData.sale_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={inputStyle}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="stock_quantity"
                            id="stock_quantity"
                            value={state.formData.stock_quantity}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                            className={inputStyle}
                            placeholder="1"
                        />
                    </div>
                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="sale_start" className="block text-sm font-medium text-gray-700 mb-1">Sale Start Date</label>
                            <input
                                type="date"
                                name="sale_start"
                                id="sale_start"
                                value={state.formData.sale_start}
                                onChange={handleChange}
                                className={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="sale_end" className="block text-sm font-medium text-gray-700 mb-1">Sale End Date</label>
                            <input
                                type="date"
                                name="sale_end"
                                id="sale_end"
                                value={state.formData.sale_end}
                                onChange={handleChange}
                                className={inputStyle}
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                        <input
                            type="text"
                            name="sku"
                            id="sku"
                            value={state.formData.sku}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="e.g., RUN-SHOE-001"
                        />
                    </div>
                </div>
          </section>
        )}

        {/* Product Attributes - Show for ALL product types */}
        <section className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">5</span>
                    Product Attributes
                </h2>
                {hasMapping && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Filtered by category
                    </span>
                )}
            </div>
            
            {/* Info message based on product type */}
            {state.formData.productType === 'variable' ? (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Variable Product:</strong> Attributes will be used to create variations (e.g., Size: S, M, L)
                    </p>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Simple Product:</strong> Add attributes to describe your product (e.g., RAM: 8GB, Storage: 256GB)
                    </p>
                </div>
            )}
            
            {/* Category selection hint */}
            {state.formData.category_ids.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Please select a category first</strong> to see relevant attributes for your product.
                    </p>
                </div>
            )}
            
            {/* AttributeSelector */}
            {state.formData.category_ids.length > 0 && (
                <>
                    <AttributeSelector
                        globalAttributes={filteredAttributes}
                        selectedAttributes={state.formData.attributes}
                        onChange={(attrs) => dispatch({ type: 'SET_FIELD', field: 'attributes', value: attrs })}
                        productType={state.formData.productType}
                        autoLoadTerms={true}
                    />
                    
                    <p className="mt-2 text-xs text-gray-500">
                        {filteredAttributes.length} attribute{filteredAttributes.length !== 1 ? 's' : ''} available
                        {hasMapping && ` for selected ${state.formData.category_ids.length > 1 ? 'categories' : 'category'}`}
                    </p>
                    
                    {/* Generate Variations Button - Only for variable products */}
                    {state.formData.productType === 'variable' && state.formData.attributes.length > 0 && (
                        <button
                            type="button"
                            onClick={generateVariations}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition duration-150"
                        >
                            Generate Variations
                        </button>
                    )}
                </>
            )}
        </section>

        {/* Variations Section (Variable Products Only) */}
        {state.formData.productType === 'variable' && state.formData.variations.length > 0 && (
            <section className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold mr-3">6</span>
                    Variations ({state.formData.variations.length})
                </h2>
                <p className="text-sm text-gray-500 mb-4">Set price and stock for each variation</p>
                
                <div className="space-y-4">
                    {state.formData.variations.map((variation, index) => (
                        <div key={variation.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">
                                    {variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(' / ')}
                                </h3>
                                <input
                                    type="checkbox"
                                    checked={variation.enabled}
                                    onChange={(e) => handleVariationChange(index, 'enabled', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            
                            {variation.enabled && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                                        <input
                                            type="text"
                                            value={variation.sku}
                                            onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Regular Price *</label>
                                        <input
                                            type="number"
                                            value={variation.regular_price}
                                            onChange={(e) => handleVariationChange(index, 'regular_price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            required
                                            className={inputStyle}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price</label>
                                        <input
                                            type="number"
                                            value={variation.sale_price}
                                            onChange={(e) => handleVariationChange(index, 'sale_price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className={inputStyle}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock *</label>
                                        <input
                                            type="number"
                                            value={variation.stock_quantity}
                                            onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                                            min="0"
                                            step="1"
                                            required
                                            className={inputStyle}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Shipping */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">7</span>
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        id="weight"
                        value={state.formData.weight}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={inputStyle}
                        placeholder="0.5"
                    />
                </div>
                <div>
                    <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                    <input
                        type="number"
                        name="length"
                        id="length"
                        value={state.formData.length}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={inputStyle}
                        placeholder="10"
                    />
                </div>
                <div>
                    <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                    <input
                        type="number"
                        name="width"
                        id="width"
                        value={state.formData.width}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={inputStyle}
                        placeholder="10"
                    />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                        type="number"
                        name="height"
                        id="height"
                        value={state.formData.height}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={inputStyle}
                        placeholder="10"
                    />
                </div>
            </div>
        </section>

        {/* Brands & Locations */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">8</span>
              Brands & Locations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <BrandTreeSelector
                    selectedIds={state.formData.brand_ids}
                    onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'brand_ids', value: ids })}
                    label="Brands (Optional)"
                    brandTree={brandTree}
                />
                {locations.length > 0 && (
                    <HierarchicalSelector
                        items={locations}
                        selectedIds={state.formData.location_ids}
                        onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'location_ids', value: ids })}
                        label="Product Location (Required) *"
                        placeholder="Click to select location..."
                    />
                )}
            </div>
        </section>

        {/* Variations Section (Variable Products Only) */}
        {state.formData.productType === 'variable' && state.formData.variations.length > 0 && (
            <section className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold mr-3">6</span>
                    Variations ({state.formData.variations.length})
                </h2>
                <p className="text-sm text-gray-500 mb-4">Set price and stock for each variation</p>
                
                <div className="space-y-4">
                    {state.formData.variations.map((variation, index) => (
                        <div key={variation.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">
                                    {variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(' / ')}
                                </h3>
                                <input
                                    type="checkbox"
                                    checked={variation.enabled}
                                    onChange={(e) => handleVariationChange(index, 'enabled', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            
                            {variation.enabled && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                                        <input
                                            type="text"
                                            value={variation.sku}
                                            onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Regular Price *</label>
                                        <input
                                            type="number"
                                            value={variation.regular_price}
                                            onChange={(e) => handleVariationChange(index, 'regular_price', e.target.value)}
                                            className={inputStyle}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price</label>
                                        <input
                                            type="number"
                                            value={variation.sale_price}
                                            onChange={(e) => handleVariationChange(index, 'sale_price', e.target.value)}
                                            className={inputStyle}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            value={variation.stock_quantity}
                                            onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                                            className={inputStyle}
                                            placeholder="0"
                                            min="0"
                                            step="1"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Product Images */}
        <section className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">9</span>
              Product Images (Max 4)
            </h2>

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition duration-150 cursor-pointer">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP, AVIF, GIF, SVG up to 10MB</p>
                    <input
                        id="image-upload"
                        name="images"
                        type="file"
                        className="sr-only"
                        onChange={handleChange}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/gif,image/svg+xml"
                        multiple
                        disabled={state.formData.images.length >= 4}
                    />
                </label>
            </div>

            {/* Image Preview */}
            {state.formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {state.formData.images.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-gray-100">
                            <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Product image preview ${index + 1}`}
                                className="object-cover w-full h-full relative z-0"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 z-10"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>


        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isDataLoading}
            className={`w-full sm:w-auto flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg text-sm font-semibold text-white transition duration-300 ${
              isSubmitting || isDataLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Saving Product...
            </> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}