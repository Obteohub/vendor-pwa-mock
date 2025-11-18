# 🎯 Category-Specific Attributes - Complete Guide

## What Was Implemented

✅ **Category-based attribute filtering** - When users select a category, only relevant attributes are shown
✅ **Customizable mapping** - Easy configuration file to define category-attribute relationships
✅ **Smart fallback** - Shows all attributes if no mapping exists for selected category
✅ **Multi-category support** - When multiple categories selected, shows union of all their attributes
✅ **Visual feedback** - Shows "Filtered by category" badge and attribute count

---

## How It Works

### 1. User Flow

1. User goes to **Add Product** page
2. User selects a **Category** (e.g., "Shirts")
3. **Attributes dropdown automatically filters** to show only relevant attributes (e.g., Size, Color, Material, Collar Type, Sleeve Length)
4. User sees a **green badge** saying "Filtered by category"
5. User sees **attribute count** (e.g., "5 attributes available for selected category")

### 2. Technical Flow

```
User selects category
    ↓
useCategoryAttributes hook activates
    ↓
Looks up category slug in categoryAttributeMap
    ↓
Filters globalAttributes to match mapped slugs
    ↓
Returns filtered attributes to AttributeSelector
    ↓
User sees only relevant attributes
```

---

## Configuration

### File Location

`src/config/categoryAttributeMap.js`

### How to Customize

**Example: Add attributes for "T-Shirts" category**

```javascript
export const categoryAttributeMap = {
  // ... existing mappings ...
  
  't-shirts': ['size', 'color', 'material', 'neck-type', 'sleeve-length'],
  
  // ... more mappings ...
};
```

### Finding Category Slugs

**Method 1: WordPress Admin**
1. Go to **Products** → **Categories**
2. Hover over a category
3. Look at the URL: `...?tag_ID=123&taxonomy=product_cat&post_type=product`
4. Or edit the category and check the slug field

**Method 2: Browser Console**
1. Open product add page
2. Open browser console (F12)
3. Type: `console.log(state.categories)`
4. Find your category and note the `slug` field

### Finding Attribute Slugs

**Method 1: WordPress Admin**
1. Go to **Products** → **Attributes**
2. The slug is shown in the list

**Method 2: Browser Console**
1. Open product add page
2. Open browser console (F12)
3. Type: `console.log(state.globalAttributes)`
4. Find your attribute and note the `slug` field

---

## Examples

### Example 1: Clothing Store

```javascript
'mens-shirts': ['size', 'color', 'material', 'collar-type', 'sleeve-length', 'fit'],
'womens-dresses': ['size', 'color', 'material', 'length', 'style', 'occasion'],
'shoes': ['size', 'color', 'material', 'shoe-width', 'style'],
```

**Result:** When user selects "Men's Shirts", they only see Size, Color, Material, Collar Type, Sleeve Length, and Fit attributes.

### Example 2: Electronics Store

```javascript
'smartphones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network', 'camera'],
'laptops': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os', 'graphics'],
'headphones': ['brand', 'color', 'connection-type', 'noise-cancellation', 'driver-size'],
```

**Result:** When user selects "Smartphones", they only see Brand, Color, Storage, RAM, Screen Size, Network, and Camera attributes.

### Example 3: Multi-Category Selection

User selects both "Shirts" and "Pants":

```javascript
'shirts': ['size', 'color', 'material', 'collar-type', 'sleeve-length'],
'pants': ['size', 'color', 'material', 'fit', 'length', 'waist-size'],
```

**Result:** User sees: Size, Color, Material, Collar Type, Sleeve Length, Fit, Length, Waist Size (union of both)

---

## Testing

### Test in Development

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Add Product page:**
   ```
   http://localhost:3000/dashboard/products/add
   ```

3. **Test the flow:**
   - Don't select category → See all attributes
   - Select "Clothing" → See only clothing attributes
   - Select "Electronics" → See only electronics attributes
   - Select multiple categories → See combined attributes

### Test in Production

1. **Deploy to preview:**
   ```bash
   vercel
   ```

2. **Test on preview URL**

3. **Deploy to production when ready:**
   ```bash
   vercel --prod
   ```

---

## Customization Tips

### Tip 1: Start with Parent Categories

Define attributes for parent categories first:

```javascript
'clothing': ['size', 'color', 'material', 'brand'],
```

Then add more specific attributes for subcategories:

```javascript
'shirts': ['size', 'color', 'material', 'brand', 'collar-type', 'sleeve-length'],
```

### Tip 2: Share Common Attributes

Many categories share common attributes (size, color, material). Include these in all relevant categories.

### Tip 3: Use Descriptive Slugs

Make sure your attribute slugs are clear:
- ✅ `screen-size` (clear)
- ❌ `ss` (unclear)

### Tip 4: Test with Real Products

Add a few test products to make sure the right attributes appear for each category.

---

## Advanced: Parent Category Inheritance

The hook automatically checks parent categories too!

**Example:**
```javascript
'clothing': ['size', 'color', 'material'],
'mens-clothing': ['fit', 'style'], // Child of 'clothing'
```

When user selects "Men's Clothing", they see:
- Size, Color, Material (from parent "Clothing")
- Fit, Style (from "Men's Clothing")

---

## Troubleshooting

### Problem: Attributes not filtering

**Solution:**
1. Check category slug matches exactly in `categoryAttributeMap.js`
2. Check attribute slugs match exactly
3. Open browser console and check for errors
4. Verify categories are loaded: `console.log(state.categories)`

### Problem: Wrong attributes showing

**Solution:**
1. Double-check the mapping in `categoryAttributeMap.js`
2. Make sure attribute slugs are correct
3. Clear browser cache and reload

### Problem: No attributes showing

**Solution:**
1. Check if `allAttributes` is loaded
2. Verify the category has a mapping
3. If no mapping exists, all attributes should show (fallback behavior)

---

## Files Modified

### New Files Created:
1. `src/hooks/useCategoryAttributes.js` - Hook for filtering logic
2. `src/config/categoryAttributeMap.js` - Configuration file
3. `src/app/api/vendor/categories/[id]/attributes/route.js` - API endpoint (optional)

### Modified Files:
1. `src/app/dashboard/products/add/page.jsx` - Added hook and UI updates

---

## Benefits

✅ **Better UX** - Users see only relevant attributes
✅ **Faster** - Less scrolling through irrelevant options
✅ **Fewer errors** - Users can't select wrong attributes
✅ **Scalable** - Easy to add new categories and attributes
✅ **Flexible** - Falls back to all attributes if no mapping exists

---

## Next Steps

### Immediate:
1. ✅ Test in development
2. ✅ Customize `categoryAttributeMap.js` for your store
3. ✅ Deploy to preview
4. ✅ Test thoroughly
5. ✅ Deploy to production

### Future Enhancements:
- Add WordPress admin UI to manage mappings
- Store mappings in database instead of config file
- Add attribute suggestions based on category
- Show attribute descriptions/help text
- Add attribute validation rules per category

---

## Summary

You now have a smart attribute filtering system that:
- Shows only relevant attributes based on selected category
- Is easy to customize via config file
- Provides visual feedback to users
- Falls back gracefully when no mapping exists
- Supports multiple category selection

**Ready to customize?** Edit `src/config/categoryAttributeMap.js` and add your category-attribute mappings! 🚀
