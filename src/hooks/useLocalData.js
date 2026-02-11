// src/hooks/useLocalData.js
// React hook to access locally stored WooCommerce data

import { useState, useEffect } from 'react';
import { localDataStore } from '@/lib/localDataStore';
import { dataSyncService } from '@/lib/dataSyncService';

export function useLocalData() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [brandTree, setBrandTree] = useState([]);
  const [categoryAttributeMappings, setCategoryAttributeMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  // Load data from IndexedDB
  const loadLocalData = async (shouldSetLoading = true) => {
    try {
      if (shouldSetLoading) setLoading(true);
      const [cats, brds, attrs, locs, catTree, brdTree, catAttrMap, syncTime] = await Promise.all([
        localDataStore.getCategories(),
        localDataStore.getBrands(),
        localDataStore.getAttributes(),
        localDataStore.getLocations(),
        localDataStore.getCategoryTree(),
        localDataStore.getBrandTree(),
        localDataStore.getCategoryAttributeMappings(),
        localDataStore.getLastSyncTime()
      ]);

      setCategories(cats);
      setBrands(brds);
      setAttributes(attrs);
      setLocations(locs);
      setCategoryTree(catTree);
      setBrandTree(brdTree);
      setCategoryAttributeMappings(catAttrMap);
      setLastSync(syncTime);
      setLoading(false);

      console.log('📦 Loaded from local storage:', {
        categories: cats.length,
        brands: brds.length,
        attributes: attrs.length,
        locations: locs.length,
        categoryTree: catTree.length,
        brandTree: brdTree.length,
        preComputedMappings: catAttrMap.length
      });

      if (locs.length > 0) {
        console.log('📍 Sample location:', locs[0]);
      }

      // Check if data needs refresh
      const needsRefresh = await localDataStore.needsRefresh();

      // Force sync if no data exists, regardless of timestamp
      if (cats.length === 0 && !syncing) {
        console.log('⚠ No local data found. Auto-syncing...');
        syncData(true); // Force sync
      } else if (needsRefresh && !syncing) {
        // Has data but stale - sync in background (non-blocking)
        console.log('⚠ Data is stale (>7 days), syncing in background...');
        syncData(); // Don't await - let it run in background
      }
    } catch (err) {
      console.error('Error loading local data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Sync data from API
  const syncData = async (force = false) => {
    try {
      setSyncing(true);
      setError(null);

      // Listen to progress
      const unsubscribe = dataSyncService.onProgress((progress) => {
        setSyncProgress(progress);
      });

      await dataSyncService.syncAll(force);

      unsubscribe();

      // Reload local data
      await loadLocalData(false);
      setSyncing(false);
      setSyncProgress(null);
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.message);
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadLocalData();
  }, []);

  // Get attributes for a specific category (instant lookup)
  const getAttributesForCategory = (categoryId) => {
    const mapping = categoryAttributeMappings.find(m => m.categoryId === categoryId);

    if (process.env.NODE_ENV !== 'production') {
      const category = categories.find(c => c.id === categoryId);
      if (mapping) {
        console.log(`🎯 Attribute mapping found for "${category?.name}" (${category?.slug}):`, mapping.attributes.length, 'attributes');
      } else if (category) {
        console.log(`⚠️ No attribute mapping for "${category?.name}" (${category?.slug}) - showing all ${attributes.length} attributes`);
      }
    }

    return mapping?.attributes || attributes; // Fallback to all attributes if no mapping
  };

  // Get attributes for multiple categories (optimized - instant)
  const getAttributesForCategories = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return attributes;

    // Use Map for O(1) lookups by attribute ID (much faster than JSON stringify)
    const attributeMap = new Map();

    categoryIds.forEach(catId => {
      const attrs = getAttributesForCategory(catId);
      attrs.forEach(attr => {
        // Use attribute ID as key for deduplication
        if (!attributeMap.has(attr.id)) {
          attributeMap.set(attr.id, attr);
        }
      });
    });

    const result = Array.from(attributeMap.values());

    if (process.env.NODE_ENV !== 'production') {
      const selectedCategories = categories.filter(c => categoryIds.includes(c.id));
      console.log(`📋 Filtered attributes for ${selectedCategories.length} categories:`,
        selectedCategories.map(c => c.name).join(', '),
        `→ ${result.length} attributes (from ${attributes.length} total)`
      );
    }

    return result;
  };

  return {
    // Raw Data
    categories,
    brands,
    attributes,
    locations,

    // Pre-computed Data (instant access)
    categoryTree,
    brandTree,
    categoryAttributeMappings,

    // Helper Functions
    getAttributesForCategory,
    getAttributesForCategories,

    // Status
    loading,
    syncing,
    syncProgress,
    lastSync,
    error,

    // Actions
    syncData,
    refresh: () => syncData(true)
  };
}
