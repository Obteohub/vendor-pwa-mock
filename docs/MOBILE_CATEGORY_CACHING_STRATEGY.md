# Mobile App Category Caching Strategy

## Overview
This document explains how to replicate the web app's fast category loading performance in your mobile application using local persistence and efficient GraphQL queries.

---

## 🚀 Web App Pattern (Current Implementation)

### Why Categories Load Instantly
The web app achieves **0ms latency** for category navigation by using **aggressive local caching**.

### Implementation Logic

#### 1. **Cache-First Strategy**
```javascript
// Pseudocode from MegaMenu.component.tsx (Lines 18-59)
useEffect(() => {
  // Step 1: Check local cache FIRST
  const cachedData = localStorage.getItem('shopwice_menu_cache');
  
  if (cachedData) {
    // ✅ Cache hit - instant display (0ms)
    setCategories(JSON.parse(cachedData));
    setLoading(false);
    return; // Exit early - no network request needed
  }
  
  // Step 2: Only fetch if cache is empty
  fetchCategoriesFromAPI()
    .then(data => {
      setCategories(data);
      // Save to cache for next time
      localStorage.setItem('shopwice_menu_cache', JSON.stringify(data));
      setLoading(false);
    });
}, []);
```

#### 2. **Single Efficient GraphQL Query**
The web app fetches the **entire category tree** (3 levels deep) in **one request**:

```graphql
query Categories {
  productCategories(first: 50, where: { parent: 0 }) {
    nodes {
      id
      name
      slug
      children(first: 20) {
        nodes {
          id
          name
          slug
          children(first: 20) {
            nodes {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
}
```

**Key Benefits:**
- ✅ Fetches all 3 levels in one round-trip
- ✅ Avoids N+1 query problems
- ✅ Reduces network overhead

---

## 📱 Mobile App Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  App Launch / Background Sync                   │
│  ↓                                              │
│  Fetch Categories (GraphQL)                     │
│  ↓                                              │
│  Save to Local Storage (AsyncStorage/SQLite)    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  User Opens Menu/Drawer                         │
│  ↓                                              │
│  Read from Local Storage (Instant)              │
│  ↓                                              │
│  Display Categories (0ms latency)               │
└─────────────────────────────────────────────────┘
```

### Step-by-Step Implementation

#### **Step 1: Create Category Service**

```javascript
// services/categoryService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';

