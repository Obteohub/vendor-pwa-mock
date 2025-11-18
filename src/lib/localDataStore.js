// src/lib/localDataStore.js
// IndexedDB wrapper for storing WooCommerce data locally

const DB_NAME = 'VendorAppDB';
const DB_VERSION = 2; // Increment version for new stores
const STORES = {
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  ATTRIBUTES: 'attributes',
  LOCATIONS: 'locations',
  METADATA: 'metadata',
  CATEGORY_TREE: 'categoryTree', // Pre-built tree
  BRAND_TREE: 'brandTree', // Pre-built tree
  CATEGORY_ATTRIBUTES: 'categoryAttributes' // Pre-filtered mappings
};

// Cache duration: 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

class LocalDataStore {
  constructor() {
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
          db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.BRANDS)) {
          db.createObjectStore(STORES.BRANDS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ATTRIBUTES)) {
          db.createObjectStore(STORES.ATTRIBUTES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.LOCATIONS)) {
          db.createObjectStore(STORES.LOCATIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORES.CATEGORY_TREE)) {
          db.createObjectStore(STORES.CATEGORY_TREE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.BRAND_TREE)) {
          db.createObjectStore(STORES.BRAND_TREE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.CATEGORY_ATTRIBUTES)) {
          db.createObjectStore(STORES.CATEGORY_ATTRIBUTES, { keyPath: 'categoryId' });
        }
      };
    });
  }

  // Get all items from a store
  async getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save multiple items to a store
  async saveAll(storeName, items) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      // Clear existing data
      store.clear();

      // Add new data
      items.forEach(item => store.add(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get metadata (last sync time, etc.)
  async getMetadata(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.METADATA, 'readonly');
      const store = transaction.objectStore(STORES.METADATA);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Set metadata
  async setMetadata(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.METADATA, 'readwrite');
      const store = transaction.objectStore(STORES.METADATA);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Check if data needs refresh
  async needsRefresh() {
    const lastSync = await this.getMetadata('lastSyncTime');
    if (!lastSync) return true;

    const now = Date.now();
    return (now - lastSync) > CACHE_DURATION;
  }

  // Get categories
  async getCategories() {
    return this.getAll(STORES.CATEGORIES);
  }

  // Save categories
  async saveCategories(categories) {
    await this.saveAll(STORES.CATEGORIES, categories);
    await this.setMetadata('lastSyncTime_categories', Date.now());
  }

  // Get brands
  async getBrands() {
    return this.getAll(STORES.BRANDS);
  }

  // Save brands
  async saveBrands(brands) {
    await this.saveAll(STORES.BRANDS, brands);
    await this.setMetadata('lastSyncTime_brands', Date.now());
  }

  // Get attributes
  async getAttributes() {
    return this.getAll(STORES.ATTRIBUTES);
  }

  // Save attributes
  async saveAttributes(attributes) {
    await this.saveAll(STORES.ATTRIBUTES, attributes);
    await this.setMetadata('lastSyncTime_attributes', Date.now());
  }

  // Get locations
  async getLocations() {
    return this.getAll(STORES.LOCATIONS);
  }

  // Save locations
  async saveLocations(locations) {
    await this.saveAll(STORES.LOCATIONS, locations);
    await this.setMetadata('lastSyncTime_locations', Date.now());
  }

  // Mark sync complete
  async markSyncComplete() {
    await this.setMetadata('lastSyncTime', Date.now());
  }

  // Get last sync time
  async getLastSyncTime() {
    return this.getMetadata('lastSyncTime');
  }

  // Save category tree
  async saveCategoryTree(tree) {
    await this.saveAll(STORES.CATEGORY_TREE, tree);
  }

  // Get category tree
  async getCategoryTree() {
    return this.getAll(STORES.CATEGORY_TREE);
  }

  // Save brand tree
  async saveBrandTree(tree) {
    await this.saveAll(STORES.BRAND_TREE, tree);
  }

  // Get brand tree
  async getBrandTree() {
    return this.getAll(STORES.BRAND_TREE);
  }

  // Save category-attribute mappings
  async saveCategoryAttributeMappings(mappings) {
    await this.saveAll(STORES.CATEGORY_ATTRIBUTES, mappings);
  }

  // Get category-attribute mappings
  async getCategoryAttributeMappings() {
    return this.getAll(STORES.CATEGORY_ATTRIBUTES);
  }

  // Get attributes for specific category
  async getAttributesForCategory(categoryId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.CATEGORY_ATTRIBUTES, 'readonly');
      const store = transaction.objectStore(STORES.CATEGORY_ATTRIBUTES);
      const request = store.get(categoryId);

      request.onsuccess = () => resolve(request.result?.attributes || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data
  async clearAll() {
    await this.init();
    const stores = [
      STORES.CATEGORIES, 
      STORES.BRANDS, 
      STORES.ATTRIBUTES, 
      STORES.LOCATIONS, 
      STORES.METADATA,
      STORES.CATEGORY_TREE,
      STORES.BRAND_TREE,
      STORES.CATEGORY_ATTRIBUTES
    ];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
export const localDataStore = new LocalDataStore();
