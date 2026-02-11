// src/lib/dataSyncService.js
// Service to sync WooCommerce data to IndexedDB

import { localDataStore } from './localDataStore';

class DataSyncService {
  constructor() {
    this.isSyncing = false;
    this.syncProgress = {
      current: '',
      step: 0,
      total: 4,
      details: ''
    };
    this.listeners = [];
  }

  // Add progress listener
  onProgress(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify listeners
  notifyProgress(progress) {
    this.syncProgress = { ...this.syncProgress, ...progress };
    this.listeners.forEach(cb => cb(this.syncProgress));
  }

  // Load all categories from live API
  async loadCategories() {
    try {
      this.notifyProgress({
        current: 'Categories',
        step: 1,
        details: 'Syncing categories from live middleware...'
      });

      // Fetch all categories using the special per_page=-1 flag
      const res = await fetch('/api/vendor/categories?per_page=-1', {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to sync categories: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`[SYNC DEBUG] Categories API returned:`, Array.isArray(data) ? `${data.length} items` : typeof data);

      let categories = Array.isArray(data) ? data : (data.categories || data.data || []);
      
      // Normalize categories to ensure they have required fields
      categories = categories.map(cat => ({
        ...cat,
        id: cat.id || cat.term_id,
        name: cat.name || cat.title || 'Unknown Category',
        parent: (cat.parent === null || cat.parent === undefined) ? 0 : cat.parent
      })).filter(cat => cat.id);

      if (categories.length === 0) {
         console.warn('[SYNC WARNING] Categories API returned 0 items. Check backend or logs.');
      }

      console.log(`✓ Synced ${categories.length} live categories`);
      return categories;
    } catch (error) {
      console.error('[SYNC ERROR] Categories sync failed:', error);
      // Fallback to empty array or local file if needed, but for now throwing error to be visible
      console.warn('Fallback to local mock data due to error');
      try {
        const fallbackRes = await fetch('/data/categories.json');
        if (fallbackRes.ok) return await fallbackRes.json();
      } catch (e) { /* ignore */ }

      return [];
    }
  }

  // Load all brands from local JSON file
  async loadBrands() {
    try {
      this.notifyProgress({
        current: 'Brands',
        step: 2,
        details: 'Syncing brands from live middleware...'
      });

      const res = await fetch('/api/vendor/brands', {
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn(`Brands API error: ${res.status} ${res.statusText}, using empty array`);
        return [];
      }

      const data = await res.json();
      let brandsArr = Array.isArray(data) ? data : (data.brands || data.data || []);

      // Normalize brands to ensure they have required fields
      brandsArr = brandsArr.map(brand => ({
        ...brand,
        id: brand.id || brand.term_id,
        name: brand.name || brand.title || 'Unknown Brand',
        parent: (brand.parent === null || brand.parent === undefined) ? 0 : brand.parent
      })).filter(brand => brand.id);

      if (brandsArr.length === 0) {
         console.warn('[SYNC WARNING] Brands API returned 0 items. Check backend.');
      }

      console.log(`✓ Synced ${brandsArr.length} live brands`);
      return brandsArr;
    } catch (error) {
      console.warn('Error loading brands, using empty array:', error.message);
      return [];
    }
  }

  // Load all attributes from live API
  async loadAttributes() {
    try {
      this.notifyProgress({
        current: 'Attributes',
        step: 3,
        details: 'Syncing attributes from live middleware...'
      });

      const res = await fetch('/api/vendor/attributes', {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to sync attributes: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      let attributes = Array.isArray(data) ? data : (data.attributes || data.data || []);

      // Normalize attributes to ensure they have required fields
      attributes = attributes.map(attr => ({
        ...attr,
        id: attr.id || attr.term_id,
        name: attr.name || attr.title || 'Unknown Attribute',
        slug: attr.slug || (attr.name || '').toLowerCase().replace(/\s+/g, '-')
      })).filter(attr => attr.id);

      if (attributes.length === 0) {
         console.warn('[SYNC WARNING] Attributes API returned 0 items.');
      }

      console.log(`✓ Synced ${attributes.length} live attributes`);
      return attributes;
    } catch (error) {
      console.error('Error loading attributes:', error);
      return [];
    }
  }

  // Load all locations from live API
  async loadLocations() {
    try {
      this.notifyProgress({
        current: 'Locations',
        step: 4,
        details: 'Syncing locations from live middleware...'
      });

      const res = await fetch('/api/vendor/locations?refresh=true', {
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn('Locations API error, using empty array');
        return [];
      }

      const data = await res.json();
      let locations = Array.isArray(data) ? data : (data.locations || data.data || []);

      // Normalize locations to ensure they have required fields for HierarchicalSelector
      // specifically the 'parent' field which is required for the tree builder
      locations = locations.map(loc => ({
        ...loc,
        id: loc.id || loc.term_id,
        name: loc.name || loc.title || 'Unknown Location',
        parent: (loc.parent === null || loc.parent === undefined) ? 0 : loc.parent
      })).filter(loc => loc.id); // Filter out invalid items without ID

      console.log(`✓ Synced ${locations.length} live locations`);
      return locations;
    } catch (error) {
      console.warn('Error loading locations, using empty array:', error.message);
      return [];
    }
  }

  // Build category tree with loop protection and orphan handling
  buildCategoryTree(categories, parentId = 0, depth = 0) {
    if (depth > 20) return [];

    let roots;
    if (depth === 0) {
      const ids = new Set(categories.map(c => Number(c.id)));
      // Root = parent is 0 OR parent is not in our current items list
      roots = categories.filter(cat => (Number(cat.parent || 0) === 0 || !ids.has(Number(cat.parent))));
    } else {
      roots = categories.filter(cat => (Number(cat.parent) === Number(parentId)));
    }

    return roots
      .map(cat => ({
        ...cat,
        children: this.buildCategoryTree(categories, Number(cat.id), depth + 1)
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // Build brand tree with loop protection and orphan handling
  buildBrandTree(brands, parentId = 0, depth = 0) {
    if (depth > 20) return [];

    let roots;
    if (depth === 0) {
      const ids = new Set(brands.map(b => Number(b.id)));
      roots = brands.filter(b => (Number(b.parent || 0) === 0 || !ids.has(Number(b.parent))));
    } else {
      roots = brands.filter(b => (Number(b.parent) === Number(parentId)));
    }

    return roots
      .map(brand => ({
        ...brand,
        children: this.buildBrandTree(brands, Number(brand.id), depth + 1)
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // Pre-compute category-attribute mappings
  async computeCategoryAttributeMappings(categories, attributes) {
    const { categoryAttributeMap } = await import('@/config/categoryAttributeMap');
    const mappings = [];

    console.log('🔄 Computing category-attribute mappings...');

    for (const category of categories) {
      const categorySlug = category.slug;
      const mappedAttributeSlugs = categoryAttributeMap[categorySlug];

      if (mappedAttributeSlugs && mappedAttributeSlugs.length > 0) {
        // Filter attributes for this category
        const categoryAttributes = attributes.filter(attr => {
          if (!attr || (!attr.slug && !attr.name)) return false;
          
          const attrSlug = (attr.slug || '').replace(/^pa_/, '').toLowerCase();
          const attrName = (attr.name || '').toLowerCase();
          const nameSlug = attrName.replace(/\s+/g, '-');

          return mappedAttributeSlugs.includes(attrSlug) ||
            mappedAttributeSlugs.includes(attr.slug) ||
            mappedAttributeSlugs.includes(nameSlug) ||
            mappedAttributeSlugs.includes(attrName);
        });

        if (categoryAttributes.length > 0) {
          mappings.push({
            categoryId: category.id,
            categorySlug: category.slug,
            categoryName: category.name,
            attributes: categoryAttributes
          });
        }
      }
    }

    console.log(`✓ Computed mappings for ${mappings.length} categories`);
    return mappings;
  }

  // Sync all data from static JSON files
  async syncAll(force = false) {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return false;
    }

    // Check if sync is needed
    if (!force) {
      const needsRefresh = await localDataStore.needsRefresh();
      if (!needsRefresh) {
        console.log('Data is still fresh, skipping sync');
        return false;
      }
    }

    this.isSyncing = true;
    console.log('🔄 Starting data sync from local JSON files...');

    try {
      // STEP 1: Load all data from live API
      const categories = await this.loadCategories();
      const brands = await this.loadBrands();
      const attributes = await this.loadAttributes();
      const locations = await this.loadLocations();

      // STEP 2: Build trees (if not pre-built in JSON)
      this.notifyProgress({ details: 'Building category tree...' });
      const categoryTree = this.buildCategoryTree(categories);

      console.log(`[SYNC DEBUG] Category tree built: ${categoryTree.length} root nodes from ${categories.length} categories`);
      if (categoryTree.length === 0 && categories.length > 0) {
        console.warn('[SYNC WARNING] Category tree is empty but categories were fetched. Check parent IDs.');
        // Sample check
        console.log('[SYNC DEBUG] Sample category parent IDs:', categories.slice(0, 5).map(c => `${c.name}: ${c.parent}`));
      }

      this.notifyProgress({ details: 'Building brand tree...' });
      const brandTree = this.buildBrandTree(brands);

      // STEP 3: Compute category-attribute mappings
      this.notifyProgress({ details: 'Computing category-attribute mappings...' });
      const categoryAttributeMappings = await this.computeCategoryAttributeMappings(categories, attributes);

      // STEP 4: Save everything to IndexedDB
      this.notifyProgress({ details: 'Saving to local storage...' });
      await localDataStore.saveCategories(categories);
      await localDataStore.saveBrands(brands);
      await localDataStore.saveAttributes(attributes);
      await localDataStore.saveLocations(locations);
      await localDataStore.saveCategoryTree(categoryTree);
      await localDataStore.saveBrandTree(brandTree);
      await localDataStore.saveCategoryAttributeMappings(categoryAttributeMappings);
      await localDataStore.markSyncComplete();

      console.log('✅ Data sync complete from local JSON files!');
      console.log(`  Categories: ${categories.length} (Tree nodes: ${categoryTree.length})`);
      console.log(`  Brands: ${brands.length} (Tree nodes: ${brandTree.length})`);
      console.log(`  Attributes: ${attributes.length}`);
      console.log(`  Locations: ${locations.length}`);
      console.log(`  Pre-computed mappings: ${categoryAttributeMappings.length}`);

      this.isSyncing = false;
      return true;
    } catch (error) {
      console.error('❌ Data sync failed:', error);
      this.isSyncing = false;
      throw error;
    }
  }

  // Get sync status
  async getSyncStatus() {
    const lastSync = await localDataStore.getLastSyncTime();
    const needsRefresh = await localDataStore.needsRefresh();

    return {
      lastSync,
      needsRefresh,
      isSyncing: this.isSyncing,
      lastSyncDate: lastSync ? new Date(lastSync) : null
    };
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
