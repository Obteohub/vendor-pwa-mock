# ✅ Category-Attribute Mappings - Complete Setup

## All Files Created

I've created organized mapping files for all your main categories:

```
src/config/
├── categoryAttributeMap.js                    # Main file (imports all)
└── attributeMappings/
    ├── fashion.js                             # Men, Women, Kids, Bags, Accessories
    ├── electronics.js                         # Phones, Laptops, Audio, Gaming
    ├── homeAppliances.js                      # Kitchen, Laundry, Cleaning, Climate
    ├── homeGarden.js                          # Furniture, Decor, Bedding, Kitchen
    ├── healthBeauty.js                        # Skincare, Makeup, Haircare, Fragrance
    ├── sportsFitness.js                       # Fitness, Sports Gear, Outdoor, Cycling
    ├── booksMedia.js                          # Books, Music, Movies, Games
    ├── petSupplies.js                         # Pet Food, Toys, Accessories, Grooming
    ├── gardenOutdoor.js                       # Garden Tools, Plants, Outdoor Furniture
    ├── healthWellness.js                      # Vitamins, Supplements, Medical Supplies
    ├── stationeryOffice.js                    # Writing, Paper, Office Supplies, Furniture
    ├── toysBaby.js                            # Toys, Baby Products, Baby Gear, Nursery
    ├── groceryFood.js                         # Beverages, Snacks, Pantry, Frozen, Dairy
    └── automotive.js                          # Car Parts, Accessories, Electronics, Care
```

---

## What's Included

Each file contains:
- ✅ Main category mappings
- ✅ Subcategory mappings
- ✅ Common attributes for each category
- ✅ Ready-to-use templates
- ✅ Comments for easy customization

---

## How to Customize

### Step 1: Find Your Category Slug

**Method 1: WordPress Admin**
1. Products → Categories
2. Hover over category → See slug in URL
3. Or edit category → See slug field

**Method 2: Browser Console**
```javascript
// On Add Product page, press F12
console.log(state.categories);
// Find your category, note the 'slug' field
```

### Step 2: Find Your Attribute Slugs

**Method 1: WordPress Admin**
1. Products → Attributes
2. Slug is shown in the list

**Method 2: Browser Console**
```javascript
// On Add Product page, press F12
console.log(state.globalAttributes);
// Find your attributes, note the 'slug' fields
```

### Step 3: Edit the Mapping File

Open the relevant file (e.g., `src/config/attributeMappings/fashion.js`):

```javascript
export const fashionMappings = {
  // Add or modify your mappings
  'your-category-slug': ['attribute1', 'attribute2', 'attribute3'],
};
```

### Step 4: Test

```bash
npm run dev
```

Go to Add Product → Select category → Check attributes

---

## Example Customization

### Add a New Category

**File:** `src/config/attributeMappings/fashion.js`

```javascript
export const fashionMappings = {
  // ... existing mappings ...
  
  // Add your new category
  'winter-jackets': ['size', 'color', 'material', 'insulation', 'waterproof', 'hood'],
};
```

### Modify Existing Category

```javascript
export const fashionMappings = {
  // Before
  'shirts': ['size', 'color', 'material'],
  
  // After - add more attributes
  'shirts': ['size', 'color', 'material', 'collar-type', 'sleeve-length', 'fit', 'pattern'],
};
```

---

## Testing Checklist

- [ ] Start dev server: `npm run dev`
- [ ] Go to Add Product page
- [ ] Select a category
- [ ] Check if correct attributes appear
- [ ] Try multiple categories
- [ ] Test with variable products
- [ ] Generate variations
- [ ] Submit a test product

---

## Common Attributes by Category

### Fashion
- size, color, material, brand, gender, fit, style

### Electronics
- brand, color, storage, ram, processor, screen-size, warranty

### Home & Garden
- color, material, size, style, capacity, power

### Health & Beauty
- brand, size, skin-type, scent, ingredients, spf

### Sports & Fitness
- size, color, material, sport-type, weight, resistance-level

### Toys & Baby
- age-group, color, material, safety-certified, size

### Grocery & Food
- size, flavor, dietary, organic, brand, type

### Automotive
- brand, compatibility, material, color, type

---

## Tips for Success

### 1. Start with Parent Categories
Define attributes for main categories first, then add specific ones for subcategories.

### 2. Use Common Attributes
Many categories share attributes like size, color, material. Include these consistently.

### 3. Be Specific
Use clear, descriptive attribute slugs that match your WordPress attributes exactly.

### 4. Test Thoroughly
Test each category after adding mappings to ensure correct attributes appear.

### 5. Document Custom Attributes
Add comments in your mapping files to explain custom attributes.

---

## Deployment

### Development
```bash
npm run dev
```

### Preview
```bash
vercel
```

### Production
```bash
vercel --prod
```

---

## Maintenance

### Adding New Categories
1. Find the appropriate mapping file
2. Add your category slug and attributes
3. Test in development
4. Deploy when ready

### Updating Attributes
1. Edit the mapping file
2. Update the attribute array
3. Test the changes
4. Deploy

### Removing Categories
1. Delete or comment out the mapping
2. Test to ensure no errors
3. Deploy

---

## File Structure Benefits

✅ **Organized** - Each main category in its own file
✅ **Manageable** - Small files, easy to find and edit
✅ **Scalable** - Add new categories without cluttering
✅ **Collaborative** - Multiple people can work on different files
✅ **Maintainable** - Easy to update specific categories

---

## Next Steps

1. **Review the mapping files** - Check if they match your categories
2. **Customize as needed** - Add/modify/remove mappings
3. **Test in development** - Make sure everything works
4. **Deploy to preview** - Test on preview URL
5. **Deploy to production** - When ready

---

## Need Help?

### Finding Slugs
- Check WordPress admin
- Use browser console
- Look at existing products

### Testing
- Use development mode
- Test each category
- Check console for errors

### Deployment
- Test in preview first
- Deploy to production when confident
- Monitor for issues

---

## Summary

✅ **14 mapping files created** - All your main categories covered
✅ **Hundreds of pre-configured mappings** - Ready to use
✅ **Easy to customize** - Simple JavaScript objects
✅ **Well organized** - Each category in its own file
✅ **Production ready** - Test and deploy when ready

**Your category-attribute filtering system is complete!** 🎉

Just customize the mappings to match your exact category and attribute slugs, test, and deploy! 🚀
