// src/components/BrandTreeSelector.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { Search, Loader2, X, Tag, ChevronRight, ChevronLeft } from 'lucide-react';

export default function BrandTreeSelector({ 
  selectedIds = [], 
  onChange, 
  label = "Brands",
  brandTree = [] // Receive brands from parent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);

  // Flatten brand tree to simple list and create a map
  const { brands, brandMap } = useMemo(() => {
    const flattenBrands = (brandList, result = [], map = new Map()) => {
      brandList.forEach(brand => {
        result.push(brand);
        map.set(brand.id, brand);
        if (brand.children && brand.children.length > 0) {
          flattenBrands(brand.children, result, map);
        }
      });
      return { result, map };
    };
    const { result, map } = flattenBrands(brandTree);
    return { brands: result, brandMap: map };
  }, [brandTree]);

  const loading = brands.length === 0;

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
    return brandTree; // Root level brands
  }, [searchTerm, brands, brandTree, currentView]);

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
    const newSelected = selectedIds.includes(brandId)
      ? selectedIds.filter(id => id !== brandId)
      : [...selectedIds, brandId];
    onChange(newSelected);
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

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
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
