/* -------------------------------------------------------------------------
File: app/dashboard/products/edit/[id]/page.jsx
Purpose: Robust product edit form with image management, variations, and full population
------------------------------------------------------------------------- */

"use client";

import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, AlertCircle, Upload, X, CheckCircle, RefreshCw } from 'lucide-react';
import LoadingDots from '@/components/LoadingDots';

// Import components
import CategoryTreeSelector from '@/components/CategoryTreeSelector';
import AttributeSelector from '@/components/AttributeSelector';
import LocationSelector from '@/components/LocationSelector';
import BrandTreeSelector from '@/components/BrandTreeSelector';
import RichTextEditor from '@/components/RichTextEditor';
import { useLocalData } from '@/hooks/useLocalData';
import { stripHtml } from '@/lib/string-utils';

// Initial state
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
    manage_stock: false,
    weight: "",
    length: "",
    width: "",
    height: "",
    category_ids: [],
    brand_ids: [],
    location_ids: [],
    attributes: [],
    variations: [],
    images: [] // Mixed: {id, src} objects for existing, File objects for new
  },
  status: 'idle',
  loading: true,
  message: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FORM': return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'SET_FIELD': return { ...state, formData: { ...state.formData, [action.field]: action.value } };
    case 'SET_STATUS': return { ...state, status: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_MESSAGE': return { ...state, message: action.payload };
    default: return state;
  }
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [state, dispatch] = useReducer(reducer, initialState);

  // Load local metadata
  const {
    categories,
    brands,
    attributes: globalAttributes,
    locations,
    categoryTree,
    brandTree,
    getAttributesForCategories,
    loading: isDataLoading
  } = useLocalData();

  // Memoize filtered attributes
  const filteredAttributes = useMemo(() => {
    return getAttributesForCategories(state.formData.category_ids);
  }, [state.formData.category_ids, getAttributesForCategories]);

  const hasMapping = useMemo(() => {
    return state.formData.category_ids.length > 0 &&
      filteredAttributes.length < globalAttributes.length;
  }, [state.formData.category_ids.length, filteredAttributes.length, globalAttributes.length]);

  // Load product data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const productRes = await fetch(`/api/vendor/products/${productId}`);

        if (!productRes.ok) {
          const errorData = await productRes.json();
          throw new Error(errorData.error || 'Failed to load product');
        }

        const product = await productRes.json();

        // Map product data to form state
        const stockQty = product.stock_quantity ?? product.quantity ?? product.stock;
        const isStockManaged = product.manage_stock === true || product.manage_stock === 'yes' || (stockQty !== null && stockQty !== undefined);

        dispatch({
          type: 'SET_FORM', payload: {
            name: product.name || '',
            productType: product.type || 'simple',
            short_description: product.short_description || '',
            description: product.description || '',
            sku: product.sku || '',
            regular_price: product.regular_price || product.price || '',
            sale_price: product.sale_price || '',
            manage_stock: isStockManaged,
            stock_quantity: (stockQty !== null && stockQty !== undefined) ? stockQty.toString() : '',
            weight: product.weight || '',
            length: product.dimensions?.length || '',
            width: product.dimensions?.width || '',
            height: product.dimensions?.height || '',
            category_ids: product.categories?.map(c => typeof c === 'object' ? c.id : c) || [],
            brand_ids: product.brands?.map(b => typeof b === 'object' ? b.id : b) || [],
            location_ids: product.locations?.map(l => typeof l === 'object' ? l.id : l) || [],
            attributes: Array.isArray(product.attributes) ? product.attributes : [],
            variations: Array.isArray(product.variations) ? product.variations.map(v => ({
              ...v,
              stock_quantity: (v.stock_quantity ?? v.quantity ?? '').toString()
            })) : [],
            images: Array.isArray(product.images) ? product.images : []
          }
        });

        dispatch({ type: 'SET_LOADING', payload: false });

      } catch (error) {
        console.error('Error loading product:', error);
        dispatch({ type: 'SET_MESSAGE', payload: error.message });
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, [productId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Submit triggered for Product #', productId);
    console.log('📦 Form Data Snapshot:', state.formData);

    dispatch({ type: 'SET_STATUS', payload: 'loading' });
    dispatch({ type: 'SET_MESSAGE', payload: 'Updating product...' });

    try {
      const dataToSend = new FormData();

      // Core fields
      dataToSend.append('name', state.formData.name || '');
      dataToSend.append('productType', state.formData.productType || 'simple');
      dataToSend.append('regular_price', state.formData.regular_price || '0');
      dataToSend.append('sale_price', state.formData.sale_price || '');
      dataToSend.append('stock_quantity', state.formData.stock_quantity || '0');
      dataToSend.append('description', state.formData.description || '');
      dataToSend.append('short_description', state.formData.short_description || '');
      dataToSend.append('sku', state.formData.sku || '');
      dataToSend.append('weight', state.formData.weight);
      dataToSend.append('length', state.formData.length);
      dataToSend.append('width', state.formData.width);
      dataToSend.append('height', state.formData.height);
      dataToSend.append('manage_stock', 'true');

      // JSON fields
      dataToSend.append('category_ids_json', JSON.stringify(state.formData.category_ids));
      dataToSend.append('brand_ids_json', JSON.stringify(state.formData.brand_ids));
      dataToSend.append('location_ids_json', JSON.stringify(state.formData.location_ids));
      dataToSend.append('attributes_json', JSON.stringify(state.formData.attributes));
      dataToSend.append('variations_json', JSON.stringify(state.formData.variations));

      // Separate images
      const existingImages = state.formData.images.filter(img => !(img instanceof File));
      const newImages = state.formData.images.filter(img => img instanceof File);

      dataToSend.append('existing_images_json', JSON.stringify(existingImages));
      newImages.forEach(file => dataToSend.append('images[]', file));

      // Use POST with _method="PUT" to support FormData
      dataToSend.append('_method', 'PUT');

      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: 'POST',
        body: dataToSend
      });

      console.log('📡 Response status:', res.status);

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        console.error('❌ Failed to parse JSON response:', text.slice(0, 500));
        throw new Error(`Server returned invalid response (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Failed to update product (Status ${res.status})`);
      }

      dispatch({ type: 'SET_STATUS', payload: 'success' });
      dispatch({ type: 'SET_MESSAGE', payload: 'Product updated successfully!' });

      setTimeout(() => {
        router.push('/dashboard/products');
      }, 1500);

    } catch (error) {
      console.error('❌ Error updating product:', error);
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ type: 'SET_MESSAGE', payload: error.message || 'An unexpected error occurred' });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images" && files) {
      const currentImages = state.formData.images;
      const addedFiles = Array.from(files);
      const updatedImages = [...currentImages, ...addedFiles].slice(0, 4);
      dispatch({ type: 'SET_FIELD', field: 'images', value: updatedImages });
      e.target.value = null;
    } else {
      dispatch({ type: 'SET_FIELD', field: name, value });
    }
  };

  const removeImage = (index) => {
    const updated = state.formData.images.filter((_, i) => i !== index);
    dispatch({ type: 'SET_FIELD', field: 'images', value: updated });
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...state.formData.variations];
    updated[index] = { ...updated[index], [field]: value };
    dispatch({ type: 'SET_FIELD', field: 'variations', value: updated });
  };

  const generateVariations = () => {
    const validAttrs = state.formData.attributes.filter(attr => attr.name.trim() && attr.options.length > 0);
    if (validAttrs.length === 0) {
      dispatch({ type: 'SET_MESSAGE', payload: 'Please add attributes with options first.' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return;
    }

    const attrOptions = validAttrs.map(attr => ({
      name: attr.name,
      options: Array.isArray(attr.options) ? attr.options : []
    }));

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

      // Try to preserve existing variation data if attributes match
      const existing = state.formData.variations.find(v =>
        v.attributes.every((a, i) => a.option === attributes[i].option)
      );

      return existing || {
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

  const handleAttributeChange = useCallback((attrs) => {
    dispatch({ type: 'SET_FIELD', field: 'attributes', value: attrs });
  }, []);

  const handleCategoryChange = useCallback((ids) => {
    dispatch({ type: 'SET_FIELD', field: 'category_ids', value: ids });
  }, []);

  const handleBrandChange = useCallback((ids) => {
    dispatch({ type: 'SET_FIELD', field: 'brand_ids', value: ids });
  }, []);

  const handleLocationChange = useCallback((ids) => {
    dispatch({ type: 'SET_FIELD', field: 'location_ids', value: ids });
  }, []);

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-64 rounded-xl">
        <LoadingDots size="lg" className="mb-4" />
        <span className="text-gray-600 font-medium tracking-tight">Accessing Product Records...</span>
      </div>
    );
  }

  const inputStyle = "w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white font-medium text-sm md:text-base placeholder-gray-400 shadow-sm";

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10 p-4 md:p-0">
        <button
          onClick={() => router.back()}
          className="p-2 md:p-3 hover:bg-white hover:shadow-sm rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-gray-200 bg-white/50 md:bg-transparent"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Edit Product</h1>
          <p className="text-gray-500 font-medium text-xs md:text-sm">Refine your product catalog details</p>
        </div>
      </div>

      {state.message && (
        <div className={`mb-10 p-5 rounded-none md:rounded-2xl shadow-sm border animate-in fade-in slide-in-from-top-2 ${state.status === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
          state.status === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-indigo-50 text-indigo-800 border-indigo-100 shadow-indigo-100/50'
          }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {state.status === 'loading' ? <LoadingDots size="sm" /> :
                state.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                  state.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : null}
            </div>
            <span className="font-bold text-sm md:text-base">{state.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-0 md:space-y-10 pb-32">
        {/* Section 1: Basic Information */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">1</div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Basic Profile</h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Product Name *</label>
              <input type="text" name="name" value={state.formData.name} onChange={handleChange} required className={inputStyle} placeholder="Name of your product" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Product Type</label>
                <select name="productType" value={state.formData.productType} onChange={handleChange} className={inputStyle}>
                  <option value="simple">Simple Product</option>
                  <option value="variable">Variable Product</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">SKU</label>
                <input type="text" name="sku" value={state.formData.sku} onChange={handleChange} className={inputStyle} placeholder="Internal Stock ID" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Short Description</label>
                <span className={`text-xs ml-auto ${stripHtml(state.formData.short_description).length > 255 ? 'text-red-500' : 'text-gray-400'}`}>{stripHtml(state.formData.short_description).length}/255</span>
              </div>
              <RichTextEditor
                value={state.formData.short_description}
                onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'short_description', value: val })}
                placeholder="Brief highlight"
                height="h-32"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Full Description</label>
                <span className={`text-xs ml-auto ${stripHtml(state.formData.description).length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>{stripHtml(state.formData.description).length}/2000</span>
              </div>
              <RichTextEditor
                value={state.formData.description}
                onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'description', value: val })}
                placeholder="Detailed product story"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Pricing & Stock */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">2</div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Market & Inventory</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Regular Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-base">GH₵</span>
                <input type="number" name="regular_price" value={state.formData.regular_price} onChange={handleChange} required min="0" step="0.01" className={`${inputStyle} pl-14`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Sale Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-base">GH₵</span>
                <input type="number" name="sale_price" value={state.formData.sale_price} onChange={handleChange} min="0" step="0.01" className={`${inputStyle} pl-14`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Total Stock</label>
              <input type="number" name="stock_quantity" value={state.formData.stock_quantity} onChange={handleChange} min="0" className={inputStyle} placeholder="Items in hand" />
            </div>
          </div>
        </section>

        {/* Section 3: Categories & Branding */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">3</div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Organization</h2>
          </div>

          <div className="space-y-8">
            <CategoryTreeSelector
              label="Product Category"
              selectedIds={state.formData.category_ids}
              onChange={handleCategoryChange}
              categoryTree={categoryTree}
              loading={isDataLoading}
              closeOnSelect={true}
            />
            <BrandTreeSelector
              brandTree={brandTree}
              selectedIds={state.formData.brand_ids}
              onChange={handleBrandChange}
              loading={isDataLoading}
            />
            <LocationSelector 
              locations={locations} 
              selectedIds={state.formData.location_ids} 
              onChange={handleLocationChange} 
              label="Pickup Locations" 
              loading={isDataLoading}
            />
          </div>
        </section>

        {/* Section 4: Attributes */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">4</div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Technical Attributes</h2>
            </div>
            {hasMapping && <span className="text-[10px] font-black bg-green-600 text-white px-3 py-1.5 rounded-none md:rounded-lg uppercase tracking-widest">Optimized for Category</span>}
          </div>
          <AttributeSelector globalAttributes={filteredAttributes} selectedAttributes={state.formData.attributes} onChange={handleAttributeChange} productType={state.formData.productType} autoLoadTerms={true} />
        </section>

        {/* Section 5: Variations (If Variable) */}
        {state.formData.productType === 'variable' && (
          <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100">5</div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Product Variations</h2>
              </div>
              <button type="button" onClick={generateVariations} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                <RefreshCw className="w-4 h-4" />
                Re-generate Grid
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {state.formData.variations.length > 0 ? (
                state.formData.variations.map((v, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-none md:rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-black text-gray-900">{v.attributes.map(a => a.option).join(' / ')}</p>
                      <input type="checkbox" checked={v.enabled} onChange={(e) => handleVariationChange(i, 'enabled', e.target.checked)} className="w-5 h-5 rounded-md accent-blue-600" />
                    </div>
                    {v.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">GHS</span>
                          <input type="number" value={v.regular_price} onChange={(e) => handleVariationChange(i, 'regular_price', e.target.value)} className={`${inputStyle} pl-12 text-sm`} placeholder="Price" />
                        </div>
                        <input type="number" value={v.stock_quantity} onChange={(e) => handleVariationChange(i, 'stock_quantity', e.target.value)} className={`${inputStyle} text-sm`} placeholder="Stock Qty" />
                        <input type="text" value={v.sku} onChange={(e) => handleVariationChange(i, 'sku', e.target.value)} className={`${inputStyle} text-sm col-span-1 sm:col-span-2 lg:col-span-1`} placeholder="Variation SKU" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-none md:rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-bold mb-4">No variations generated yet.</p>
                  <button type="button" onClick={generateVariations} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-none md:rounded-xl shadow-lg shadow-blue-100">Generate Combos Now</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 6: Media */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">6</div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Visual Identity</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center px-6 pt-12 pb-12 border-2 border-gray-100 border-dashed rounded-none md:rounded-[32px] hover:border-indigo-300 transition-all cursor-pointer bg-gray-50/50 group">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="p-5 bg-white rounded-none md:rounded-3xl shadow-xl group-hover:scale-110 transition-transform mb-4">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-lg font-black text-gray-900 mb-1">Upload Gallery</p>
                <p className="text-sm text-gray-500 font-medium">Up to 4 images max. Best at 1000x1000px.</p>
                <input id="image-upload" name="images" type="file" className="sr-only" onChange={handleChange} accept="image/*" multiple disabled={state.formData.images.length >= 4} />
              </label>
            </div>

            {state.formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8">
                {state.formData.images.map((img, index) => {
                  const isExisting = !(img instanceof File);
                  const displayUrl = isExisting ? (img.src || img.source_url) : URL.createObjectURL(img);
                  return (
                    <div key={index} className="relative aspect-square rounded-2xl md:rounded-[32px] overflow-hidden border-2 border-white shadow-xl group transition-transform hover:scale-105 active:scale-95">
                      <img src={displayUrl} alt="Preview" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(index)} className="p-2 md:p-3 bg-red-500 text-white rounded-lg md:rounded-2xl hover:bg-red-600 transition-colors shadow-2xl scale-75 group-hover:scale-100">
                          <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                      </div>
                      {isExisting && <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 text-[8px] md:text-[10px] font-black text-indigo-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl uppercase tracking-widest backdrop-blur-md">Cloud</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 7: Shipping */}
        <section className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-sm p-4 md:p-8 border-b md:border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-none md:rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100">7</div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Parcel Dimensions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Weight (kg)</label>
              <input type="number" name="weight" value={state.formData.weight} onChange={handleChange} min="0" step="0.01" className={inputStyle} placeholder="0.5" />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Length (cm)</label>
              <input type="number" name="length" value={state.formData.length} onChange={handleChange} min="0" step="0.01" className={inputStyle} placeholder="10.0" />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Width (cm)</label>
              <input type="number" name="width" value={state.formData.width} onChange={handleChange} min="0" step="0.01" className={inputStyle} placeholder="10.0" />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Height (cm)</label>
              <input type="number" name="height" value={state.formData.height} onChange={handleChange} min="0" step="0.01" className={inputStyle} placeholder="10.0" />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="fixed bottom-[76px] md:bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 backdrop-blur-2xl border-t border-gray-100 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe">
          <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-6">
            <button type="button" onClick={() => router.back()} className="px-4 md:px-8 py-3.5 md:py-4 bg-gray-50 text-gray-900 font-black rounded-xl md:rounded-2xl hover:bg-gray-200 transition-all border border-gray-200 active:scale-95 text-[10px] md:text-sm uppercase tracking-widest">Discard</button>
            <button type="submit" disabled={state.status === 'loading'} className="flex-1 flex items-center justify-center gap-2 md:gap-4 px-6 md:px-10 py-3.5 md:py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-200 active:scale-[0.98] text-[10px] md:text-sm uppercase tracking-widest">
              {state.status === 'loading' ? (
                <>
                  <LoadingDots size="sm" />
                  <span className="hidden md:inline">Processing Update...</span>
                  <span className="md:hidden">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
