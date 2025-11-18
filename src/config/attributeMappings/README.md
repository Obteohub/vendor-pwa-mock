# Category-Attribute Mappings

This folder contains organized category-attribute mappings, split by main category for easier management.

## Structure

Each file exports a mappings object for a specific main category:

```javascript
// Example: fashion.js
export const fashionMappings = {
  'clothing': ['size', 'color', 'material'],
  'shirts': ['size', 'color', 'material', 'collar-type'],
  'pants': ['size', 'color', 'material', 'fit'],
  // ... more subcategories
};
```

## How to Add a New Main Category

1. **Create a new file** (e.g., `electronics.js`)
2. **Export your mappings:**
   ```javascript
   export const electronicsMappings = {
     'phones': ['brand', 'storage', 'color'],
     'laptops': ['brand', 'processor', 'ram'],
   };
   ```
3. **Import in `categoryAttributeMap.js`:**
   ```javascript
   import { electronicsMappings } from './attributeMappings/electronics';
   
   export const categoryAttributeMap = {
     ...electronicsMappings,
   };
   ```

## File Naming Convention

- Use lowercase
- Use descriptive names
- Examples: `fashion.js`, `electronics.js`, `homeGarden.js`

## Tips

- Keep related categories together in one file
- Use comments to organize subcategories
- Test your mappings after adding them
