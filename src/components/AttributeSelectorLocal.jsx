// src/components/AttributeSelectorLocal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Loader2, Search, Check } from 'lucide-react';
import { useCollapsibleAttributes } from '@/hooks/useCollapsibleAttributes';
import { useLocalData } from '@/hooks/useLocalData';

export default function AttributeSelectorLocal({
  globalAttributes = [],
  selectedAttributes = [],
  onChange,
  productType = 'simple',
  productId // Add productId for localStorage key
}) {
  const { attributeTerms, fetchAttributeTerms } = useLocalData();
  const [loadingTerms, setLoadingTerms] = useState({});
  const [errorStates, setErrorStates] = useState({}); // Track errors per attribute
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use shared collapsible attributes hook
  const {
    collapsedAttributes,
    manuallyClosedAttributes,
    activeAttributeIndex,
    toggleAttributeCollapse,
    setActiveAttribute,
    restoreCollapsedState,
    initializeNewAttribute,
    removeAttributeState
  } = useCollapsibleAttributes(productId);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (activeModalIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModalIndex]);

  // Fetch terms for a specific attribute via global hook
  const loadTermsForAttribute = async (attributeId, force = false) => {
    if (!attributeId) return;

    // Only show loading if we don't have terms already
    const hasTerms = attributeTerms[attributeId] && attributeTerms[attributeId].length > 0;
    if (!hasTerms || force) {
      setLoadingTerms(prev => ({ ...prev, [attributeId]: true }));
    }

    setErrorStates(prev => ({ ...prev, [attributeId]: null }));

    try {
      await fetchAttributeTerms(attributeId, force);
      setErrorStates(prev => ({ ...prev, [attributeId]: null }));
    } catch (error) {
      setErrorStates(prev => ({
        ...prev,
        [attributeId]: error.message || 'Failed to load attribute values'
      }));
    } finally {
      setLoadingTerms(prev => ({ ...prev, [attributeId]: false }));
    }
  };

  // Load terms for already selected attributes on mount
  useEffect(() => {
    // Restore collapsed state from localStorage
    restoreCollapsedState();

    selectedAttributes.forEach(attr => {
      if (attr.id) {
        loadTermsForAttribute(attr.id);
      }
    });
  }, []); // Only run on mount

  // Add new attribute - only from WooCommerce list
  const addAttribute = () => {
    // Only allow adding if there are available attributes from WooCommerce
    const usedAttributeIds = selectedAttributes.map(a => a.id).filter(Boolean);
    const availableAttributes = globalAttributes.filter(a => !usedAttributeIds.includes(a.id));

    if (availableAttributes.length === 0) {
      return; // No more attributes available from WooCommerce
    }

    // Pre-select the first available attribute
    const firstAvailable = availableAttributes[0];
    const newAttribute = {
      id: firstAvailable.id,
      name: firstAvailable.name,
      slug: firstAvailable.slug,
      options: []
    };

    onChange([...selectedAttributes, newAttribute]);
    // Fetch terms for the new attribute
    loadTermsForAttribute(firstAvailable.id);
  };

  // Remove attribute
  const removeAttribute = (index) => {
    const updated = selectedAttributes.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Update attribute selection (when user picks from dropdown)
  const updateAttribute = (index, attributeId) => {
    const attribute = globalAttributes.find(a => String(a.id) === String(attributeId));
    if (!attribute) return;

    const updated = [...selectedAttributes];
    updated[index] = {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      options: []
    };
    onChange(updated);

    // Fetch terms for this attribute
    loadTermsForAttribute(attribute.id);
    // Open modal for term selection immediately if attribute is picked
    setActiveModalIndex(index);
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

      // Auto-close on selection
      setActiveModalIndex(null);
      setSearchTerm('');
    }

    onChange(updated);
  };

  // Get terms for an attribute
  const getTermsForAttribute = (attributeId) => {
    if (!attributeId) return [];

    // First check if terms are already in the attribute object (derived attributes)
    const attr = globalAttributes.find(a => String(a.id) === String(attributeId));
    if (attr && attr.options && attr.options.length > 0) {
      // Convert string options to term-like objects if needed
      return attr.options.map((opt, idx) => ({
        id: `local-${idx}`,
        name: opt,
        slug: opt.toLowerCase().replace(/\s+/g, '-')
      }));
    }

    return attributeTerms[attributeId] || [];
  };

  return (
    <div className="space-y-4">
      {/* Term Selection Modal Overlay */}
      {activeModalIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveModalIndex(null);
                  setSearchTerm('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  Select {selectedAttributes[activeModalIndex].name}
                </h3>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                  {selectedAttributes[activeModalIndex].options.length} Selected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModalIndex(null);
                setSearchTerm('');
              }}
              className="px-6 py-2.5 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm shadow-sm active:scale-95"
            >
              Done
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingTerms[selectedAttributes[activeModalIndex].id] && getTermsForAttribute(selectedAttributes[activeModalIndex].id).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-slate-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Loading selection values...</p>
              </div>
            ) : errorStates[selectedAttributes[activeModalIndex].id] && getTermsForAttribute(selectedAttributes[activeModalIndex].id).length === 0 ? (
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                <p className="text-red-700 font-medium mb-4">⚠️ {errorStates[selectedAttributes[activeModalIndex].id]}</p>
                <button
                  onClick={() => loadTermsForAttribute(selectedAttributes[activeModalIndex].id, true)}
                  className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl shadow-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Search Bar */}
                {getTermsForAttribute(selectedAttributes[activeModalIndex].id).length > 8 && (
                  <div className="relative group sticky top-0 z-10 bg-white pb-2 pt-1">
                    <Search className="absolute left-4 top-[18px] w-5 h-5 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedAttributes[activeModalIndex].name.toLowerCase()}...`}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 focus:border-slate-600 focus:ring-2 focus:ring-slate-100 rounded-xl transition-all outline-none font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}

                {/* Terms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getTermsForAttribute(selectedAttributes[activeModalIndex].id)
                    .filter(term => term.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(term => {
                      const isSelected = selectedAttributes[activeModalIndex].options.includes(term.name);
                      return (
                        <label
                          key={term.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none group shadow-sm ${isSelected
                            ? 'border-slate-600 bg-slate-50'
                            : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-slate-600 border-slate-600' : 'bg-white border-gray-300 rotate-45 group-hover:rotate-0'
                            }`}>
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => toggleTerm(activeModalIndex, term.name)}
                          />
                          <span className={`text-sm ${isSelected ? 'text-slate-900 font-semibold' : 'text-gray-700 font-medium'}`}>
                            {term.name}
                          </span>
                        </label>
                      );
                    })}
                </div>

                {getTermsForAttribute(selectedAttributes[activeModalIndex].id).length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-medium">
                    No values found for this attribute.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Top Header: Badge and Title */}
      <div className="flex items-center justify-between mb-2">
        {productType === 'variable' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">
              Variable Mode
            </span>
          </div>
        )}
      </div>

      {productType === 'variable' && (
        <p className="text-xs text-gray-500">
          Attributes are used to create product variations (e.g., Color, Size)
        </p>
      )}

      {/* Attribute list */}
      <div className="space-y-4">
        {selectedAttributes.map((attr, index) => {
          const selectedOptions = Array.isArray(attr.options) ? attr.options : [];

          return (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden group shadow-sm">
              {/* Attribute Header - Always Visible */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (attr.id) {
                    setActiveModalIndex(index);
                  } else {
                    toggleAttributeCollapse(index);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Action Toggle (Collapse or Edit) */}
                  <div className="p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm group-hover:border-slate-400 transition-colors">
                    {attr.id ? (
                      <Plus className="w-4 h-4 text-slate-600" />
                    ) : (
                      collapsedAttributes[index] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {/* Attribute Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {attr.name || 'Select Attribute'}
                      </span>
                      {attr.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingIndex(editingIndex === index ? null : index);
                          }}
                          className="p-1 text-gray-400 hover:text-slate-600 hover:bg-slate-50 text-slate-700 rounded transition-colors"
                          title="Change attribute type"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${editingIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      {selectedOptions.length > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {selectedOptions.length}
                        </span>
                      )}
                    </div>
                    {selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedOptions.slice(0, 10).map((opt, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100 shadow-sm"
                          >
                            {opt}
                          </span>
                        ))}
                        {selectedOptions.length > 10 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500">
                            +{selectedOptions.length - 10} more
                          </span>
                        )}
                      </div>
                    )}
                    {!attr.id && (
                      <p className="text-xs text-gray-500 mt-1 italic">Click to choose which attribute to add</p>
                    )}
                  </div>
                </div>

                {/* Remove button - Always Visible */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttribute(index);
                  }}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-all"
                  title="Remove attribute"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Expandable Content (Picking or Changing the attribute type) */}
              {(!attr.id && !collapsedAttributes[index]) || (editingIndex === index) ? (
                <div className="border-t border-gray-100 p-5 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {attr.id ? 'Change Attribute' : 'Select Attribute'}
                      </label>
                      <select
                        value={attr.id || ''}
                        onChange={(e) => {
                          updateAttribute(index, e.target.value);
                          setEditingIndex(null); // Close edit mode after selection
                        }}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all font-medium text-gray-900 shadow-inner"
                      >
                        <option value="">-- Choose Attribute --</option>
                        {globalAttributes
                          .filter(a => !selectedAttributes.some((selected, i) => i !== index && selected.id === a.id))
                          .map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </select>
                      {editingIndex === index && (
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="mt-3 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Add Button */}
      <div className="pt-2 space-y-3">
        {(() => {
          const usedAttributeIds = selectedAttributes.map(a => a.id).filter(Boolean);
          const availableAttributes = globalAttributes.filter(a => !usedAttributeIds.includes(a.id));

          return (
            <>
              {availableAttributes.length > 0 && (
                <button
                  type="button"
                  onClick={addAttribute}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-slate-600 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all font-bold group"
                >
                  <div className="p-1 bg-gray-100 rounded-full group-hover:bg-slate-100 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  Add Another Attribute
                </button>
              )}

              {availableAttributes.length > 0 && (
                <div className="flex justify-center">
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    {availableAttributes.length} attributes remaining for selection
                  </span>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {
        selectedAttributes.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {globalAttributes.length === 0 ? (
              <p>No attributes available, Select catefory to see the relevant attrives to your product.</p>
            ) : (
              <p>No attributes added yet. Click "Add Attribute" .</p>
            )}
          </div>
        )
      }
    </div>
  );
}
