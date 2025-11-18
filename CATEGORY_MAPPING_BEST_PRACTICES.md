# Category-Attribute Mapping: Best Practices

## Overview
There are multiple ways to map categories to attributes. Choose based on your needs.

---

## Approach 1: Manual Mapping (Current)
**Best for:** Small stores, specific requirements

### Pros:
- Full control over which attributes show
- Easy to understand
- No API calls needed

### Cons:
- Manual maintenance required
- Must update for new categories
- Can become large file

### When to use:
- < 100 categories
- Specific attribute requirements
- Want tight control

---

## Approach 2: Hybrid (RECOMMENDED)
**Best for:** Most use cases

### How it works:
1. Define mappings only for important categories
2. All other categories show all attributes
3. WooCommerce filters on backend

### Implementation:
```javascript
// Only map categories that NEED specific attributes
export const categoryAttributeMap = {
  // High-priority categories with specific needs
  'mobile-phones': ['ram', 'storage', 'screen-size', 'camera'],
  'laptops': ['processor', 'ram', 'storage', 'screen-size'],
  
  // Everything else shows all attributes
};
```

### Pros:
- Less maintenance
- Flexible
- Scales well

### Cons:
- Some categories may show too many attributes

---

## Approach 3: Hierarchical Inheritance
**Best for:** Large stores with category hierarchies

### How it works:
```javascript
// Parent categories define base attributes
'electronics': ['brand', 'warranty', 'power'],

// Children inherit + add specific ones
'mobile-phones': ['ram', 'storage'], // Gets electronics attrs too
```

### Implementation:
```javascript
export function getCategoryAttributes(categorySlug, categories) {
  const attributes = new Set();
  
  // Get current category attributes
  if (categoryAttributeMap[categorySlug]) {
    categoryAttributeMap[categorySlug].forEach(attr => attributes.add(attr));
  }
  
  // Get parent category attributes
  const category = categories.find(c => c.slug === categorySlug);
  if (category?.parent) {
    const parent = categories.find(c => c.id === category.parent);
    if (parent && categoryAttributeMap[parent.slug]) {
      categoryAttributeMap[parent.slug].forEach(attr => attributes.add(attr));
    }
  }
  
  return Array.from(attributes);
}
```

---

## Approach 4: Attribute Groups (Reusable)
**Best for:** Categories with similar attributes

### Implementation:
```javascript
// Define reusable groups
const GROUPS = {
  ELECTRONICS: ['brand', 'warranty', 'power', 'color'],
  FASHION: ['size', 'color', 'material', 'brand', 'gender'],
  APPLIANCES: ['brand', 'warranty', 'power', 'capacity', 'energy-rating'],
  FOOD: ['brand', 'weight', 'expiry-date', 'ingredients'],
};

// Use groups in mappings
export const categoryAttributeMap = {
  'mobile-phones': [...GROUPS.ELECTRONICS, 'ram', 'storage', 'camera'],
  'laptops': [...GROUPS.ELECTRONICS, 'processor', 'ram', 'storage'],
  'shirts': [...GROUPS.FASHION, 'collar-type', 'sleeve-length'],
  'refrigerators': [...GROUPS.APPLIANCES, 'capacity', 'frost-free'],
};
```

### Pros:
- DRY (Don't Repeat Yourself)
- Easy to update groups
- Consistent across categories

---

## Approach 5: API-Driven (Future-Proof)
**Best for:** Large stores, dynamic requirements

### How it works:
1. Store mappings in WooCommerce database
2. Fetch via API
3. Cache locally

### Implementation:
```javascript
// Fetch from custom endpoint
const mappings = await fetch('/api/vendor/category-attribute-mappings');

// Or use WooCommerce meta
const category = await fetch(`/api/vendor/categories/${id}`);
const attributes = category.meta_data.find(m => m.key === 'attributes')?.value;
```

### Pros:
- No code changes needed
- Manageable via admin panel
- Scales infinitely

### Cons:
- Requires custom WooCommerce plugin
- More complex setup

---

## RECOMMENDATION

### For Your Use Case:
Use **Approach 2 (Hybrid)** + **Approach 4 (Groups)**

```javascript
// src/config/categoryAttributeMap.js

// Define reusable groups
const GROUPS = {
  ELECTRONICS: ['brand', 'warranty', 'color'],
  FASHION: ['size', 'color', 'material', 'brand'],
  APPLIANCES: ['brand', 'warranty', 'power', 'energy-rating'],
};

// Map only important categories
export const categoryAttributeMap = {
  // Electronics
  'mobile-phones': [...GROUPS.ELECTRONICS, 'ram', 'storage', 'screen-size', 'camera'],
  'laptops': [...GROUPS.ELECTRONICS, 'processor', 'ram', 'storage', 'screen-size'],
  'tablets': [...GROUPS.ELECTRONICS, 'ram', 'storage', 'screen-size'],
  
  // Fashion
  'mens-shirts': [...GROUPS.FASHION, 'collar-type', 'sleeve-length', 'fit'],
  'womens-dresses': [...GROUPS.FASHION, 'length', 'neckline', 'occasion'],
  
  // Appliances
  'refrigerators': [...GROUPS.APPLIANCES, 'capacity', 'frost-free', 'doors'],
  'washing-machines': [...GROUPS.APPLIANCES, 'capacity', 'load-type', 'spin-speed'],
  
  // Leave unmapped categories to show all attributes
};
```

### Why This Works:
1. **Low maintenance** - Only map important categories
2. **Reusable** - Groups reduce duplication
3. **Flexible** - Unmapped categories show all attributes
4. **Scalable** - Easy to add new categories
5. **Clear** - Easy to understand and modify

---

## Quick Start

1. **Identify your top 20-30 most important categories**
2. **Group similar categories** (electronics, fashion, etc.)
3. **Define attribute groups** for each category type
4. **Map only those categories** that need specific attributes
5. **Let everything else show all attributes**

This gives you 80% of the benefit with 20% of the effort!
