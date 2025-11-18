// src/components/CategorySelector.jsx
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
export default function CategorySelector({ 
  selectedIds = [], 
  onChange, 
  label, 
  placeholder = "Search and select categories..." 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState([]); // All loaded categories (flat)
  const [loading, setLoading] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedChildren, setLoadedChildren] = useState(new Set()); // Track which categories have children loaded
  const scrollContainerRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const perPage = 50;

  // Fetch root categories from API with pagination
  const fetchCategories = useCallback(async (page = 1, append = false) => {
    if (loading && !append) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/categories?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      const newCategories = data.categories || [];
      
      if (append) {
        setAllCategories(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const unique = newCategories.filter(c => !existingIds.has(c.id));
          return [...prev, ...unique];
        });
      } else {
        setAllCategories(newCategories);
      }
      
      setHasMore(data.has_more || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load children of a category on demand
  const loadChildren = useCallback(async (categoryId) => {
    if (loadingChildren.has(categoryId) || loadedChildren.has(categoryId)) return;
    
    setLoadingChildren(prev => new Set(prev).add(categoryId));
    try {
      const response = await fetch(`/api/vendor/categories?parent=${categoryId}&per_page=100`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const children = data.categories || [];
        
        // Add children to allCategories if not already there
        setAllCategories(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const unique = children.filter(c => !existingIds.has(c.id));
          return [...prev, ...unique];
        });
        
        setLoadedChildren(prev => new Set(prev).add(categoryId));
      }
    } catch (error) {
      console.error(`Error loading children for category ${categoryId}:`, error);
    } finally {
      setLoadingChildren(prev => {
        const updated = new Set(prev);
        updated.delete(categoryId);
        return updated;
      });
    }
  }, [loadingChildren, loadedChildren]);

  // Initial load
  useEffect(() => {
    if (isOpen && allCategories.length === 0) {
      fetchCategories(1, false);
    }
  }, [isOpen, allCategories.length, fetchCategories]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen || !hasMore || loading) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (sentinelRef.current && sentinelRef.current.parentNode) {
      sentinelRef.current.parentNode.removeChild(sentinelRef.current);
    }

    // Create sentinel element
    const sentinel = document.createElement('div');
    sentinel.style.height = '20px';
    sentinel.style.width = '100%';
    sentinelRef.current = sentinel;
    container.appendChild(sentinel);

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchCategories(currentPage + 1, true);
        }
      },
      { threshold: 0.1, root: container }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (sentinelRef.current && sentinelRef.current.parentNode) {
        sentinelRef.current.parentNode.removeChild(sentinelRef.current);
      }
    };
  }, [isOpen, hasMore, loading, currentPage, fetchCategories]);

  // Build parent chain map for all loaded categories
  const parentChainMap = useMemo(() => {
    const map = new Map();
    
    allCategories.forEach(cat => {
      const chain = [];
      let current = cat;
      let depth = 0;
      
      while (current && current.parent && depth < 10) {
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

  // Build tree structure from filtered categories with lazy loading support
  const tree = useMemo(() => {
    const buildTree = (parentId = 0, level = 0) => {
      return filteredCategories
        .filter(item => item.parent === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(item => {
          // Check if this category has children loaded
          const hasLoadedChildren = loadedChildren.has(item.id);
          // Check if there are children in the current filtered set
          const childrenInSet = filteredCategories.filter(c => c.parent === item.id);
          
          // For 711 categories, we show expand icon for all categories
          // They might have children that we haven't loaded yet
          // Only hide expand icon if we've loaded children and found none
          const hasChildren = childrenInSet.length > 0 || !hasLoadedChildren;
          
          // Get children (from filtered set if available)
          const children = childrenInSet.length > 0 ? buildTree(item.id, level + 1) : [];
          
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
  }, [filteredCategories, loadedChildren]);

  // Toggle expand/collapse with lazy loading
  const toggleExpand = useCallback((id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      // Lazy load children if not already loaded
      if (!loadedChildren.has(id)) {
        loadChildren(id);
      }
    }
    setExpandedIds(newExpanded);
  }, [expandedIds, loadedChildren, loadChildren]);

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
    const isLoadingChildren = loadingChildren.has(item.id);
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
              disabled={isLoadingChildren}
            >
              {isLoadingChildren ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isExpanded ? (
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
            {isLoadingChildren ? (
              <div className="py-2 px-2 flex items-center" style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}>
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="ml-2 text-xs text-gray-500">Loading...</span>
              </div>
            ) : children.length > 0 ? (
              children.map(child => renderTreeItem(child, level + 1))
            ) : null}
          </div>
        )}
      </div>
    );
  }, [expandedIds, selectedIds, loadingChildren, toggleExpand, toggleSelect]);

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

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col" style={{ maxHeight: '500px' }}>
            {/* Search bar */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
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
                <div className="mt-2 text-xs text-gray-600">
                  {selectedIds.length} categor{selectedIds.length === 1 ? 'y' : 'ies'} selected
                </div>
              )}
            </div>

            {/* Categories list with virtualization */}
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto flex-1 p-2"
              style={{ maxHeight: '400px' }}
            >
              {loading && allCategories.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                </div>
              ) : tree.length > 0 ? (
                <>
                  {tree.map(item => renderTreeItem(item))}
                  {hasMore && (
                    <div className="flex items-center justify-center py-4">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="ml-2 text-xs text-gray-500">Loading more...</span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fetchCategories(currentPage + 1, true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Load more categories...
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">
                  {searchQuery ? `No categories found matching "${searchQuery}"` : 'No categories available'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
