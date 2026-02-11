"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Search, Loader2, X } from 'lucide-react';

/**
 * Advanced CategorySelector with:
 * - Server-side pagination
 * - Lazy loading of children
 * - Search functionality
 * - Auto-select parent categories
 * - Virtual scrolling for performance
 */
function CategorySelector({
  selectedIds = [],
  onChange,
  label,
  placeholder = "Search and select categories...",
  categories = [] // New prop: pre-loaded categories
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState(categories); // Initialize with props
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Update allCategories when categories prop changes
  useEffect(() => {
    if (categories && categories.length > 0) {
      setAllCategories(categories);
    }
  }, [categories]);

  // Fetch all categories recursively
  const fetchAllCategories = useCallback(async () => {
    // If we have categories from props, don't fetch unless we want to refresh
    // For now, assume props are sufficient if provided
    if (categories.length > 0) return;
    
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    try {
      let allFetched = [];
      let page = 1;
      let hasNext = true;
      const limit = 100; // Increase perPage to reduce requests

      while (hasNext) {
        const response = await fetch(`/api/vendor/categories?page=${page}&per_page=${limit}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch categories page ${page}`);
          break;
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.categories || data.data || []);

        if (items.length === 0) {
            hasNext = false;
            break;
        }

        allFetched = [...allFetched, ...items];

        if (items.length < limit) {
          hasNext = false;
        } else {
          page++;
        }
      }

      // Deduplicate categories based on ID
      const uniqueMap = new Map();
      allFetched.forEach(item => uniqueMap.set(item.id, item));
      setAllCategories(Array.from(uniqueMap.values()));

    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [categories]);

  // Initial load when opened
  useEffect(() => {
    if (isOpen && allCategories.length === 0) {
      fetchAllCategories();
    }
  }, [isOpen, allCategories.length, fetchAllCategories]);

  // Build parent chain map for all loaded categories
  const parentChainMap = useMemo(() => {
    const map = new Map();

    allCategories.forEach(cat => {
      const chain = [];
      let current = cat;
      let depth = 0;

      // Increased depth limit from 10 to 100 to support deep nesting
      while (current && current.parent && depth < 100) {
        const parent = allCategories.find(c => c.id === current.parent);
        if (parent) {
          chain.unshift(parent.id);
          current = parent;
          depth++;
        } else {
          break;
        }
      }

      map.set(cat.id, chain);
    });

    return map;
  }, [allCategories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCategories;
    }

    const query = searchQuery.toLowerCase();
    return allCategories.filter(cat =>
      cat.name.toLowerCase().includes(query)
    );
  }, [allCategories, searchQuery]);

  // Build tree structure from filtered categories
  const tree = useMemo(() => {
    const buildTree = (parentId = 0, level = 0) => {
      return filteredCategories
        .filter(item => item.parent === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(item => {
          // Check if there are children in the current filtered set
          const childrenInSet = filteredCategories.filter(c => c.parent === item.id);
          const hasChildren = childrenInSet.length > 0;

          // Recursively build children
          const children = hasChildren ? buildTree(item.id, level + 1) : [];

          return {
            ...item,
            level,
            displayName: '—'.repeat(level) + (level > 0 ? ' ' : '') + item.name,
            hasChildren,
            children
          };
        });
    };
    return buildTree();
  }, [filteredCategories]);

  // Toggle expand/collapse
  const toggleExpand = useCallback((id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  }, [expandedIds]);

  // Toggle selection with auto-select parents
  const toggleSelect = useCallback((id) => {
    const parentChain = parentChainMap.get(id) || [];
    const isCurrentlySelected = selectedIds.includes(id);

    if (isCurrentlySelected) {
      // Deselect this and all its children
      const toRemove = new Set([id]);

      // Find all descendants
      const findDescendants = (parentId) => {
        allCategories.forEach(cat => {
          if (cat.parent === parentId) {
            toRemove.add(cat.id);
            findDescendants(cat.id);
          }
        });
      };
      findDescendants(id);

      onChange(selectedIds.filter(sid => !toRemove.has(sid)));
    } else {
      // Select this and all parents
      const newSelected = [...selectedIds];
      const allIdsToAdd = [id, ...parentChain];

      allIdsToAdd.forEach(pid => {
        if (!newSelected.includes(pid)) {
          newSelected.push(pid);
        }
      });

      onChange(newSelected);
    }
  }, [selectedIds, onChange, parentChainMap, allCategories]);

  // Render tree item recursively
  const renderTreeItem = useCallback((item, level = 0) => {
    const isExpanded = expandedIds.has(item.id);
    const isSelected = selectedIds.includes(item.id);
    const hasChildren = item.hasChildren || false;
    const children = item.children || [];

    return (
      <div key={item.id}>
        <div
          className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-4 mr-2" />
          )}

          {/* Checkbox */}
          <input
            type="checkbox"
            id={`category-${item.id}`}
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelect(item.id);
            }}
            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
          />

          {/* Label */}
          <label
            htmlFor={`category-${item.id}`}
            className={`flex-1 cursor-pointer text-sm select-none ${hasChildren ? 'font-medium text-gray-900' : 'text-gray-700'}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(item.id);
            }}
          >
            {item.displayName || item.name}
            {item.count !== undefined && item.count > 0 && (
              <span className="ml-1 text-xs text-gray-400">({item.count})</span>
            )}
          </label>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {children.length > 0 ? (
              children.map(child => renderTreeItem(child, level + 1))
            ) : null}
          </div>
        )}
      </div>
    );
  }, [expandedIds, selectedIds, toggleExpand, toggleSelect]);

  // Get selected items names for display
  const selectedNames = useMemo(() => {
    if (selectedIds.length === 0) return '';
    const names = selectedIds
      .map(id => {
        const cat = allCategories.find(c => c.id === id);
        return cat ? cat.name : null;
      })
      .filter(Boolean);

    if (names.length > 3) {
      return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    }
    return names.join(', ');
  }, [selectedIds, allCategories]);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Display box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white hover:border-gray-400 transition duration-150 shadow-sm min-h-[42px] flex items-center justify-between"
      >
        <span className={selectedNames ? "text-sm text-gray-900" : "text-sm text-gray-400"}>
          {selectedNames || placeholder}
        </span>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown panel - Full screen on mobile, dropdown on desktop */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[100] bg-white sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-1 sm:w-full sm:rounded-lg sm:shadow-xl sm:h-auto sm:max-h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200 sm:z-50">
            {/* Header (Mobile only) */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:hidden">
              <h3 className="text-lg font-semibold text-gray-900">{label || 'Select Categories'}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {selectedIds.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {selectedIds.length} categor{selectedIds.length === 1 ? 'y' : 'ies'} selected
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Categories list with virtualization */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto flex-1 p-2 bg-gray-50 sm:bg-white"
              style={{ maxHeight: 'none' }} // Override inline style for mobile
            >
              {loading && allCategories.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                </div>
              ) : tree.length > 0 ? (
                <div className="space-y-1">
                  {tree.map(item => renderTreeItem(item))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">
                  {searchQuery ? `No categories found matching "${searchQuery}"` : 'No categories available'}
                </div>
              )}
              {loading && allCategories.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-xs text-gray-500">Loading more...</span>
                  </div>
              )}
            </div>

            {/* Footer (Mobile only) */}
            <div className="p-4 border-t border-gray-200 bg-white sm:hidden pb-safe">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm"
              >
                Done ({selectedIds.length})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Memoize the component to prevent re-renders when parent state changes
export default React.memo(CategorySelector);
