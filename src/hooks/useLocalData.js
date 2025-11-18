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
  const loadLocalData = async () => {
    try {
      setLoading(true);
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

      // Check if data needs refresh
      const needsRefresh = await localDataStore.needsRefresh();
      if (needsRefresh && cats.length === 0) {
        // No data found - DON'T auto-sync, just show empty state
        console.log('⚠ No local data found. Please sync data from dashboard.');
      } else if (needsRefresh) {
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
      await loadLocalData();
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
    
    return Array.from(attributeMap.values());
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
