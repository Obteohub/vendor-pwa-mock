// src/components/HierarchicalSelector.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/**
 * HierarchicalSelector - A component for selecting items in a hierarchical tree structure
 * @param {Array} items - Flat array of items with id, name, parent properties
 * @param {Array} selectedIds - Array of selected item IDs
 * @param {Function} onChange - Callback when selection changes
 * @param {String} label - Label for the selector
 * @param {String} placeholder - Placeholder text
 */
function HierarchicalSelector({ items, selectedIds = [], onChange, label, placeholder = "Select items..." }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Build tree structure
  const tree = useMemo(() => {
    const buildTree = (parentId = 0) => {
      // Use loose equality (==) or cast to Number to handle string vs number ID issues
      const children = items
        .filter(item => Number(item.parent) == Number(parentId))
        .map(item => ({
          ...item,
          children: buildTree(item.id)
        }));
      return children;
    };

    const rootItems = buildTree(0);
    console.log(`[HierarchicalSelector] Built tree for "${label}" with ${rootItems.length} root items from ${items.length} total items`);
    return rootItems;
  }, [items, label]);

  // Get selected items names for display
  const selectedNames = useMemo(() => {
    return items
      .filter(item => selectedIds.includes(item.id))
      .map(item => item.name)
      .join(', ');
  }, [items, selectedIds]);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleSelect = (id) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };

  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isSelected = selectedIds.includes(item.id);

    return (
      <div key={item.id}>
        <div
          className="flex items-center py-2 px-2 hover:bg-gray-50 rounded"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
            id={`item-${item.id}`}
            checked={isSelected}
            onChange={() => toggleSelect(item.id)}
            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />

          {/* Label */}
          <label
            htmlFor={`item-${item.id}`}
            className={`flex-1 cursor-pointer text-sm ${hasChildren ? 'font-medium text-gray-900' : 'text-gray-700'}`}
          >
            {item.name}
            {item.count !== undefined && (
              <span className="ml-1 text-xs text-gray-400">({item.count})</span>
            )}
          </label>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white hover:border-gray-400 transition duration-150 shadow-sm min-h-[42px]"
      >
        {selectedNames ? (
          <span className="text-sm text-gray-900">{selectedNames}</span>
        ) : (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[100] bg-white sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-1 sm:w-full sm:rounded-lg sm:shadow-lg sm:h-auto sm:max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-200 sm:z-50">
            {/* Header (Mobile only) */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:hidden">
              <h3 className="text-lg font-semibold text-gray-900">{label || 'Select Options'}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-gray-50 sm:bg-white">
              {tree.length > 0 ? (
                tree.map(item => renderTreeItem(item))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No items available
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
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Memoize to prevent re-renders
export default React.memo(HierarchicalSelector);
