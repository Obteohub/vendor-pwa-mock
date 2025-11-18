# Next Improvements Plan

## Current Issues

1. **Categories not loading all** - Pagination/hierarchy issue
2. **No search functionality** - Hard to find categories
3. **No lazy loading** - All categories load at once
4. **Attributes allow custom input** - Should only show WooCommerce values

## Required Improvements

### 1. Categories Component Overhaul

**Requirements:**
- ✅ Server-side pagination
- ✅ Client-side lazy loading
- ✅ Virtualization for performance
- ✅ Nested expandable tree structure
- ✅ Lazy load sub-categories on expand
- ✅ Search bar with filtering
- ✅ Auto-select parent categories when child is selected
- ✅ Show hierarchy visually (indentation/icons)

**Implementation Plan:**

#### A. New Category Tree Component
```jsx
<CategoryTreeSelector
  onSelectionChange={(selectedIds) => {}}
  searchable={true}
  lazyLoad={true}
  virtualized={true}
/>
```

**Features:**
- Search input at top
- Virtual scrolling (only render visible items)
- Expandable nodes (▶/▼ icons)
- Checkboxes with indeterminate state
- Load children on expand (not all at once)
- Auto-select ancestors when child selected

#### B. API Changes

**New Endpoint:** `/api/vendor/categories/tree`
```javascript
// Returns root categories only
GET /api/vendor/categories/tree?parent=0&search=

// Returns children of specific category
GET /api/vendor/categories/tree?parent=123
```

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "parent": 0,
      "has_children": true,
      "children_count": 15
    }
  ]
}
```

#### C. Component Structure

```
CategoryTreeSelector/
├── CategorySearch.jsx       (Search input)
├── CategoryTree.jsx         (Virtual tree container)
├── CategoryNode.jsx         (Single expandable node)
├── useCategoryTree.js       (Hook for tree logic)
└── categoryTreeUtils.js     (Helper functions)
```

#### D. Key Features

**1. Lazy Loading:**
- Load only root categories initially
- Load children when parent is expanded
- Cache loaded nodes

**2. Search:**
- Filter categories by name
- Show matching categories with their parents
- Highlight search terms

**3. Auto-select Parents:**
```javascript
function selectCategory(categoryId) {
  const selected = new Set(selectedIds);
  selected.add(categoryId);
  
  // Add all ancestors
  let parent = getParent(categoryId);
  while (parent) {
    selected.add(parent.id);
    parent = getParent(parent.id);
  }
  
  return Array.from(selected);
}
```

**4. Virtualization:**
- Use `react-window` or `react-virtual`
- Only render visible rows
- Handle 1000+ categories smoothly

### 2. Attributes Component Overhaul

**Requirements:**
- ✅ Only show existing WooCommerce attributes
- ✅ No custom attribute input
- ✅ Dropdown to select attribute
- ✅ Checkboxes for attribute terms
- ✅ Load terms on-demand

**Implementation Plan:**

#### A. New Attributes Component
```jsx
<AttributeSelector
  attributes={globalAttributes}
  selectedAttributes={formData.attributes}
  onChange={(attrs) => {}}
/>
```

**Features:**
- Dropdown to select attribute (Color, Size, etc.)
- Checkboxes for terms (Red, Blue, Green)
- No text input for custom attributes
- Load terms when attribute is selected

#### B. Component Structure

```jsx
function AttributeSelector({ attributes, selectedAttributes, onChange }) {
  return (
    <div>
      {selectedAttributes.map((attr, index) => (
        <div key={index}>
          {/* Dropdown: Select attribute */}
          <select value={attr.id} onChange={...}>
            <option value="">Select Attribute</option>
            {attributes.map(a => (
              <option value={a.id}>{a.name}</option>
            ))}
          </select>
          
          {/* Checkboxes: Select terms */}
          {attr.id && (
            <TermCheckboxes
              attributeId={attr.id}
              selectedTerms={attr.options}
              onChange={...}
            />
          )}
          
          <button onClick={() => removeAttribute(index)}>Remove</button>
        </div>
      ))}
      
      <button onClick={addAttribute}>Add Attribute</button>
    </div>
  );
}
```

#### C. Term Loading

```javascript
// Load terms when attribute is selected
useEffect(() => {
  if (attributeId) {
    fetch(`/api/vendor/attributes/${attributeId}/terms`)
      .then(res => res.json())
      .then(data => setTerms(data.terms));
  }
}, [attributeId]);
```

### 3. Implementation Steps

**Phase 1: Categories (Priority)**
1. Create new CategoryTreeSelector component
2. Implement lazy loading logic
3. Add search functionality
4. Implement auto-select parents
5. Add virtualization
6. Replace old HierarchicalSelector

**Phase 2: Attributes**
1. Create new AttributeSelector component
2. Remove custom attribute input
3. Implement term loading on-demand
4. Replace old attribute section

**Phase 3: Testing**
1. Test with 1000+ categories
2. Test search performance
3. Test lazy loading
4. Test parent auto-selection
5. Test attribute term loading

### 4. Libraries Needed

```bash
npm install react-window
# or
npm install @tanstack/react-virtual
```

For search:
```bash
npm install fuse.js  # Fuzzy search
```

### 5. Estimated Time

- **Categories Component**: 4-6 hours
- **Attributes Component**: 2-3 hours
- **Testing & Refinement**: 2-3 hours
- **Total**: 8-12 hours

### 6. Benefits

**Performance:**
- Load 10x faster (only load what's visible)
- Handle 1000+ categories smoothly
- Reduce server load

**UX:**
- Easy to find categories (search)
- Clear hierarchy (expandable tree)
- Intuitive selection (auto-select parents)
- No confusion (only WooCommerce attributes)

**Maintainability:**
- Cleaner code
- Reusable components
- Better separation of concerns

## Current Status

- ✅ Basic loading works
- ✅ Server optimized
- ✅ Offline support
- ⏳ Categories need tree component
- ⏳ Attributes need dropdown component

## Next Session Tasks

1. Implement CategoryTreeSelector component
2. Implement AttributeSelector component
3. Test with real data
4. Refine UX

---

**Note:** This is a significant refactor. Take a break and we'll tackle this fresh! 😊
