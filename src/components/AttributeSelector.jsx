// src/components/AttributeSelector.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Search, ChevronRight } from 'lucide-react';

function AttributeSelector({ 
  globalAttributes = [], 
  selectedAttributes = [], 
  onChange,
  productType = 'simple',
  autoLoadTerms = true // Auto-load terms when attribute is selected
}) {
  const [attributeTerms, setAttributeTerms] = useState({});
  const [loadingTerms, setLoadingTerms] = useState({});
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [activeTermModalIndex, setActiveTermModalIndex] = useState(null);
  const [termSearchQuery, setTermSearchQuery] = useState('');
  const [attributeSearchQuery, setAttributeSearchQuery] = useState('');

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
      
      const res = await fetch(url, { credentials: 'include' });
      console.log(`[AttributeSelector] Response status: ${res.status}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AttributeSelector] HTTP ${res.status}:`, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log(`[AttributeSelector] Response data:`, data);
      
      const terms = data.terms || [];
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: terms
      }));
      
      console.log(`[AttributeSelector] ✓ Loaded ${terms.length} terms for attribute ${attributeId}`);
      
      if (terms.length === 0) {
        console.warn(`[AttributeSelector] ⚠️ No terms found for attribute ${attributeId}. This attribute might not have any values configured in WooCommerce.`);
      }
    } catch (error) {
      console.error(`[AttributeSelector] ✗ Failed to load terms for attribute ${attributeId}:`, error);
      setAttributeTerms(prev => ({ ...prev, [attributeId]: [] }));
    } finally {
      setLoadingTerms(prev => ({ ...prev, [attributeId]: false }));
    }
  };

  // Add new attribute
  const handleAddAttribute = (attribute) => {
    // Check if already added
    if (selectedAttributes.some(a => a.id === attribute.id)) {
      alert('Attribute already added');
      return;
    }

    const newAttr = {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      options: []
    };
    
    onChange([...selectedAttributes, newAttr]);
    loadTerms(attribute.id);
    setIsAttributeModalOpen(false);
    setAttributeSearchQuery('');
  };

  // Remove attribute
  const removeAttribute = (index) => {
    const updated = selectedAttributes.filter((_, i) => i !== index);
    onChange(updated);
  };
  
  // Toggle term selection
  const toggleTerm = (index, termName) => {
    const updated = [...selectedAttributes];
    const currentOptions = Array.isArray(updated[index].options) 
      ? updated[index].options 
      : [];

    const isSelected = currentOptions.includes(termName);
    if (isSelected) {
      updated[index].options = currentOptions.filter(t => t !== termName);
    } else {
      updated[index].options = [...currentOptions, termName];
    }

    onChange(updated);
    
    // Auto-close on selection
    if (!isSelected) {
      setActiveTermModalIndex(null);
    }
  };

  // Get terms for an attribute
  const getTermsForAttribute = (attributeId) => {
    if (!attributeId) return [];
    return attributeTerms[attributeId] || [];
  };
  
  // Filtered attributes for modal
  const filteredGlobalAttributes = globalAttributes.filter(a => 
    a.name.toLowerCase().includes(attributeSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Attributes
          {productType === 'variable' && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsAttributeModalOpen(true)}
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
      <div className="space-y-3">
        {selectedAttributes.map((attr, index) => {
          const terms = getTermsForAttribute(attr.id);
          const isLoading = loadingTerms[attr.id];
          const selectedOptions = Array.isArray(attr.options) ? attr.options : [];

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900">{attr.name}</div>
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                    setActiveTermModalIndex(index);
                    setTermSearchQuery('');
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-gray-400 transition-all text-sm"
              >
                <span className={selectedOptions.length ? "text-gray-900" : "text-gray-500"}>
                  {selectedOptions.length > 0 
                    ? `${selectedOptions.length} selected` 
                    : "Select values..."}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              {selectedOptions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedOptions.slice(0, 5).map(opt => (
                    <span key={opt} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                      {opt}
                    </span>
                  ))}
                  {selectedOptions.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{selectedOptions.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedAttributes.length === 0 && (
        <div 
            onClick={() => setIsAttributeModalOpen(true)}
            className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          No attributes added yet. Tap to add.
        </div>
      )}

      {/* Attribute Selection Modal */}
      {isAttributeModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsAttributeModalOpen(false)} />
          <div className="fixed inset-0 z-[100] bg-white sm:absolute sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[80vh] sm:rounded-xl flex flex-col animate-in fade-in zoom-in-95 duration-200 sm:z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Attribute</h3>
              <button onClick={() => setIsAttributeModalOpen(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search attributes..."
                        value={attributeSearchQuery}
                        onChange={e => setAttributeSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {filteredGlobalAttributes.length > 0 ? (
                    filteredGlobalAttributes.map(attr => {
                        const isAdded = selectedAttributes.some(a => a.id === attr.id);
                        return (
                            <button
                                key={attr.id}
                                onClick={() => handleAddAttribute(attr)}
                                disabled={isAdded}
                                className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-colors ${isAdded ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <span className="font-medium text-gray-900">{attr.name}</span>
                                {isAdded && <span className="text-xs text-gray-500">Added</span>}
                            </button>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">No attributes found</div>
                )}
            </div>
          </div>
        </>
      )}

      {/* Terms Selection Modal */}
      {activeTermModalIndex !== null && (
        (() => {
            const attr = selectedAttributes[activeTermModalIndex];
            const terms = getTermsForAttribute(attr.id);
            const selectedOptions = Array.isArray(attr.options) ? attr.options : [];
            const filteredTerms = terms.filter(t => t.name.toLowerCase().includes(termSearchQuery.toLowerCase()));

            return (
                <>
                  <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setActiveTermModalIndex(null)} />
                  <div className="fixed inset-0 z-50 bg-white sm:absolute sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[80vh] sm:rounded-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Select {attr.name}</h3>
                      <button onClick={() => setActiveTermModalIndex(null)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder={`Search ${attr.name}...`}
                                value={termSearchQuery}
                                onChange={e => setTermSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingTerms[attr.id] ? (
                             <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                <span className="ml-2 text-sm text-gray-600">Loading values...</span>
                             </div>
                        ) : filteredTerms.length > 0 ? (
                            <div className="space-y-1">
                                {filteredTerms.map(term => {
                                    const isSelected = selectedOptions.includes(term.name);
                                    return (
                                        <label key={term.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleTerm(activeTermModalIndex, term.name)}
                                                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-900">{term.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {terms.length === 0 ? "No values available for this attribute." : "No matching values found."}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 bg-white pb-safe">
                      <button
                        type="button"
                        onClick={() => setActiveTermModalIndex(null)}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm"
                      >
                        Done ({selectedOptions.length})
                      </button>
                    </div>
                  </div>
                </>
            );
        })()
      )}
    </div>
  );
}

// Memoize to prevent re-renders on every keystroke in parent form
export default React.memo(AttributeSelector);
