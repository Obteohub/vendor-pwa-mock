"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Search, 
  Loader2, 
  X, 
  FolderTree, 
  ArrowLeft, 
  Image as ImageIcon, 
  CheckCircle2
} from 'lucide-react';

export default function CategoryTreeSelector({
  selectedIds = [],
  onChange,
  label = "Categories",
  categoryTree = [],
  loading: parentLoading = false,
  onLeafSelect = null, // Optional callback for leaf selection
  closeOnSelect = false, // Auto-close modal on selection
  nextRoute = null // Optional route to navigate to on selection
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState([]); // Stack of parent categories
  const [currentView, setCurrentView] = useState(null); // null = root
  const [isAnimating, setIsAnimating] = useState(false);

  // Use provided category tree
  const categories = categoryTree;
  const loading = parentLoading || (categories.length === 0 && parentLoading);

  // Build category map for quick lookups
  const categoryMap = useMemo(() => {
    const map = new Map();
    const addToMap = (cats, depth = 0) => {
      if (depth > 20) return; // Prevent infinite recursion
      cats.forEach(cat => {
        map.set(cat.id, cat);
        if (cat.children && cat.children.length > 0) {
          addToMap(cat.children, depth + 1);
        }
      });
    };
    if (categories && categories.length > 0) {
      addToMap(categories);
    }
    return map;
  }, [categories]);

  // Pre-compute which parent IDs have selected descendants for performance and loop protection
  const selectedParentIds = useMemo(() => {
    const parentIds = new Set();
    if (!selectedIds || selectedIds.length === 0) return parentIds;

    const markAncestors = (catId) => {
      let current = categoryMap.get(catId);
      let depth = 0;
      // Traverse up the tree to mark all parents as "having selected descendants"
      while (current && current.parent && Number(current.parent) !== 0 && depth < 20) {
        const parentId = Number(current.parent);
        if (parentIds.has(parentId)) break; // Already processed this branch
        parentIds.add(parentId);
        current = categoryMap.get(parentId);
        depth++;
      }
    };

    selectedIds.forEach(id => markAncestors(id));
    return parentIds;
  }, [selectedIds, categoryMap]);

  // Get current categories to display
  const currentCategories = useMemo(() => {
    if (searchTerm.trim()) {
      // Search mode: show all matching categories flat
      const search = searchTerm.toLowerCase();
      const matches = [];
      const findMatches = (cats, depth = 0) => {
        if (depth > 20) return; // Prevent infinite recursion
        cats.forEach(cat => {
          if (cat.name.toLowerCase().includes(search)) {
            matches.push(cat);
          }
          if (cat.children && cat.children.length > 0) {
            findMatches(cat.children, depth + 1);
          }
        });
      };
      findMatches(categories);
      return matches.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Normal mode: show children of current view or root
    let result = [];
    if (!currentView) {
      // Root level: Show categories that are explicitly roots (parent 0)
      // OR categories whose parent is not found in our map (orphans)
      const allIds = new Set(categories.map(c => c.id));
      result = categories.filter(cat => 
        Number(cat.parent || 0) === 0 || !allIds.has(Number(cat.parent))
      );
    } else {
      result = currentView.children || [];
    }

    // Sort alphabetically
    return [...result].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, currentView, searchTerm]);

  // Navigate into a category
  const navigateInto = (category) => {
    if (category.children && category.children.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setNavigationStack(prev => [...prev, currentView]);
        setCurrentView(category);
        setSearchTerm('');
        setIsAnimating(false);
      }, 150); // Short delay for transition effect
    }
  };

  // Navigate back one level
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        const previous = navigationStack[navigationStack.length - 1];
        setNavigationStack(prev => prev.slice(0, -1));
        setCurrentView(previous);
        setIsAnimating(false);
      }, 150);
    }
  };

  // Toggle category selection (Leaf nodes only)
  const toggleCategory = (categoryId) => {
    const category = categoryMap.get(categoryId);
    // Enforce: Only terminal nodes can be selected
    if (category?.children?.length > 0) return;

    // Standard toggle behavior
    const newSelected = new Set(selectedIds);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    onChange(Array.from(newSelected));

    // Handle interaction behavior
    if (closeOnSelect || nextRoute || onLeafSelect) {
      // 1. Call custom handler if provided
      if (onLeafSelect) onLeafSelect(category);

      // 2. Auto-close and/or Navigate with smooth transition
      if (closeOnSelect || nextRoute) {
        setIsAnimating(true);
        // Visual feedback delay
        setTimeout(() => {
          if (closeOnSelect) {
            setIsOpen(false);
            setIsAnimating(false);
          }
          
          if (nextRoute) {
             router.push(nextRoute);
          }
        }, 300);
      }
    }
  };

  // Helper to get image
  const getCategoryImage = (category) => {
    return category.image?.src || category.image || null;
  };

  // Selected names for trigger button
  const selectedNames = useMemo(() => {
    if (selectedIds.length === 0) return '';
    const names = selectedIds
      .map(id => categoryMap.get(id)?.name)
      .filter(Boolean);
    if (names.length > 2) return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
    return names.join(', ');
  }, [selectedIds, categoryMap]);

  // Reset view when opening
  const handleOpen = () => {
    setIsOpen(true);
    setCurrentView(null);
    setNavigationStack([]);
    setSearchTerm('');
  };

  // Render individual category card
  const CategoryCard = ({ category }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isLeafSelected = !hasChildren && selectedIds.includes(category.id);
    const isParentDone = hasChildren && selectedParentIds.has(category.id);
    const imageSrc = getCategoryImage(category);

    return (
      <div 
        onClick={() => hasChildren ? navigateInto(category) : toggleCategory(category.id)}
        className={`
          group relative flex items-center gap-3 p-3 transition-all duration-200 cursor-pointer
          ${isLeafSelected 
            ? 'bg-indigo-50' 
            : isParentDone
              ? 'bg-indigo-50'
              : 'bg-white hover:bg-gray-50'
          }
        `}
      >
        {/* Image / Icon */}
        <div className={`
          w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-md
          ${imageSrc ? 'bg-white' : 'bg-gray-100 text-gray-400'}
        `}>
          {imageSrc ? (
            <img src={imageSrc} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 opacity-50" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-normal text-sm ${isLeafSelected || isParentDone ? 'text-indigo-900' : 'text-gray-900'}`}>
            {category.name}
          </h4>
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3">
          {/* Selection Indicator */}
          {!hasChildren ? (
            // Leaf Node: Selectable
            <div 
              onClick={(e) => { e.stopPropagation(); toggleCategory(category.id); }}
              className={`
                w-6 h-6 border flex items-center justify-center transition-colors
                ${isLeafSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}
              `}
            >
              {isLeafSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
          ) : (
            // Parent Node: Status Only (Non-selectable directly)
            isParentDone ? (
               <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  <span>Done</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
               </div>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                 {/* Placeholder for alignment or empty state */}
              </div>
            )
          )}

          {/* Drill down arrow */}
          {hasChildren && (
            <div className="pl-2 border-l border-gray-100 ml-2">
               <ChevronRight className={`w-5 h-5 transition-colors ${isParentDone ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-600'}`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Trigger Component */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={handleOpen}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 transition-all group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FolderTree className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-sm font-medium truncate ${selectedIds.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                {selectedIds.length === 0 ? 'Select categories...' : selectedNames}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
        
        {/* Selection Badge */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800">
                {selectedIds.length} selected
              </span>
            )}
            <button 
              type="button" 
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Full Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in fade-in duration-200">
          
          {/* Header Bar */}
          <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => currentView ? navigateBack() : setIsOpen(false)}
                className="p-2 -ml-2 hover:bg-gray-100 text-gray-700 transition-colors flex-shrink-0"
                aria-label="Back"
              >
                {currentView ? <ArrowLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </button>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search in ${currentView ? currentView.name : 'all categories'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  autoFocus={!currentView}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto md:p-8">
              
              {loading && !categories.length ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                  <p>Loading category structure...</p>
                </div>
              ) : currentCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FolderTree className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium text-gray-600">No categories found</p>
                  <p className="text-sm">Try adjusting your search or check another folder.</p>
                </div>
              ) : (
                <div className={`
                  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border-y md:border border-gray-200
                  transition-opacity duration-200
                  ${isAnimating ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}
                `}>
                  {currentCategories.map(category => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
              
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}
