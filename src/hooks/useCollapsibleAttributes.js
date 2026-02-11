// src/hooks/useCollapsibleAttributes.js
"use client";

import { useState, useEffect } from 'react';

export function useCollapsibleAttributes(productId) {
  const [collapsedAttributes, setCollapsedAttributes] = useState({});
  const [activeAttributeIndex, setActiveAttributeIndex] = useState(null);
  const [manuallyClosedAttributes, setManuallyClosedAttributes] = useState(new Set());

  // Save collapsed state to localStorage
  const saveCollapsedState = (collapsedState, manuallyClosed) => {
    if (typeof window === 'undefined') return;
    
    const storageKey = productId 
      ? `attribute_collapsed_${productId}` 
      : 'attribute_collapsed_new';
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        collapsedState,
        manuallyClosed: Array.from(manuallyClosed)
      }));
    } catch (error) {
      console.error('[useCollapsibleAttributes] Error saving collapsed state:', error);
    }
  };

  // Restore collapsed state from localStorage
  const restoreCollapsedState = () => {
    if (typeof window === 'undefined') return;
    
    const storageKey = productId 
      ? `attribute_collapsed_${productId}` 
      : 'attribute_collapsed_new';
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { collapsedState, manuallyClosed } = JSON.parse(saved);
        setCollapsedAttributes(collapsedState || {});
        setManuallyClosedAttributes(new Set(manuallyClosed || []));
      }
    } catch (error) {
      console.error('[useCollapsibleAttributes] Error restoring collapsed state:', error);
    }
  };

  // Toggle attribute collapse/expand
  const toggleAttributeCollapse = (index, isManualClose = false, totalAttributes = 0) => {
    const newCollapsedState = {
      ...collapsedAttributes,
      [index]: !collapsedAttributes[index]
    };
    
    const newManuallyClosed = new Set(manuallyClosedAttributes);
    
    // If this is a manual close (via Done button), mark it as manually closed
    if (isManualClose && newCollapsedState[index]) {
      newManuallyClosed.add(index);
    } else if (!newCollapsedState[index]) {
      // If expanding, remove from manually closed set
      newManuallyClosed.delete(index);
    }
    
    setCollapsedAttributes(newCollapsedState);
    setManuallyClosedAttributes(newManuallyClosed);
    setActiveAttributeIndex(newCollapsedState[index] ? null : index);
    
    // Save to localStorage
    saveCollapsedState(newCollapsedState, newManuallyClosed);
  };

  // Set attribute as active (expand it, collapse others)
  const setActiveAttribute = (index, totalAttributes = 0) => {
    // Don't auto-expand if this attribute was manually closed
    if (manuallyClosedAttributes.has(index)) {
      return;
    }
    
    setActiveAttributeIndex(index);
    // Collapse all other attributes (except manually closed ones)
    const newCollapsedState = {};
    for (let i = 0; i < totalAttributes; i++) {
      if (i === index) {
        newCollapsedState[i] = false; // Expand this one
      } else if (!manuallyClosedAttributes.has(i)) {
        newCollapsedState[i] = true; // Collapse others (only if not manually closed)
      } else {
        newCollapsedState[i] = collapsedAttributes[i]; // Keep manually closed as they were
      }
    }
    setCollapsedAttributes(newCollapsedState);
    
    // Save to localStorage
    saveCollapsedState(newCollapsedState, manuallyClosedAttributes);
  };

  // Initialize collapsed state for new attributes
  const initializeNewAttribute = (index, shouldExpand = true) => {
    if (collapsedAttributes[index] === undefined) {
      const newCollapsedState = {
        ...collapsedAttributes,
        [index]: !shouldExpand
      };
      setCollapsedAttributes(newCollapsedState);
      
      if (shouldExpand) {
        setActiveAttribute(index);
      }
    }
  };

  // Clean up state when attribute is removed
  const removeAttributeState = (index) => {
    const newCollapsedState = { ...collapsedAttributes };
    const newManuallyClosed = new Set(manuallyClosedAttributes);
    
    delete newCollapsedState[index];
    newManuallyClosed.delete(index);
    
    // Reindex remaining attributes
    const reindexedCollapsed = {};
    const reindexedManuallyClosed = new Set();
    
    let newIndex = 0;
    for (let i = 0; i < Object.keys(newCollapsedState).length; i++) {
      if (newCollapsedState[i] !== undefined) {
        reindexedCollapsed[newIndex] = newCollapsedState[i];
        if (newManuallyClosed.has(i)) {
          reindexedManuallyClosed.add(newIndex);
        }
        newIndex++;
      }
    }
    
    setCollapsedAttributes(reindexedCollapsed);
    setManuallyClosedAttributes(reindexedManuallyClosed);
    
    // Save to localStorage
    saveCollapsedState(reindexedCollapsed, reindexedManuallyClosed);
  };

  return {
    collapsedAttributes,
    manuallyClosedAttributes,
    activeAttributeIndex,
    toggleAttributeCollapse,
    setActiveAttribute,
    restoreCollapsedState,
    initializeNewAttribute,
    removeAttributeState
  };
}
