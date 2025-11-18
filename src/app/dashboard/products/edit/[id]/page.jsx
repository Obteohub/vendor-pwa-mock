/* -------------------------------------------------------------------------
File: app/dashboard/products/edit/[id]/page.jsx
Purpose: Complete product edit form matching add product functionality
*/

"use client";

import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, AlertCircle } from 'lucide-react';

// Import components from add product page
import CategoryTreeSelector from '@/components/CategoryTreeSelector';
import AttributeSelector from '@/components/AttributeSelector';
import HierarchicalSelector from '@/components/HierarchicalSelector';
import BrandTreeSelector from '@/components/BrandTreeSelector';
import { useLocalData } from '@/hooks/useLocalData';

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

  // Load data from local storage (IndexedDB) - instant access!
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

  // Memoize filtered attributes - only recalculate when category IDs change (instant!)
  const filteredAttributes = useMemo(() => {
    return getAttributesForCategories(state.formData.category_ids);
  }, [state.formData.category_ids, getAttributesForCategories]);
  
  // Check if attributes are filtered - memoized
  const hasMapping = useMemo(() => {
    return state.formData.category_ids.length > 0 && 
           filteredAttributes.length < globalAttributes.length;
  }, [state.formData.category_ids.length, filteredAttributes.length, globalAttributes.length]);

  // Load product data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load product data
        const productRes = await fetch(`/api/vendor/products/${productId}`);
        
        if (!productRes.ok) {
          const errorData = await productRes.json();
          throw new Error(errorData.error || 'Failed to load product');
        }

        const product = await productRes.json();
        console.log('Product data loaded:', product);

        // Set product data
        dispatch({ type: 'SET_FORM', payload: {
          name: product.name || '',
          productType: product.type || 'simple',
          short_description: product.short_description || '',
          description: product.description || '',
          sku: product.sku || '',
          regular_price: product.regular_price || '',
          sale_price: product.sale_price || '',
          stock_quantity: product.stock_quantity?.toString() || '',
          weight: product.weight || '',
          length: product.dimensions?.length || '',
          width: product.dimensions?.width || '',
          height: product.dimensions?.height || '',
          category_ids: product.categories?.map(c => c.id) || [],
          brand_ids: product.brands?.map(b => b.id) || [],
          location_ids: product.locations?.map(l => l.id) || [],
          attributes: product.attributes || [],
          variations: product.variations || [],
          images: product.images || []
        }});

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
    
    dispatch({ type: 'SET_STATUS', payload: 'loading' });
    dispatch({ type: 'SET_MESSAGE', payload: 'Updating product...' });

    try {
      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      dispatch({ type: 'SET_STATUS', payload: 'success' });
      dispatch({ type: 'SET_MESSAGE', payload: 'Product updated successfully!' });

      setTimeout(() => {
        router.push('/dashboard/products');
      }, 1500);

    } catch (error) {
      console.error('Error updating product:', error);
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ type: 'SET_MESSAGE', payload: error.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name, value });
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading product...</span>
      </div>
    );
  }

  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Update product information</p>
        </div>
      </div>

      {/* Status Message */}
      {state.message && (
        <div className={`mb-6 p-4 rounded-lg ${
          state.status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          state.status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {state.status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            {state.status === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{state.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={state.formData.name}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <select
                name="productType"
                value={state.formData.productType}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={state.formData.sku}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Product SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                name="short_description"
                value={state.formData.short_description}
                onChange={handleChange}
                rows={3}
                className={inputStyle}
                placeholder="Brief product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
              <textarea
                name="description"
                value={state.formData.description}
                onChange={handleChange}
                rows={6}
                className={inputStyle}
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regular Price (GH₵) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="regular_price"
                value={state.formData.regular_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputStyle}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (GH₵)</label>
              <input
                type="number"
                name="sale_price"
                value={state.formData.sale_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={inputStyle}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={state.formData.stock_quantity}
                onChange={handleChange}
                required
                min="0"
                className={inputStyle}
                placeholder="0"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <CategoryTreeSelector
            categoryTree={categoryTree}
            selectedIds={state.formData.category_ids}
            onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'category_ids', value: ids })}
          />
          
          {state.formData.category_ids.length > 0 && hasMapping && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Category selected! Relevant attributes filtered for this category.
              </p>
            </div>
          )}
        </section>

        {/* Brands */}
        {brands.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Brands</h2>
            <BrandTreeSelector
              brandTree={brandTree}
              selectedIds={state.formData.brand_ids}
              onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'brand_ids', value: ids })}
            />
          </section>
        )}

        {/* Locations */}
        {locations.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations</h2>
            <HierarchicalSelector
              items={locations}
              selectedIds={state.formData.location_ids}
              onChange={(ids) => dispatch({ type: 'SET_FIELD', field: 'location_ids', value: ids })}
              label="Select Locations"
            />
          </section>
        )}

        {/* Attributes */}
        {state.formData.category_ids.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Attributes</h2>
              {hasMapping && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Filtered by category
                </span>
              )}
            </div>
            
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
          </section>
        )}

        {/* Shipping Dimensions */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Dimensions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={state.formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={inputStyle}
                placeholder="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
              <input
                type="number"
                name="length"
                value={state.formData.length}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={inputStyle}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
              <input
                type="number"
                name="width"
                value={state.formData.width}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={inputStyle}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
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

        {/* Submit Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={state.status === 'loading'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Product
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
