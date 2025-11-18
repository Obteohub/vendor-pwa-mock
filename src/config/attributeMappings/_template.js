/**
 * Template for Category-Attribute Mappings
 * 
 * Copy this file and rename it to your main category name (e.g., fashion.js, electronics.js)
 * Then fill in your category-attribute mappings below.
 */

/**
 * [MAIN CATEGORY NAME] Mappings
 * 
 * Format:
 * 'category-slug': ['attribute-slug-1', 'attribute-slug-2', 'attribute-slug-3'],
 */
export const yourCategoryMappings = {
  // Parent category
  'parent-category-slug': ['attribute1', 'attribute2', 'attribute3'],
  
  // Subcategories
  'subcategory-1-slug': ['attribute1', 'attribute2', 'attribute4'],
  'subcategory-2-slug': ['attribute1', 'attribute3', 'attribute5'],
  
  // Add more mappings below
  // 'category-slug': ['attribute1', 'attribute2'],
};

/**
 * HOW TO USE:
 * 
 * 1. Rename this file to match your main category (e.g., fashion.js)
 * 2. Rename the export (e.g., fashionMappings)
 * 3. Add your category-slug and attribute-slug mappings
 * 4. Import in ../categoryAttributeMap.js:
 *    import { fashionMappings } from './attributeMappings/fashion';
 * 5. Add to categoryAttributeMap:
 *    export const categoryAttributeMap = {
 *      ...fashionMappings,
 *    };
 */
