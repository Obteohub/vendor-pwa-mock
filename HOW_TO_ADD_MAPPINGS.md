# 📝 How to Add Your Category-Attribute Mappings

## Quick Start

All mapping files are ready in `src/config/attributeMappings/`. Just add your mappings!

---

## Step 1: Find Your Category & Attribute Slugs

### Get Category Slugs:
```javascript
// On Add Product page, open browser console (F12)
console.log(state.categories);
// Look for the 'slug' field in each category
```

### Get Attribute Slugs:
```javascript
// On Add Product page, open browser console (F12)
console.log(state.globalAttributes);
// Look for the 'slug' field in each attribute
```

---

## Step 2: Add Mappings to Files

### Example: Fashion Categories

Edit `src/config/attributeMappings/fashion.js`:

```javascript
export const fashionMappings = {
  // Replace these with your actual slugs
  'fashion': ['size', 'color', 'material', 'brand'],
  'mens-clothing': ['size', 'color', 'material', 'fit'],
  'womens-clothing': ['size', 'color', 'material', 'fit'],
  'shirts': ['size', 'color', 'material', 'collar-type', 'sleeve-length'],
  'pants': ['size', 'color', 'material', 'fit', 'length'],
  'shoes': ['size', 'color', 'material', 'style'],
};
```

### Example: Electronics

Edit `src/config/attributeMappings/electronics.js`:

```javascript
export const electronicsMappings = {
  'electronics': ['brand', 'color', 'warranty'],
  'phones': ['brand', 'color', 'storage', 'ram', 'screen-size'],
  'laptops': ['brand', 'processor', 'ram', 'storage', 'screen-size'],
};
```

---

## Step 3: Test

```bash
npm run dev
```

1. Go to Add Product page
2. Select a category you mapped
3. Check if correct attributes appear
4. If not, verify slugs match exactly

---

## Available Files

Edit these files in `src/config/attributeMappings/`:

1. **fashion.js** - Men, Women, Kids, Bags, Accessories
2. **electronics.js** - Phones, Laptops, Audio, Gaming
3. **homeAppliances.js** - Kitchen, Laundry, Cleaning
4. **homeGarden.js** - Furniture, Decor, Bedding
5. **healthBeauty.js** - Skincare, Makeup, Haircare
6. **sportsFitness.js** - Fitness, Sports, Outdoor
7. **booksMedia.js** - Books, Music, Movies
8. **petSupplies.js** - Pet Food, Toys, Accessories
9. **gardenOutdoor.js** - Garden Tools, Plants
10. **healthWellness.js** - Vitamins, Supplements
11. **stationeryOffice.js** - Writing, Paper, Office
12. **toysBaby.js** - Toys, Baby Products
13. **groceryFood.js** - Beverages, Snacks, Pantry
14. **automotive.js** - Car Parts, Accessories

---

## Tips

### 1. Start Small
Add mappings for your most common categories first.

### 2. Use Exact Slugs
Slugs must match EXACTLY (case-sensitive, hyphens, etc.)

### 3. Test Each Category
After adding mappings, test to ensure correct attributes appear.

### 4. Share Common Attributes
Many categories use size, color, material - include these consistently.

---

## Example Workflow

1. **Open browser console** on Add Product page
2. **Copy category slugs** from `state.categories`
3. **Copy attribute slugs** from `state.globalAttributes`
4. **Edit mapping file** with your slugs
5. **Save and test** in browser
6. **Repeat** for other categories

---

## Troubleshooting

### Attributes not filtering?
- Check category slug matches exactly
- Check attribute slugs match exactly
- Clear browser cache and reload

### Wrong attributes showing?
- Verify slugs in mapping file
- Check for typos
- Test with console.log

### Build errors?
- Make sure each file has `export const [name]Mappings = { };`
- Check for missing commas or brackets
- Verify file syntax

---

## Summary

✅ All 14 mapping files are ready
✅ Just add your category-attribute mappings
✅ Test in development
✅ Deploy when ready

**Start with one category and expand from there!** 🚀
