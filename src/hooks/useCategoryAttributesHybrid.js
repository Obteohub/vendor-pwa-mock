"use client";

import { useState, useEffect } from 'react';
import { categoryAttributeMap } from '@/config/categoryAttributeMap';

/**
 * Hybrid approach: Use WooCommerce's category-attribute relationships
 * with manual overrides from categoryAttributeMap
 */
export function useCategoryAttributesHybrid(selectedCategoryIds, allAttributes, categories) {
  const [filteredAttributes, setFilteredAttributes] = useState(allAttributes);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      setFilteredAttributes(allAttributes);
      setIsFiltering(false);
      return;
    }

    const selectedCategories = categories.filter(cat => 
      selectedCategoryIds.includes(cat.id)
    );

    // Collect attribute slugs from manual mappings
    const manualAttributeSlugs = new Set();
    let hasManualMapping = false;
    
    selectedCategories.forEach(category => {
      const categorySlug = category.slug;
      const mappedAttributes = categoryAttributeMap[categorySlug];
      
      if (mappedAttributes && mappedAttributes.length > 0) {
        hasManualMapping = true;
        mappedAttributes.forEach(slug => manualAttributeSlugs.add(slug));
      }
      
      // Check parent categories too
      if (category.parent && category.parent > 0) {
        const parentCategory = categories.find(c => c.id === category.parent);
        if (parentCategory) {
          const parentMappedAttributes = categoryAttributeMap[parentCategory.slug];
          if (parentMappedAttributes && parentMappedAttributes.length > 0) {
            hasManualMapping = true;
            parentMappedAttributes.forEach(slug => manualAttributeSlugs.add(slug));
          }
        }
      }
    });

    // If manual mapping exists, use it
    if (hasManualMapping && manualAttributeSlugs.size > 0) {
      setIsFiltering(true);
      const filtered = allAttributes.filter(attr => {
        const attrSlug = (attr.slug || '').replace(/^pa_/, '');
        const nameSlug = attr.name.toLowerCase().replace(/\s+/g, '-');
        
        return manualAttributeSlugs.has(attrSlug) || 
               manualAttributeSlugs.has(attr.slug) || 
               manualAttributeSlugs.has(nameSlug) ||
               manualAttributeSlugs.has(attr.name.toLowerCase());
      });

      setFilteredAttributes(filtered.length > 0 ? filtered : allAttributes);
      setIsFiltering(false);
      return;
    }

    // No manual mapping - show all attributes (WooCommerce will handle it)
    setFilteredAttributes(allAttributes);
    setIsFiltering(false);

  }, [selectedCategoryIds, allAttributes, categories]);

  return {
    attributes: filteredAttributes,
    isFiltering,
    hasMapping: filteredAttributes.length < allAttributes.length
  };
}
