# 🎯 Category-Specific Attributes Implementation

## Goal

When a user selects a category, only show attributes that are relevant to that category instead of loading all attributes.

## Implementation Plan

### Option 1: WordPress Native (Recommended)

WordPress/WooCommerce doesn't have built-in category-attribute relationships. We need to:

1. **Create a mapping in WordPress** (one-time setup)
2. **Store category-attribute relationships** in product category meta
3. **Filter attributes based on selected categories**

### Option 2: Custom Mapping (Faster)

Create a custom mapping file that defines which attributes belong to which categories.

---

## Implementation Steps

### Step 1: Create Category-Attribute Mapping API

Create an endpoint that returns attributes for specific categories.

### Step 2: Update Product Form

Modify the form to:
1. Watch for category selection changes
2. Fetch attributes for selected categories
3. Filter attribute dropdown based on categories

### Step 3: Handle Multiple Categories

When multiple categories are selected, show attributes from ALL selected categories (union).

---

## Code Changes Needed

### 1. New API Endpoint

`src/app/api/vendor/categories/[id]/attributes/route.js`

Returns attributes for a specific category.

### 2. Update Product Form

Modify `src/app/dashboard/products/add/page.jsx`:
- Add `useEffect` to watch category changes
- Fetch category-specific attributes
- Pass filtered attributes to `AttributeSelector`

### 3. Update AttributeSelector

Modify `src/components/AttributeSelector.jsx`:
- Accept filtered attributes
- Show loading state while fetching
- Handle empty state

---

## WordPress Setup (One-Time)

You'll need to configure which attributes belong to which categories in WordPress.

### Method A: Using Category Meta (Recommended)

Add custom fields to categories defining their attributes.

### Method B: Using a Mapping File

Create a JSON file mapping categories to attributes.

---

Let me implement this for you!
