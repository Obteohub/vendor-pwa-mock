# 📁 Organized Category-Attribute Mappings Guide

## Structure Created

```
src/config/
├── categoryAttributeMap.js          # Main file (imports all mappings)
└── attributeMappings/
    ├── README.md                     # Documentation
    ├── _template.js                  # Template for new files
    └── [your-category-files].js      # Your mapping files go here
```

---

## How to Add Your Mappings

### Step 1: List Your Main Categories

First, identify your main categories. For example:
- Fashion & Clothing
- Electronics
- Home & Garden
- Sports & Outdoors
- Beauty & Health
- etc.

### Step 2: Create a File for Each Main Category

For each main category, create a file in `src/config/attributeMappings/`:

**Example: Fashion**

Create `src/config/attributeMappings/fashion.js`:

```javascript
/**
 * Fashion & Clothing Category Mappings
 */
export const fashionMappings = {
  // Main category
  'fashion': ['size', 'color', 'material', 'brand'],
  
  // Clothing
  'clothing': ['size', 'color', 'material', 'brand', 'gender'],
  'mens-clothing': ['size', 'color', 'material', 'brand', 'fit'],
  'womens-clothing': ['size', 'color', 'material', 'brand', 'fit'],
  
  // Specific items
  'shirts': ['size', 'color', 'material', 'collar-type', 'sleeve-length'],
  't-shirts': ['size', 'color', 'material', 'neck-type'],
  'pants': ['size', 'color', 'material', 'fit', 'length'],
  'jeans': ['size', 'color', 'fit', 'wash'],
  'dresses': ['size', 'color', 'material', 'length', 'style'],
  
  // Footwear
  'shoes': ['size', 'color', 'material', 'style'],
  'sneakers': ['size', 'color', 'material', 'style'],
  'boots': ['size', 'color', 'material', 'height'],
  
  // Accessories
  'bags': ['color', 'material', 'size', 'style'],
  'jewelry': ['material', 'color', 'size'],
  'watches': ['brand', 'color', 'material', 'movement-type'],
};
```

**Example: Electronics**

Create `src/config/attributeMappings/electronics.js`:

```javascript
/**
 * Electronics Category Mappings
 */
export const electronicsMappings = {
  // Main category
  'electronics': ['brand', 'color', 'warranty'],
  
  // Mobile devices
  'phones': ['brand', 'color', 'storage', 'ram', 'screen-size'],
  'smartphones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'camera'],
  'tablets': ['brand', 'color', 'storage', 'screen-size', 'connectivity'],
  
  // Computers
  'laptops': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os'],
  'desktops': ['brand', 'processor', 'ram', 'storage', 'os'],
  'monitors': ['brand', 'screen-size', 'resolution', 'refresh-rate'],
  
  // Audio
  'headphones': ['brand', 'color', 'connection-type', 'noise-cancellation'],
  'speakers': ['brand', 'color', 'connection-type', 'power'],
};
```

### Step 3: Import in Main File

Edit `src/config/categoryAttributeMap.js`:

```javascript
// Import your mapping files
import { fashionMappings } from './attributeMappings/fashion';
import { electronicsMappings } from './attributeMappings/electronics';
// ... import more as you create them

// Combine all mappings
export const categoryAttributeMap = {
  ...fashionMappings,
  ...electronicsMappings,
  // ... spread more mappings
};
```

### Step 4: Test

```bash
npm run dev
```

Go to Add Product page and test:
1. Select a category
2. Check if correct attributes appear
3. Adjust mappings if needed

---

## Quick Start Template

Use this template for each main category file:

```javascript
/**
 * [CATEGORY NAME] Mappings
 */
export const [categoryName]Mappings = {
  // Parent category
  'parent-slug': ['attr1', 'attr2', 'attr3'],
  
  // Subcategories
  'sub-slug-1': ['attr1', 'attr2', 'attr4'],
  'sub-slug-2': ['attr1', 'attr3', 'attr5'],
  
  // Add more...
};
```

---

## Finding Slugs

### Category Slugs

**Method 1: WordPress Admin**
1. Products → Categories
2. Hover over category name
3. Look at URL or edit to see slug

**Method 2: Browser Console**
```javascript
// On Add Product page, open console (F12)
console.log(state.categories);
// Find your category and note the 'slug' field
```

### Attribute Slugs

**Method 1: WordPress Admin**
1. Products → Attributes
2. Slug is shown in the list

**Method 2: Browser Console**
```javascript
// On Add Product page, open console (F12)
console.log(state.globalAttributes);
// Find your attribute and note the 'slug' field
```

---

## Example: Complete Setup

### 1. Create fashion.js

```javascript
export const fashionMappings = {
  'clothing': ['size', 'color', 'material'],
  'shirts': ['size', 'color', 'material', 'collar-type'],
};
```

### 2. Create electronics.js

```javascript
export const electronicsMappings = {
  'phones': ['brand', 'storage', 'color'],
  'laptops': ['brand', 'processor', 'ram'],
};
```

### 3. Update categoryAttributeMap.js

```javascript
import { fashionMappings } from './attributeMappings/fashion';
import { electronicsMappings } from './attributeMappings/electronics';

export const categoryAttributeMap = {
  ...fashionMappings,
  ...electronicsMappings,
};
```

### 4. Test

- Select "Shirts" → See size, color, material, collar-type
- Select "Phones" → See brand, storage, color

---

## Benefits of This Structure

✅ **Organized** - Each main category in its own file
✅ **Manageable** - Small files, easy to edit
✅ **Scalable** - Add new categories without cluttering
✅ **Collaborative** - Multiple people can work on different files
✅ **Maintainable** - Easy to find and update specific mappings

---

## Next Steps

1. **List your main categories** (Fashion, Electronics, etc.)
2. **Create a file for each** in `src/config/attributeMappings/`
3. **Add your mappings** using the template
4. **Import in main file** (`categoryAttributeMap.js`)
5. **Test** in development
6. **Deploy** when ready

---

## Need Help?

Share your main categories and I'll help you create the files! 🚀

**Example format:**
- Fashion & Clothing
- Electronics & Gadgets
- Home & Garden
- Sports & Outdoors
- Beauty & Health
- Automotive
- Baby & Kids
- Pets
- Office & Stationery
- Food & Beverages
