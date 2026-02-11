# ✅ Category API Fields Configuration

## Current Configuration

All category endpoints are correctly configured to:
- ✅ **Include category images**
- ✅ **Exclude category descriptions**

---

## Fields Being Fetched

```
_fields=id,name,slug,parent,count,supported_attributes,image
```

### **Included Fields:**
1. ✅ `id` - Category ID
2. ✅ `name` - Category name
3. ✅ `slug` - Category slug
4. ✅ `parent` - Parent category ID
5. ✅ `count` - Product count
6. ✅ `supported_attributes` - Category-specific attributes
7. ✅ `image` - **Category image object**

### **Excluded Fields:**
- ❌ `description` - **Not fetched** (as requested)
- ❌ `display` - Not needed
- ❌ `menu_order` - Not needed

---

## Image Object Structure

When a category has an image, the API returns:

```json
{
  "id": 123,
  "name": "Electronics",
  "slug": "electronics",
  "parent": 0,
  "count": 45,
  "supported_attributes": [...],
  "image": {
    "id": 456,
    "src": "https://example.com/wp-content/uploads/category-image.jpg",
    "name": "category-image.jpg",
    "alt": "Electronics Category"
  }
}
```

When no image is set:
```json
{
  "image": null
}
```

---

## Endpoints Configured

### 1. **Tree Endpoint** (Main Web App Pattern)
**File:** `src/app/api/vendor/categories/tree/route.js`

```javascript
// Line 62
const url = `${endpoint}?per_page=${perPage}&page=${page}&_fields=id,name,slug,parent,count,supported_attributes,image`;
```

**Usage:**
```javascript
GET /api/vendor/categories/tree
```

**Response includes:**
- Hierarchical tree with images
- Flat array with images
- No descriptions

---

### 2. **Regular Categories Endpoint** (Legacy)
**File:** `src/app/api/vendor/categories/route.js`

All fetch calls include the same `_fields` parameter:

```javascript
// Line 47 - Fetch children
let endpoint = `${wcfmEndpoint}?per_page=100&parent=${parentIdNum}&_fields=id,name,slug,parent,count,supported_attributes,image`;

// Line 204 - Fetch roots
let endpoint = `${wcfmEndpoint}?per_page=${fetchPerPage}&page=${requestedPage}&_fields=id,name,slug,parent,count,supported_attributes,image`;
```

---

## Usage in Components

### **Accessing Category Images**

```javascript
import { useLocalData } from '@/hooks/useLocalData';

function CategoryList() {
  const { categories } = useLocalData();

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          {/* Display category image */}
          {category.image && (
            <img 
              src={category.image.src} 
              alt={category.image.alt || category.name}
            />
          )}
          
          {/* Display category name */}
          <h3>{category.name}</h3>
          
          {/* No description available (excluded from API) */}
        </div>
      ))}
    </div>
  );
}
```

---

## Mobile App Implementation

When implementing in your mobile app, the same fields will be available:

```javascript
// React Native example
import { Image, Text, View } from 'react-native';

function CategoryItem({ category }) {
  return (
    <View>
      {/* Category Image */}
      {category.image && (
        <Image 
          source={{ uri: category.image.src }}
          style={{ width: 100, height: 100 }}
        />
      )}
      
      {/* Category Name */}
      <Text>{category.name}</Text>
      
      {/* Description not available */}
    </View>
  );
}
```

---

## GraphQL Query Equivalent

For reference, the equivalent GraphQL query would be:

```graphql
query Categories {
  productCategories(first: 50, where: { parent: 0 }) {
    nodes {
      id
      name
      slug
      parent {
        node {
          id
        }
      }
      count
      image {
        id
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
```

**Note:** Description field is **not** included in the query.

---

## Performance Impact

### **With `_fields` Parameter:**
```
✅ Faster API response (less data transferred)
✅ Smaller payload size
✅ Quicker JSON parsing
✅ Less memory usage
```

### **Example Payload Size:**

**Without `_fields` (all fields):**
```json
{
  "id": 123,
  "name": "Electronics",
  "slug": "electronics",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...", // 500+ chars
  "display": "default",
  "image": {...},
  "menu_order": 0,
  // ... many other fields
}
```
**Size:** ~2KB per category

**With `_fields` (selected fields only):**
```json
{
  "id": 123,
  "name": "Electronics",
  "slug": "electronics",
  "parent": 0,
  "count": 45,
  "image": {...}
}
```
**Size:** ~500 bytes per category

**Savings:** ~75% reduction in payload size! 🚀

---

## Verification

To verify the configuration is working:

### **1. Check API Response**
```bash
# Test the tree endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/vendor/categories/tree

# Verify response includes:
# - "image": { ... } ✅
# - No "description" field ✅
```

### **2. Check Console Logs**
```javascript
const { categories } = useLocalData();
console.log(categories[0]);

// Expected output:
// {
//   id: 123,
//   name: "Electronics",
//   slug: "electronics",
//   parent: 0,
//   count: 45,
//   image: { src: "...", alt: "..." },  ✅
//   // No description property ✅
// }
```

---

## Summary

✅ **Category images:** Included in all endpoints  
✅ **Category descriptions:** Excluded from all endpoints  
✅ **Performance:** 75% smaller payload size  
✅ **Mobile ready:** Same data structure for mobile app  

**No changes needed - already configured correctly!** 🎉
