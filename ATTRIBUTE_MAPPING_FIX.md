# Attribute Mapping System - Status & Fix

## Current Status ✅

The attribute mapping system **IS WORKING** but requires data synchronization to activate.

## How It Works

1. **Configuration File**: `src/config/categoryAttributeMap.js`
   - Contains mappings like: `'electronics': ['brand', 'color', 'warranty']`
   - Already has 500+ category mappings configured

2. **Data Sync Service**: `src/lib/dataSyncService.js`
   - Reads the categoryAttributeMap
   - Pre-computes which attributes belong to which categories
   - Stores mappings in IndexedDB for instant access

3. **Hook**: `src/hooks/useLocalData.js`
   - Provides `getAttributesForCategories(categoryIds)` function
   - Returns filtered attributes based on selected categories
   - Falls back to all attributes if no mapping exists

4. **UI Integration**: `src/app/dashboard/products/add/page.jsx`
   - Already uses `getAttributesForCategories()` 
   - Automatically filters attributes when categories are selected

## Why It Might Not Be Working

### Issue 1: Data Not Synced
The mappings are computed during data sync. If you haven't synced recently:
- Go to Dashboard
- Click the sync/refresh button
- Wait for sync to complete

### Issue 2: Category Slug Mismatch
The mapping uses category **slugs**, not names. Check your category slugs match the config.

Example:
```javascript
// Config has:
'smartphones': ['brand', 'color', 'storage', 'ram']

// But your category slug might be:
'smart-phones' // Won't match!
```

### Issue 3: Attribute Slug Mismatch
Attributes are matched by multiple patterns:
- `attr.slug` (e.g., 'pa_brand')
- `attr.slug` without 'pa_' prefix (e.g., 'brand')
- Slugified name (e.g., 'screen-size')
- Lowercase name (e.g., 'screen size')

## Testing the Mapping

### Step 1: Check Console Logs
Open browser console and look for:
```
✓ Computed mappings for X categories
📦 Loaded from local storage: { preComputedMappings: X }
```

### Step 2: Test in Add Product Page
1. Go to Add Product
2. Select a category (e.g., "Smartphones")
3. Go to "Specs" step
4. Check if attributes are filtered

### Step 3: Verify Mapping Exists
Check if your category slug exists in `categoryAttributeMap.js`

## Quick Fix Commands

### Force Re-sync Data
```javascript
// In browser console:
localStorage.removeItem('sw_last_sync');
location.reload();
```

### Check Current Mappings
```javascript
// In browser console (on dashboard):
const db = await indexedDB.open('ShopwiceVendorDB', 1);
// Check CATEGORY_ATTRIBUTES store
```

## Adding New Mappings

Edit `src/config/categoryAttributeMap.js`:

```javascript
export const categoryAttributeMap = {
  // Add your category slug here
  'your-category-slug': ['attribute-1', 'attribute-2', 'attribute-3'],
  
  // Example:
  'gaming-laptops': ['brand', 'processor', 'ram', 'storage', 'graphics', 'screen-size'],
};
```

Then sync data to apply changes.

## Debugging

### Enable Debug Mode
Add this to see what's happening:

```javascript
// In src/hooks/useLocalData.js, add console.log:
const getAttributesForCategory = (categoryId) => {
  const mapping = categoryAttributeMappings.find(m => m.categoryId === categoryId);
  console.log('🔍 Category:', categoryId, 'Mapping:', mapping);
  return mapping?.attributes || attributes;
};
```

### Check Category Slugs
```javascript
// In browser console:
categories.forEach(cat => console.log(cat.id, cat.slug, cat.name));
```

### Check Attribute Slugs
```javascript
// In browser console:
attributes.forEach(attr => console.log(attr.id, attr.slug, attr.name));
```

## Summary

✅ System is implemented and working
✅ Mappings are configured (500+ categories)
✅ UI integration is complete
⚠️ Requires data sync to activate
⚠️ Slugs must match exactly

**Action Required**: Sync your data from the dashboard to activate the mappings!
