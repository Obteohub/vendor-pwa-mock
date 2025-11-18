// src/components/CategoryTreeSelector.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Search, Loader2, X, FolderTree } from 'lucide-react';

export default function CategoryTreeSelector({ 
  selectedIds = [], 
  onChange, 
  label = "Categories",
  categoryTree = [] // Receive pre-computed category tree from parent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState([]); // Track navigation history
  const [currentView, setCurrentView] = useState(null); // null = root, or category object

  // Use provided category tree (already pre-computed)
  const categories = categoryTree;
  const loading = categories.length === 0;

  // Build category map for quick lookups
  const categoryMap = useMemo(() => {
    const map = new Map();
    const addToMap = (cats) => {
      cats.forEach(cat => {
        map.set(cat.id, cat);
        if (cat.children) addToMap(cat.children);
      });
    };
    addToMap(categories);
    return map;
  }, [categories]);

  // Get current categories to display
  const currentCategories = useMemo(() => {
    if (searchTerm.trim()) {
      // Search mode: show all matching categories
      const search = searchTerm.toLowerCase();
      const matches = [];
      const findMatches = (cats) => {
        cats.forEach(cat => {
          if (cat.name.toLowerCase().includes(search)) {
            matches.push(cat);
          }
          if (cat.children) findMatches(cat.children);
        });
      };
      findMatches(categories);
      return matches;
    }
    
    // Normal mode: show current level
    return currentView ? (currentView.children || []) : categories;
  }, [categories, currentView, searchTerm]);

  // Navigate into a category
  const navigateInto = (category) => {
    if (category.children && category.children.length > 0) {
      setNavigationStack([...navigationStack, currentView]);
      setCurrentView(category);
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

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    const newSelected = new Set(selectedIds);
    
    if (newSelected.has(categoryId)) {
      // Deselect: remove this category
      newSelected.delete(categoryId);
    } else {
      // Select: add this category AND all its parent categories
      newSelected.add(categoryId);
      
      // Find and add all parent categories
      const category = categoryMap.get(categoryId);
      if (category) {
        let parentId = category.parent;
        while (parentId) {
          newSelected.add(parentId);
          const parent = categoryMap.get(parentId);
          parentId = parent?.parent;
        }
      }
    }

    onChange(Array.from(newSelected));
  };

  // Get selected category names
  const selectedNames = useMemo(() => {
    return selectedIds
      .map(id => categoryMap.get(id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedIds, categoryMap]);

  // Reset view when opening
  const handleOpen = () => {
    setIsOpen(true);
    setCurrentView(null);
    setNavigationStack([]);
    setSearchTerm('');
  };

  // Memoized category item component for better performance
  const CategoryItem = React.memo(({ category }) => {
    const isSelected = selectedIds.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleCategory(category.id)}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
          />

          {/* Category name */}
          <button
            type="button"
            onClick={() => hasChildren ? navigateInto(category) : toggleCategory(category.id)}
            className="flex-1 text-left min-w-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {category.name}
              </span>
              {category.count > 0 && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                  ({category.count})
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Arrow for categories with children */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => navigateInto(category)}
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

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleOpen}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderTree className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`text-sm truncate ${selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {selectedIds.length === 0 
                ? 'Click to select categories...' 
                : selectedNames || `${selectedIds.length} selected`}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>

        {/* Selected count badge */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {selectedIds.length} {selectedIds.length === 1 ? 'category' : 'categories'} selected
            </span>
          </div>
        )}
      </div>

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Header with breadcrumb */}
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
                <FolderTree className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {currentView ? currentView.name : 'All Categories'}
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

            {/* Search bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Category list - scrollable */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                </div>
              ) : currentCategories.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  {searchTerm ? 'No categories found' : 'No categories available'}
                </div>
              ) : (
                <div>
                  {currentCategories.map(category => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedIds.length} {selectedIds.length === 1 ? 'category' : 'categories'} selected
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
