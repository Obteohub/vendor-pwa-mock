"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, X, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';

function LocationSelector({ 
  selectedIds = [], 
  onChange, 
  label = "Locations",
  locations = [], // Receive locations from parent (flat list usually)
  loading: parentLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [internalLocationTree, setInternalLocationTree] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Build tree from props or fetch if needed
  useEffect(() => {
    // If locations provided, build tree from them
    if (Array.isArray(locations) && locations.length > 0) {
      const buildTree = (items) => {
        const itemMap = new Map();
        const roots = [];

        // Normalize and map
        items.forEach(item => {
            if (!item) return;
            // Ensure parent is 0 if missing/null
            const parent = (item.parent === null || item.parent === undefined) ? 0 : item.parent;
            itemMap.set(item.id, { ...item, parent, children: [] });
        });

        // Link children
        items.forEach(item => {
          if (!item) return;
          const node = itemMap.get(item.id);
          if (!node) return;
          
          const parentId = Number(node.parent);
          
          if (parentId === 0 || !itemMap.has(parentId)) {
            roots.push(node);
          } else {
            const parent = itemMap.get(parentId);
            if (parent) parent.children.push(node);
          }
        });

        return roots.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      };

      setInternalLocationTree(buildTree(locations));
      return;
    }

    // Otherwise fetch if internal tree is empty
    if (internalLocationTree.length === 0 && !isFetching && !parentLoading && !hasAttemptedFetch) {
      const fetchLocations = async () => {
        setIsFetching(true);
        try {
          const response = await fetch('/api/vendor/locations');
          if (response.ok) {
            const data = await response.json();
            // Handle different response structures
            let items = Array.isArray(data) ? data : (data.locations || data.data || []);
            
            // Normalize items
            items = items.map(loc => ({
                ...loc,
                id: loc.id || loc.term_id,
                name: loc.name || loc.title || 'Unknown Location',
                parent: (loc.parent === null || loc.parent === undefined) ? 0 : loc.parent
            })).filter(loc => loc.id);

            const buildTree = (items) => {
              const itemMap = new Map();
              const roots = [];

              items.forEach(item => {
                itemMap.set(item.id, { ...item, children: [] });
              });

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

            const tree = buildTree(items);
            console.log('Fetched and built location tree:', tree.length, 'root items');
            setInternalLocationTree(tree);
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        } finally {
          setIsFetching(false);
          setHasAttemptedFetch(true);
        }
      };
      fetchLocations();
    }
  }, [locations, internalLocationTree.length, isFetching, parentLoading, hasAttemptedFetch]);

  // Flatten tree for searching and mapping
  const { flatLocations, locationMap } = useMemo(() => {
    const map = new Map();
    const result = [];
    const flatten = (list, depth = 0) => {
      if (depth > 20) return; // Prevent infinite recursion
      list.forEach(item => {
        result.push(item);
        map.set(item.id, item);
        if (item.children && item.children.length > 0) {
          flatten(item.children, depth + 1);
        }
      });
    };
    if (internalLocationTree && internalLocationTree.length > 0) {
      flatten(internalLocationTree);
    }
    return { flatLocations: result, locationMap: map };
  }, [internalLocationTree]);

  const loading = parentLoading || (flatLocations.length === 0 && isFetching);

  // Get current locations to display
  const currentLocations = useMemo(() => {
    if (searchTerm.trim()) {
      return flatLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (currentView) {
      return currentView.children || [];
    }
    return internalLocationTree;
  }, [searchTerm, flatLocations, internalLocationTree, currentView]);

  const navigateInto = (loc) => {
    if (loc.children && loc.children.length > 0) {
      setNavigationStack([...navigationStack, currentView]);
      setCurrentView(loc);
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentView(previous);
    }
  };

  const toggleLocation = (id) => {
    const newSelected = new Set(selectedIds);
    const isSelected = newSelected.has(id);
    
    // Helper to collect all descendant IDs
    const getDescendants = (itemId) => {
        const descendants = [];
        const item = locationMap.get(itemId);
        if (item && item.children) {
            const stack = [...item.children];
            let iterations = 0;
            while (stack.length > 0 && iterations < 1000) { // Safety limit
                iterations++;
                const child = stack.pop();
                descendants.push(child.id);
                if (child.children && child.children.length > 0) {
                    stack.push(...child.children);
                }
            }
        }
        return descendants;
    };

    const descendants = getDescendants(id);

    if (isSelected) {
        // Deselect: remove item and all its descendants
        newSelected.delete(id);
        descendants.forEach(childId => newSelected.delete(childId));
    } else {
        // Select: add item and all its descendants
        newSelected.add(id);
        descendants.forEach(childId => newSelected.add(childId));
        // Auto-close on selection
        setIsOpen(false);
    }
    
    onChange(Array.from(newSelected));
  };

  const selectedNames = useMemo(() => {
    return selectedIds
      .map(id => locationMap.get(id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedIds, locationMap]);

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
          <span className="text-sm text-gray-600">Loading locations...</span>
        </div>
      </div>
    );
  }

  const LocationItem = React.memo(({ loc }) => {
    const isSelected = selectedIds.includes(loc.id);
    const hasChildren = loc.children && loc.children.length > 0;

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleLocation(loc.id)}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
          />
          <button
            type="button"
            onClick={() => hasChildren ? navigateInto(loc) : toggleLocation(loc.id)}
            className="flex-1 text-left min-w-0"
          >
            <span className="text-sm font-medium text-gray-900 truncate block">
              {loc.name}
            </span>
            {hasChildren && (
              <span className="text-xs text-gray-500">
                {loc.children.length} sub-locations
              </span>
            )}
          </button>
        </div>
        {hasChildren && (
          <button
            type="button"
            onClick={() => navigateInto(loc)}
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
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`text-sm truncate ${selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {selectedIds.length === 0 
                ? 'Select locations...' 
                : selectedNames || `${selectedIds.length} selected`}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
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
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {currentView ? currentView.name : 'All Locations'}
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
                  placeholder="Search locations..."
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
                  <span className="ml-2 text-sm text-gray-600">Loading locations...</span>
                </div>
              ) : currentLocations.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  {searchTerm ? 'No locations found' : 'No locations available'}
                </div>
              ) : (
                <div>
                  {currentLocations.map(loc => (
                    <LocationItem key={loc.id} loc={loc} />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 pb-safe">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedIds.length} {selectedIds.length === 1 ? 'location' : 'locations'} selected
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

export default React.memo(LocationSelector);
