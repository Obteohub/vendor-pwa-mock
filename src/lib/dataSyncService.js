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

  // Load all categories from local JSON file
  async loadCategories() {
    try {
      this.notifyProgress({ 
        current: 'Categories',
        step: 1,
        details: 'Loading categories from local file...' 
      });

      const res = await fetch('/data/categories.json', {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to load categories: ${res.status}`);
      }

      const data = await res.json();
      
      // Handle both formats: array or object with categories property
      const categories = Array.isArray(data) ? data : (data.categories || []);

      console.log(`✓ Loaded ${categories.length} categories from local file`);
      return categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }

  // Load all brands from local JSON file
  async loadBrands() {
    try {
      this.notifyProgress({ 
        current: 'Brands',
        step: 2,
        details: 'Loading brands from local file...' 
      });

      const res = await fetch('/data/brands.json', {
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn('Brands file not found, using empty array');
        return [];
      }

      const data = await res.json();
      
      // Handle both formats: array or object with brands property
      const brands = Array.isArray(data) ? data : (data.brands || []);

      console.log(`✓ Loaded ${brands.length} brands from local file`);
      return brands;
    } catch (error) {
      console.warn('Error loading brands, using empty array:', error.message);
      return [];
    }
  }

  // Load all attributes from local JSON file
  async loadAttributes() {
    try {
      this.notifyProgress({ 
        current: 'Attributes',
        step: 3,
        details: 'Loading attributes from local file...' 
      });

      const res = await fetch('/data/attributes.json', {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to load attributes: ${res.status}`);
      }

      const data = await res.json();
      
      // Handle both formats: array or object with attributes property
      const attributes = Array.isArray(data) ? data : (data.attributes || []);

      console.log(`✓ Loaded ${attributes.length} attributes from local file`);
      return attributes;
    } catch (error) {
      console.error('Error loading attributes:', error);
      throw error;
    }
  }

  // Load all locations from local JSON file
  async loadLocations() {
    try {
      this.notifyProgress({ 
        current: 'Locations',
        step: 4,
        details: 'Loading locations from local file...' 
      });

      const res = await fetch('/data/locations.json', {
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn('Locations file not found, using empty array');
        return [];
      }

      const data = await res.json();
      
      // Handle both formats: array or object with locations property
      const locations = Array.isArray(data) ? data : (data.locations || []);

      console.log(`✓ Loaded ${locations.length} locations from local file`);
      return locations;
    } catch (error) {
      console.warn('Error loading locations, using empty array:', error.message);
      return [];
    }
  }

  // Build category tree
  buildCategoryTree(categories, parentId = 0) {
    return categories
      .filter(cat => (cat.parent || 0) === parentId)
      .map(cat => ({
        ...cat,
        children: this.buildCategoryTree(categories, cat.id)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Build brand tree
  buildBrandTree(brands, parentId = 0) {
    return brands
      .filter(brand => (brand.parent || 0) === parentId)
      .map(brand => ({
        ...brand,
        children: this.buildBrandTree(brands, brand.id)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
          const attrSlug = (attr.slug || '').replace(/^pa_/, '');
          const nameSlug = attr.name.toLowerCase().replace(/\s+/g, '-');
          
          return mappedAttributeSlugs.includes(attrSlug) || 
                 mappedAttributeSlugs.includes(attr.slug) || 
                 mappedAttributeSlugs.includes(nameSlug) ||
                 mappedAttributeSlugs.includes(attr.name.toLowerCase());
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
      // STEP 1: Load all data from local JSON files
      const categories = await this.loadCategories();
      const brands = await this.loadBrands();
      const attributes = await this.loadAttributes();
      const locations = await this.loadLocations();

      // STEP 2: Build trees (if not pre-built in JSON)
      this.notifyProgress({ details: 'Building category tree...' });
      const categoryTree = this.buildCategoryTree(categories);
      
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
