// src/components/BrandTreeSelector.jsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, X, Tag, ChevronRight, ChevronLeft } from 'lucide-react';

function BrandTreeSelector({ 
  selectedIds = [], 
  onChange, 
  label = "Brands",
  brandTree = [], // Receive brands from parent
  loading: parentLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [internalBrandTree, setInternalBrandTree] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Use provided brandTree or internal one
  const effectiveBrandTree = useMemo(() => {
    return brandTree && brandTree.length > 0 ? brandTree : internalBrandTree;
  }, [brandTree, internalBrandTree]);

  // Fetch brands if not provided and parent is not loading
  useEffect(() => {
    // Only fetch if:
    // 1. No parent data provided
    // 2. No internal data fetched yet
    // 3. Not currently fetching
    // 4. Parent is NOT loading (wait for parent first)
    // 5. Has not attempted fetch yet (avoid infinite loop if API returns empty)
    if ((!brandTree || brandTree.length === 0) && internalBrandTree.length === 0 && !isFetching && !parentLoading && !hasAttemptedFetch) {
      const fetchBrands = async () => {
        setIsFetching(true);
        try {
          // Use the main brands endpoint which returns the full tree from the backend
          // instead of the mock tree endpoint
          const response = await fetch('/api/vendor/brands');
          if (response.ok) {
            const data = await response.json();
            if (data.brands && Array.isArray(data.brands)) {
              // The API returns a flat list, so we need to build the tree structure
              // to match what the component expects (nested children)
              const buildTree = (items) => {
                const itemMap = new Map();
                const roots = [];

                // First pass: create map of items with empty children
                items.forEach(item => {
                  itemMap.set(item.id, { ...item, children: [] });
                });

                // Second pass: link children to parents
                items.forEach(item => {
                  const node = itemMap.get(item.id);
                  const parentId = Number(item.parent || 0);
                  if (parentId === 0 || !itemMap.has(parentId)) {
                    roots.push(node);
                  } else {
                    const parent = itemMap.get(parentId);
                    parent.children.push(node);
                  }
                });

                return roots.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              };

              const tree = buildTree(data.brands);
              console.log('Fetched and built brand tree:', tree.length, 'root items');
              setInternalBrandTree(tree);
            }
          }
        } catch (error) {
          console.error('Error fetching brands:', error);
        } finally {
          setIsFetching(false);
          setHasAttemptedFetch(true);
        }
      };
      fetchBrands();
    }
  }, [brandTree, internalBrandTree.length, isFetching, parentLoading, hasAttemptedFetch]);

  // Flatten brand tree to simple list and create a map
  const { brands, brandMap } = useMemo(() => {
    const map = new Map();
    const result = [];
    const flattenBrands = (brandList, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion
      brandList.forEach(brand => {
        result.push(brand);
        map.set(brand.id, brand);
        if (brand.children && brand.children.length > 0) {
          flattenBrands(brand.children, depth + 1);
        }
      });
    };
    if (effectiveBrandTree && effectiveBrandTree.length > 0) {
      flattenBrands(effectiveBrandTree);
    }
    return { brands: result, brandMap: map };
  }, [effectiveBrandTree]);

  // Pre-compute which brand IDs have selected descendants for performance and loop protection
  const selectedParentIds = useMemo(() => {
    const parentIds = new Set();
    if (!selectedIds || selectedIds.length === 0) return parentIds;

    const markAncestors = (brandId) => {
      let current = brandMap.get(brandId);
      let depth = 0;
      // Traverse up the tree to mark all parents
      while (current && current.parent && Number(current.parent) !== 0 && depth < 10) {
        const parentId = Number(current.parent);
        if (parentIds.has(parentId)) break; // Already processed this branch
        parentIds.add(parentId);
        current = brandMap.get(parentId);
        depth++;
      }
    };

    selectedIds.forEach(id => markAncestors(id));
    return parentIds;
  }, [selectedIds, brandMap]);

  const loading = parentLoading || (brands.length === 0 && isFetching);

  // Get current brands to display (either root or children of current view)
  const currentBrands = useMemo(() => {
    if (searchTerm.trim()) {
      // When searching, show flat filtered list
      return brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Show hierarchical view
    if (currentView) {
      return currentView.children || [];
    }
    return effectiveBrandTree; // Root level brands
  }, [searchTerm, brands, effectiveBrandTree, currentView]);

  // Navigate into a brand's children
  const navigateInto = (brand) => {
    if (brand.children && brand.children.length > 0) {
      setNavigationStack([...navigationStack, currentView]);
      setCurrentView(brand);
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentView(previous);
    }
  };

  // Toggle brand selection
  const toggleBrand = (brandId) => {
    const isSelected = selectedIds.includes(brandId);
    const newSelected = isSelected
      ? selectedIds.filter(id => id !== brandId)
      : [...selectedIds, brandId];
    onChange(newSelected);
    
    // Auto-close when a brand is selected (not deselected)
    if (!isSelected) {
      setIsOpen(false);
    }
  };

  // Get selected brand names
  const selectedNames = useMemo(() => {
    return selectedIds
      .map(id => brandMap.get(id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedIds, brandMap]);

  // Reset view when opening
  const handleOpen = () => {
    setIsOpen(true);
    setCurrentView(null);
    setNavigationStack([]);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
          <span className="text-sm text-gray-600">Loading brands...</span>
        </div>
      </div>
    );
  }

  // Memoized brand item component
  const BrandItem = React.memo(({ brand }) => {
    const isSelected = selectedIds.includes(brand.id);
    const hasChildren = brand.children && brand.children.length > 0;

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleBrand(brand.id)}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
          />
          <button
            type="button"
            onClick={() => hasChildren ? navigateInto(brand) : toggleBrand(brand.id)}
            className="flex-1 text-left min-w-0"
          >
            <span className="text-sm font-medium text-gray-900 truncate block">
              {brand.name}
            </span>
            {hasChildren && (
              <span className="text-xs text-gray-500">
                {brand.children.length} sub-brand{brand.children.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
        {hasChildren && (
          <button
            type="button"
            onClick={() => navigateInto(brand)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        )}
      </div>
    );
  });

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        <button
          type="button"
          onClick={handleOpen}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`text-sm truncate ${selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {selectedIds.length === 0 
                ? 'Click to select brands...' 
                : selectedNames || `${selectedIds.length} selected`}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {selectedIds.length} {selectedIds.length === 1 ? 'brand' : 'brands'} selected
            </span>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {currentView && (
                  <button
                    type="button"
                    onClick={navigateBack}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <Tag className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {currentView ? currentView.name : 'All Brands'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading brands...</span>
                </div>
              ) : currentBrands.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  {searchTerm ? 'No brands found' : 'No brands available'}
                </div>
              ) : (
                <div>
                  {currentBrands.map(brand => (
                    <BrandItem key={brand.id} brand={brand} />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 pb-safe">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedIds.length} {selectedIds.length === 1 ? 'brand' : 'brands'} selected
                </span>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default React.memo(BrandTreeSelector);
