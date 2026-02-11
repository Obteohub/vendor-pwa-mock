# How Categories Are Fetched in Vendor PWA Mock

## 📋 Overview

This vendor PWA uses a **hybrid caching strategy** that combines:
1. **Static JSON files** (for initial data seeding)
2. **IndexedDB** (browser-side persistent cache)
3. **Live API calls** (for fresh data)
4. **Lazy loading** (on-demand fetching of subcategories)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Flow Diagram                        │
└─────────────────────────────────────────────────────────────┘

1. App Initialization
   ↓
2. Load from IndexedDB Cache (Instant - 0ms)
   ↓
3. Display Cached Categories (if available)
   ↓
4. Fetch Fresh Root Categories from API (Background)
   ↓
5. Merge & Update Cache
   ↓
6. Lazy Load Subcategories (On-Demand)
```

---

## 📂 File Structure

```
vendor-pwa-mock/
├── public/
│   └── data/
│       ├── categories.json      ← Static category data
│       ├── brands.json
│       ├── attributes.json
│       └── locations.json
├── src/
│   ├── lib/
│   │   ├── localDataStore.js    ← IndexedDB wrapper
│   │   └── dataSyncService.js   ← JSON file loader (legacy)
│   └── hooks/
│       └── useLocalData.js      ← Main data fetching hook
```

---

## 🔄 How Categories Are Fetched

### **Step 1: Initial Load (Cache-First)**

**File:** `src/hooks/useLocalData.js` (Lines 40-114)

```javascript
const loadFromCache = async () => {
  setLoading(true);
  console.log('📂 Loading data from local cache...');

  // 1. Load from IndexedDB (instant)
  const [rawCats, brds, attrs, locs, lastSyncTime] = await Promise.all([
    localDataStore.getCategories(),
    localDataStore.getBrands(),
    localDataStore.getAttributes(),
    localDataStore.getLocations(),
    localDataStore.getLastSyncTime()
  ]);

  // 2. Filter hidden categories
  const cats = filterHiddenCategories(rawCats);

  if (cats.length > 0) {
    // 3. Build category tree
    const catTree = buildCategoryTree(cats);
    
    // 4. Set state immediately (0ms latency)
    setCategories(cats);
    setCategoryTree(catTree);
    
    console.log('✅ Loaded from Cache:', cats.length, 'categories');
  }

  // 5. ALWAYS fetch fresh data in background
  Promise.all([
    fetchRootCategories(),
    fetchBrands(),
    fetchAttributes(),
    fetchLocations()
  ]).finally(() => {
    setLoading(false);
  });
};
```

**Key Points:**
- ✅ **Instant display** if cache exists
- ✅ **Background refresh** ensures data is fresh
- ✅ **No blocking** - UI is responsive immediately

---

### **Step 2: Fetch Root Categories from API**

**File:** `src/hooks/useLocalData.js` (Lines 122-181)

```javascript
const fetchRootCategories = async () => {
  console.log('🔄 Fetching root categories...');

  // API call to fetch ONLY root categories (parent=0)
  const res = await fetch('/api/vendor/categories?per_page=100', {
    credentials: 'include'
  });

  const data = await res.json();
  const roots = data.categories || [];

  // Merge with existing categories
  setCategories(prev => {
    const catMap = new Map(prev.map(c => [c.id, c]));
    
    // Overwrite with fresh data
    roots.forEach(root => {
      catMap.set(root.id, root);
    });

    const updated = Array.from(catMap.values());

    // Rebuild tree
    const tree = buildCategoryTree(updated);
    setCategoryTree(tree);

    // Save to IndexedDB cache
    localDataStore.saveCategories(updated);
    
    return updated;
  });

  return roots;
};
```

**API Endpoint:** `/api/vendor/categories?per_page=100`

**What it fetches:**
- Only **root categories** (parent = 0)
- Maximum 100 categories per request
- Includes category metadata (id, name, slug, image, etc.)

---

### **Step 3: Lazy Load Subcategories (On-Demand)**

**File:** `src/hooks/useLocalData.js` (Lines 300-369)

```javascript
const fetchCategoryChildren = async (parentId, force = false) => {
  // Return early if already fetched
  if (!force && fetchedParentIds.has(parentId)) {
    return categories.filter(c => c.parent == parentId);
  }

  // Deduplication: avoid duplicate requests
  if (!force && pendingFetches.current.has(parentId)) {
    return pendingFetches.current.get(parentId);
  }

  const fetchPromise = (async () => {
    console.log(`🔄 Fetching children for category ${parentId}...`);

    // Fetch children for specific parent
    const res = await fetch(
      `/api/vendor/categories?parent=${parentId}&per_page=100`,
      { credentials: 'include' }
    );

    const data = await res.json();
    const children = data.categories || [];

    // Mark as fetched
    setFetchedParentIds(prev => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    if (children.length > 0) {
      // Merge children into existing categories
      setCategories(prev => {
        const catMap = new Map(prev.map(c => [c.id, c]));
        children.forEach(child => {
          catMap.set(child.id, child);
        });

        const updated = Array.from(catMap.values());

        // Rebuild tree
        setCategoryTree(buildCategoryTree(updated));

        // Save to cache
        localDataStore.saveCategories(updated);
        
        return updated;
      });
    }

    return children;
  })();

  pendingFetches.current.set(parentId, fetchPromise);
  return fetchPromise;
};
```

**API Endpoint:** `/api/vendor/categories?parent={parentId}&per_page=100`

**When it's called:**
- When user expands a category in the UI
- Only fetches children for that specific parent
- Prevents redundant requests with deduplication

---

### **Step 4: IndexedDB Caching**

**File:** `src/lib/localDataStore.js`

```javascript
class LocalDataStore {
  // Save categories to IndexedDB
  async saveCategories(categories) {
    await this.saveAll(STORES.CATEGORIES, categories);
    await this.setMetadata('lastSyncTime_categories', Date.now());
  }

  // Get categories from IndexedDB
  async getCategories() {
    return this.getAll(STORES.CATEGORIES);
  }

  // Check if cache needs refresh (7 days expiry)
  async needsRefresh() {
    const lastSync = await this.getMetadata('lastSyncTime');
    if (!lastSync) return true;

    const now = Date.now();
    const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    return (now - lastSync) > CACHE_DURATION;
  }
}
```

**Cache Strategy:**
- ✅ **7-day cache duration**
- ✅ **Persistent across sessions**
- ✅ **Automatic expiry**
- ✅ **Graceful fallback** if IndexedDB unavailable

---

## 🎯 API Endpoints

### 1. **Fetch Root Categories**
```
GET /api/vendor/categories?per_page=100
```

**Response:**
```json
{
  "categories": [
    {
      "id": 123,
      "name": "Electronics",
      "slug": "electronics",
      "parent": 0,
      "image": {
        "sourceUrl": "https://...",
        "altText": "Electronics"
      }
    }
  ]
}
```

### 2. **Fetch Subcategories**
```
GET /api/vendor/categories?parent={parentId}&per_page=100
```

**Response:**
```json
{
  "categories": [
    {
      "id": 456,
      "name": "Smartphones",
      "slug": "smartphones",
      "parent": 123,
      "image": { ... }
    }
  ]
}
```

---

## 📊 Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **First Load (Cache Hit)** | 0-50ms | Instant from IndexedDB |
| **First Load (Cache Miss)** | 500-2000ms | API fetch required |
| **Subsequent Loads** | 0-50ms | Always from cache |
| **Subcategory Expansion** | 200-800ms | Lazy loaded on-demand |
| **Cache Duration** | 7 days | Auto-refresh after expiry |

---

## 🔧 Key Optimizations

### 1. **Cache-First Strategy**
```javascript
// Load from cache immediately
const cached = await localDataStore.getCategories();
if (cached.length > 0) {
  setCategories(cached); // Instant display
}

// Fetch fresh data in background
fetchRootCategories(); // Non-blocking
```

### 2. **Lazy Loading**
```javascript
// Only fetch children when needed
<CategoryItem 
  onExpand={() => fetchCategoryChildren(category.id)}
/>
```

### 3. **Request Deduplication**
```javascript
// Prevent duplicate requests
if (pendingFetches.current.has(parentId)) {
  return pendingFetches.current.get(parentId);
}
```

### 4. **Tree Building**
```javascript
// Build hierarchical tree from flat array
const buildCategoryTree = (categories) => {
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent == 0) {
      roots.push(map[cat.id]);
    } else if (map[cat.parent]) {
      map[cat.parent].children.push(map[cat.id]);
    }
  });

  return roots;
};
```

---

## 🆚 Comparison: Vendor PWA vs. Main Web App

| Feature | **Vendor PWA** | **Main Web App** |
|---------|----------------|------------------|
| **Data Source** | REST API | GraphQL API |
| **Caching** | IndexedDB (7 days) | localStorage (24 hours) |
| **Loading Strategy** | Cache-first + Background refresh | Cache-first only |
| **Subcategories** | Lazy loaded on-demand | All fetched upfront |
| **Tree Depth** | Unlimited (lazy) | 3 levels (eager) |
| **Request Type** | Multiple (roots + children) | Single (all levels) |

---

## 🚀 Implementation in Mobile App

To replicate this in your mobile app:

### **Option 1: Vendor PWA Pattern (Lazy Loading)**

```javascript
// services/categoryService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const categoryService = {
  // 1. Load from cache
  async getCategories() {
    const cached = await AsyncStorage.getItem('@categories');
    if (cached) {
      return JSON.parse(cached);
    }
    return this.fetchRootCategories();
  },

  // 2. Fetch roots only
  async fetchRootCategories() {
    const res = await fetch('https://api.example.com/categories?per_page=100');
    const data = await res.json();
    
    await AsyncStorage.setItem('@categories', JSON.stringify(data.categories));
    return data.categories;
  },

  // 3. Lazy load children
  async fetchCategoryChildren(parentId) {
    const res = await fetch(
      `https://api.example.com/categories?parent=${parentId}&per_page=100`
    );
    const data = await res.json();
    
    // Merge with existing cache
    const cached = await this.getCategories();
    const merged = [...cached, ...data.categories];
    await AsyncStorage.setItem('@categories', JSON.stringify(merged));
    
    return data.categories;
  }
};
```

### **Option 2: Main Web App Pattern (Single Query)**

Use the GraphQL query from the documentation I created earlier:

```graphql
query Categories {
  productCategories(first: 50, where: { parent: 0 }) {
    nodes {
      id, name, slug
      children(first: 20) {
        nodes {
          id, name, slug
          children(first: 20) {
            nodes { id, name, slug }
          }
        }
      }
    }
  }
}
```

**Recommendation:** Use **Option 2** (GraphQL single query) for mobile apps because:
- ✅ Simpler implementation
- ✅ Fewer network requests
- ✅ Better offline support
- ✅ Matches your main web app

---

## 📝 Summary

**Vendor PWA Category Fetching:**

1. **Cache-First:** Load from IndexedDB instantly (0ms)
2. **Background Refresh:** Fetch fresh roots from API
3. **Lazy Loading:** Load subcategories on-demand
4. **Persistent Cache:** 7-day expiry in IndexedDB
5. **REST API:** Multiple endpoints for roots and children

**Best for Mobile:**
- Use the **Main Web App pattern** (single GraphQL query)
- Cache in AsyncStorage/SQLite
- Preload on app launch
- Display instantly from cache

This gives you the **best of both worlds**: instant performance + fresh data! 🚀