const CATEGORY_CACHE_KEY = '@shopwice_categories';
const CACHE_EXPIRY_KEY = '@shopwice_categories_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const CATEGORIES_QUERY = gql`
  query Categories {
    productCategories(first: 50, where: { parent: 0 }) {
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        children(first: 20) {
          nodes {
            id
            name
            slug
            image {
              sourceUrl
              altText
            }
            children(first: 20) {
              nodes {
                id
                name
                slug
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const categoryService = {
  /**
   * Get categories - Cache-first strategy
   */
  async getCategories() {
    try {
      // 1. Check cache first
      const cached = await this.getCachedCategories();
      if (cached) {
        console.log('✅ Categories loaded from cache');
        return cached;
      }

      // 2. Fetch from API if cache miss
      console.log('🌐 Fetching categories from API...');
      const categories = await this.fetchCategoriesFromAPI();
      
      // 3. Save to cache
      await this.saveCategoriesToCache(categories);
      
      return categories;
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      throw error;
    }
  },

  /**
   * Fetch categories from GraphQL API
   */
  async fetchCategoriesFromAPI() {
    const { data } = await apolloClient.query({
      query: CATEGORIES_QUERY,
      fetchPolicy: 'network-only', // Always get fresh data when fetching
    });

    return data.productCategories.nodes;
  },

  /**
   * Get cached categories (if valid)
   */
  async getCachedCategories() {
    try {
      const [cachedData, expiryTime] = await Promise.all([
        AsyncStorage.getItem(CATEGORY_CACHE_KEY),
        AsyncStorage.getItem(CACHE_EXPIRY_KEY),
      ]);

      if (!cachedData || !expiryTime) {
        return null;
      }

      // Check if cache is expired
      const now = Date.now();
      if (now > parseInt(expiryTime, 10)) {
        console.log('⏰ Cache expired');
        await this.clearCache();
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  },

  /**
   * Save categories to cache
   */
  async saveCategoriesToCache(categories) {
    try {
      const expiryTime = Date.now() + CACHE_DURATION;
      
      await Promise.all([
        AsyncStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(categories)),
        AsyncStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString()),
      ]);

      console.log('💾 Categories saved to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  },

  /**
   * Clear category cache
   */
  async clearCache() {
    await Promise.all([
      AsyncStorage.removeItem(CATEGORY_CACHE_KEY),
      AsyncStorage.removeItem(CACHE_EXPIRY_KEY),
    ]);
  },

  /**
   * Force refresh categories
   */
  async refreshCategories() {
    await this.clearCache();
    return this.getCategories();
  },
};
```

#### **Step 2: Preload Categories on App Launch**

```javascript
// App.js or index.js

import { categoryService } from './services/categoryService';

export default function App() {
  useEffect(() => {
    // Preload categories in background on app launch
    categoryService.getCategories().catch(console.error);
  }, []);

  return <NavigationContainer>{/* ... */}</NavigationContainer>;
}
```

#### **Step 3: Use in Menu/Drawer Component**

```javascript
// components/CategoryDrawer.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { categoryService } from '../services/categoryService';

export default function CategoryDrawer() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // This will be INSTANT if cache exists
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CategoryItem category={item} />
      )}
    />
  );
}
```

---

## 🎯 Key Implementation Points

### ✅ DO's
1. **Fetch categories ONCE** on app launch or in background
2. **Save to local storage** (AsyncStorage, SQLite, or Hive)
3. **Read from cache first** when user opens menu
4. **Use a single GraphQL query** to get all levels at once
5. **Set cache expiry** (e.g., 24 hours) to keep data fresh
6. **Include images** in the query for better UX

### ❌ DON'Ts
1. **Don't fetch on every screen load** - Use cache!
2. **Don't make multiple queries** for nested categories
3. **Don't skip cache validation** - Check expiry
4. **Don't forget error handling** - Cache might be corrupted

---

## 🔄 Cache Invalidation Strategy

### When to Refresh Cache
- **On app launch** (background check)
- **After 24 hours** (automatic expiry)
- **Manual refresh** (pull-to-refresh gesture)
- **After category changes** (if user is vendor/admin)

### Implementation
```javascript
// Pull-to-refresh example
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await categoryService.refreshCategories();
  await loadCategories();
  setRefreshing(false);
};

<FlatList
  data={categories}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

---

## 📊 Performance Comparison

| Approach | First Load | Subsequent Loads | Network Requests |
|----------|-----------|------------------|------------------|
| **No Cache** | 500-2000ms | 500-2000ms | Every time |
| **With Cache** | 500-2000ms | **0-50ms** ✅ | Once per 24h |

---

## 🔧 Advanced: SQLite for Large Catalogs

For apps with **1000+ categories**, consider using SQLite instead of AsyncStorage:

```javascript
// Using expo-sqlite or react-native-sqlite-storage

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('shopwice.db');

export const sqliteCategoryService = {
  async initDB() {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );`
      );
    });
  },

  async saveCategories(categories) {
    const data = JSON.stringify(categories);
    const timestamp = Date.now();

    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO categories (id, data, updated_at) VALUES (?, ?, ?)',
        ['main', data, timestamp]
      );
    });
  },

  async getCategories() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT data FROM categories WHERE id = ? AND updated_at > ?',
          ['main', Date.now() - CACHE_DURATION],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(JSON.parse(rows.item(0).data));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },
};
```

---

## 🎨 UI/UX Recommendations

### Loading States
```javascript
// Show cached data immediately, refresh in background
const [categories, setCategories] = useState([]);
const [isRefreshing, setIsRefreshing] = useState(false);

useEffect(() => {
  // Load from cache instantly
  categoryService.getCachedCategories().then(cached => {
    if (cached) setCategories(cached);
  });

  // Refresh in background
  categoryService.getCategories().then(fresh => {
    setCategories(fresh);
  });
}, []);
```

### Skeleton Screens
Only show skeleton on **first launch** (no cache). Otherwise, show cached data immediately.

---

## 📝 Summary

**Web App Strategy:**
- ✅ Cache-first approach using `localStorage`
- ✅ Single GraphQL query for entire tree
- ✅ Instant menu display (0ms latency)

**Mobile App Implementation:**
- ✅ Use AsyncStorage/SQLite for persistence
- ✅ Preload on app launch
- ✅ Read from cache when menu opens
- ✅ Refresh in background every 24h
- ✅ Same GraphQL query structure

**Result:** Mobile app will have the **same instant performance** as your web app! 🚀
