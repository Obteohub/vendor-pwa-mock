// src/components/AttributeSelector.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';

export default function AttributeSelector({ 
  globalAttributes = [], 
  selectedAttributes = [], 
  onChange,
  productType = 'simple',
  autoLoadTerms = true // Auto-load terms when attribute is selected
}) {
  const [attributeTerms, setAttributeTerms] = useState({});
  const [loadingTerms, setLoadingTerms] = useState({});

  // Debug: Log what we receive
  useEffect(() => {
    console.log('AttributeSelector received globalAttributes:', globalAttributes.length, globalAttributes.slice(0, 3));
  }, [globalAttributes]);

  // Auto-load terms for already selected attributes
  useEffect(() => {
    if (autoLoadTerms) {
      selectedAttributes.forEach(attr => {
        if (attr.id && !attributeTerms[attr.id] && !loadingTerms[attr.id]) {
          loadTerms(attr.id);
        }
      });
    }
  }, [selectedAttributes, autoLoadTerms]);

  // Preload terms for filtered attributes (first 5 most common ones)
  useEffect(() => {
    if (autoLoadTerms && globalAttributes.length > 0) {
      // Preload terms for the first few attributes to make them instantly available
      const attributesToPreload = globalAttributes.slice(0, 5);
      attributesToPreload.forEach(attr => {
        if (!attributeTerms[attr.id] && !loadingTerms[attr.id]) {
          loadTerms(attr.id);
        }
      });
    }
  }, [globalAttributes, autoLoadTerms]);

  // Load terms for an attribute
  const loadTerms = async (attributeId) => {
    if (attributeTerms[attributeId] || loadingTerms[attributeId]) return;

    console.log(`[AttributeSelector] Loading terms for attribute ID: ${attributeId}`);
    setLoadingTerms(prev => ({ ...prev, [attributeId]: true }));

    try {
      const url = `/api/vendor/attributes/${attributeId}/terms`;
      console.log(`[AttributeSelector] Fetching from: ${url}`);
      
      const res = await fetch(url);
      console.log(`[AttributeSelector] Response status: ${res.status}`);
      
      const data = await res.json();
      console.log(`[AttributeSelector] Response data:`, data);
      
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: data.terms || []
      }));
      
      console.log(`[AttributeSelector] Loaded ${(data.terms || []).length} terms for attribute ${attributeId}`);
    } catch (error) {
      console.error(`[AttributeSelector] Failed to load terms for attribute ${attributeId}:`, error);
      setAttributeTerms(prev => ({ ...prev, [attributeId]: [] }));
    } finally {
      setLoadingTerms(prev => ({ ...prev, [attributeId]: false }));
    }
  };

  // Add new attribute
  const addAttribute = () => {
    onChange([...selectedAttributes, { id: '', name: '', options: [] }]);
  };

  // Remove attribute
  const removeAttribute = (index) => {
    const updated = selectedAttributes.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Update attribute selection
  const updateAttribute = (index, attributeId) => {
    console.log('[updateAttribute] Called with:', { index, attributeId, type: typeof attributeId });
    console.log('[updateAttribute] globalAttributes:', globalAttributes.length, globalAttributes.slice(0, 2));
    
    const attribute = globalAttributes.find(a => a.id === parseInt(attributeId));
    console.log('[updateAttribute] Found attribute:', attribute);
    
    if (!attribute) {
      console.warn('[updateAttribute] Attribute not found:', attributeId);
      return;
    }

    const updated = [...selectedAttributes];
    updated[index] = {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      options: []
    };
    onChange(updated);

    // Load terms for this attribute
    console.log('[updateAttribute] Loading terms for attribute:', attribute.id);
    loadTerms(attribute.id);
  };

  // Toggle term selection
  const toggleTerm = (index, termName) => {
    const updated = [...selectedAttributes];
    const currentOptions = Array.isArray(updated[index].options) 
      ? updated[index].options 
      : [];

    if (currentOptions.includes(termName)) {
      updated[index].options = currentOptions.filter(t => t !== termName);
    } else {
      updated[index].options = [...currentOptions, termName];
    }

    onChange(updated);
  };

  // Get terms for an attribute
  const getTermsForAttribute = (attributeId) => {
    if (!attributeId) return [];
    return attributeTerms[attributeId] || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Attributes
          {productType === 'variable' && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={addAttribute}
          className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Attribute
        </button>
      </div>

      {productType === 'variable' && (
        <p className="text-xs text-gray-500">
          Attributes are used to create product variations (e.g., Color, Size)
        </p>
      )}

      {/* Attribute list */}
      <div className="space-y-4">
        {selectedAttributes.map((attr, index) => {
          const terms = getTermsForAttribute(attr.id);
          const isLoading = loadingTerms[attr.id];
          const selectedOptions = Array.isArray(attr.options) ? attr.options : [];

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {/* Attribute dropdown */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Attribute
                  </label>
                  <select
                    value={attr.id || ''}
                    onChange={(e) => updateAttribute(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Choose Attribute --</option>
                    {globalAttributes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="mt-6 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove attribute"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Terms selection */}
              {attr.id && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Select Values
                  </label>

                  {isLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                      <Loader2 className="w-4 w-4 animate-spin" />
                      Loading values...
                    </div>
                  ) : terms.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                      No values available for this attribute
                    </div>
                  ) : (
                    <>
                      {/* Search for terms if many */}
                      {terms.length > 20 && (
                        <input
                          type="text"
                          placeholder="Search values..."
                          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm"
                          onChange={(e) => {
                            const search = e.target.value.toLowerCase();
                            const container = e.target.nextElementSibling;
                            const labels = container.querySelectorAll('label');
                            labels.forEach(label => {
                              const text = label.textContent.toLowerCase();
                              label.style.display = text.includes(search) ? 'flex' : 'none';
                            });
                          }}
                        />
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-white border border-gray-200 rounded-lg">
                        {terms.map(term => (
                          <label
                            key={term.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOptions.includes(term.name)}
                              onChange={() => toggleTerm(index, term.name)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{term.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {terms.length} value{terms.length !== 1 ? 's' : ''} available
                      </div>
                    </>
                  )}

                  {selectedOptions.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {selectedOptions.length} value{selectedOptions.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedAttributes.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No attributes added yet. Click "Add Attribute" to get started.
        </div>
      )}
    </div>
  );
}
