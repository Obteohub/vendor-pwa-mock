"use client";

import { useState, useEffect } from 'react';
import { categoryAttributeMap } from '@/config/categoryAttributeMap';

/**
 * Hook to filter attributes based on selected categories
 * 
 * This provides category-specific attribute filtering using mappings.
 */
export function useCategoryAttributes(selectedCategoryIds, allAttributes, categories) {
  const [filteredAttributes, setFilteredAttributes] = useState(allAttributes);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    // If no categories selected, show all attributes
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      setFilteredAttributes(allAttributes);
      setIsFiltering(false);
      return;
    }

    // Get selected category slugs
    const selectedCategories = categories.filter(cat => 
      selectedCategoryIds.includes(cat.id)
    );

    console.log('[Attribute Filter] Selected categories:', selectedCategories.map(c => c.slug));

    // Collect all attribute slugs for selected categories
    const relevantAttributeSlugs = new Set();
    let hasMappingForAnyCategory = false;
    
    selectedCategories.forEach(category => {
      // Check if category has specific attributes mapped
      const categorySlug = category.slug;
      const mappedAttributes = categoryAttributeMap[categorySlug];
      
      console.log(`[Attribute Filter] Checking category "${categorySlug}":`, mappedAttributes);
      
      if (mappedAttributes && mappedAttributes.length > 0) {
        hasMappingForAnyCategory = true;
        mappedAttributes.forEach(slug => relevantAttributeSlugs.add(slug));
      }
      
      // Also check parent categories
      if (category.parent && category.parent > 0) {
        const parentCategory = categories.find(c => c.id === category.parent);
        if (parentCategory) {
          const parentMappedAttributes = categoryAttributeMap[parentCategory.slug];
          console.log(`[Attribute Filter] Checking parent "${parentCategory.slug}":`, parentMappedAttributes);
          if (parentMappedAttributes && parentMappedAttributes.length > 0) {
            hasMappingForAnyCategory = true;
            parentMappedAttributes.forEach(slug => relevantAttributeSlugs.add(slug));
          }
        }
      }
    });

    console.log('[Attribute Filter] Relevant attribute slugs:', Array.from(relevantAttributeSlugs));
    console.log('[Attribute Filter] Available attributes:', allAttributes.map(a => ({ name: a.name, slug: a.slug })));

    // If no mapping found for any selected category, show all attributes
    if (!hasMappingForAnyCategory || relevantAttributeSlugs.size === 0) {
      console.log('[Attribute Filter] No mapping found, showing all attributes');
      setFilteredAttributes(allAttributes);
      setIsFiltering(false);
      return;
    }

    // Filter attributes based on collected slugs
    // Match by slug, handling WooCommerce 'pa_' prefix and various formats
    setIsFiltering(true);
    const filtered = allAttributes.filter(attr => {
      // Get the attribute slug without 'pa_' prefix if present
      const attrSlug = (attr.slug || '').replace(/^pa_/, '');
      const nameSlug = attr.name.toLowerCase().replace(/\s+/g, '-');
      
      // Check multiple matching strategies
      const match = relevantAttributeSlugs.has(attrSlug) || 
                    relevantAttributeSlugs.has(attr.slug) || 
                    relevantAttributeSlugs.has(nameSlug) ||
                    relevantAttributeSlugs.has(attr.name.toLowerCase()) ||
                    relevantAttributeSlugs.has(attr.name.toLowerCase().replace(/\s+/g, ''));
      
      if (match) {
        console.log(`[Attribute Filter] ✓ Matched: ${attr.name} (${attr.slug}) -> ${attrSlug}`);
      }
      return match;
    });

    console.log('[Attribute Filter] Filtered attributes:', filtered.length, 'out of', allAttributes.length);
    setFilteredAttributes(filtered.length > 0 ? filtered : allAttributes);
    setIsFiltering(false);

  }, [selectedCategoryIds, allAttributes, categories]);

  return {
    attributes: filteredAttributes,
    isFiltering,
    hasMapping: filteredAttributes.length < allAttributes.length
  };
}
