# Manual JSON File Update Guide

This guide explains how to manually update the JSON data files for categories, attributes, brands, and locations.

## 📁 File Locations

All JSON files are located in: `public/data/`

- `categories.json` - Product categories
- `attributes.json` - Product attributes
- `brands.json` - Product brands
- `locations.json` - Product locations

## 🔧 How to Update

### Method 1: Direct File Editing

1. **Open the file** in your code editor:
   ```bash
   # Example: Edit attributes.json
   code public/data/attributes.json
   ```

2. **Edit the JSON** following the existing structure
3. **Validate** your changes using the helper script:
   ```bash
   node scripts/update-json-files.js attributes validate
   ```

4. **Format** the file (optional, for better readability):
   ```bash
   node scripts/update-json-files.js attributes format
   ```

### Method 2: Using the Helper Script

The helper script provides several utilities:

```bash
# Show file information
node scripts/update-json-files.js attributes info

# Validate JSON syntax
node scripts/update-json-files.js attributes validate

# Format JSON (with auto-backup)
node scripts/update-json-files.js attributes format

# Create a backup
node scripts/update-json-files.js attributes backup
```

## 📋 File Structures

### Categories (`categories.json`)

```json
[
  {
    "id": 15,
    "name": "Uncategorized",
    "slug": "uncategorized",
    "parent": 0
  },
  {
    "id": 210,
    "name": "Air Conditioners",
    "slug": "air-conditioners",
    "parent": 209
  }
]
```

**Required fields:**
- `id` (number) - Category ID
- `name` (string) - Category name
- `slug` (string) - URL-friendly slug
- `parent` (number) - Parent category ID (0 for root categories)

### Attributes (`attributes.json`)

```json
[
  {
    "id": 117,
    "name": "Age Range",
    "slug": "age-range",
    "type": "select",
    "order_by": "menu_order",
    "has_archives": true
  }
]
```

**Required fields:**
- `id` (number) - Attribute ID
- `name` (string) - Attribute name
- `slug` (string) - URL-friendly slug
- `type` (string) - Attribute type (select, image, etc.)
- `order_by` (string) - How to order terms
- `has_archives` (boolean) - Whether attribute has archive pages

### Brands (`brands.json`)

Same structure as categories:
```json
[
  {
    "id": 1,
    "name": "Brand Name",
    "slug": "brand-name",
    "parent": 0
  }
]
```

### Locations (`locations.json`)

Same structure as categories:
```json
[
  {
    "id": 1,
    "name": "Location Name",
    "slug": "location-name",
    "parent": 0
  }
]
```

## ⚠️ Important Notes

1. **Always backup** before editing:
   ```bash
   node scripts/update-json-files.js attributes backup
   ```

2. **Validate** after editing:
   ```bash
   node scripts/update-json-files.js attributes validate
   ```

3. **Keep IDs consistent** - Don't change IDs unless you know what you're doing

4. **Maintain parent relationships** - Ensure parent IDs reference valid category/brand IDs

5. **Use valid JSON** - Make sure all strings are quoted, commas are correct, etc.

6. **Test after changes** - Refresh your app and verify the data loads correctly

## 🔄 Alternative: Download from Server

If you have access to the WordPress server, you can download fresh JSON files:

```bash
node download-json-files.js
```

This downloads the latest JSON files from `shopwice.com` and saves them to `public/data/`.

## 🐛 Troubleshooting

### "Invalid JSON" error
- Check for missing commas
- Ensure all strings are in double quotes
- Verify brackets and braces are balanced
- Use a JSON validator online or the helper script

### Data not showing in app
- Clear browser cache
- Check browser console for errors
- Verify file is saved in `public/data/`
- Restart the development server

### File too large
- Consider splitting into multiple files
- Remove unused entries
- Compress the JSON (remove formatting)

## 📝 Example: Adding a New Category

1. Open `public/data/categories.json`
2. Add a new object:
   ```json
   {
     "id": 99999,
     "name": "New Category",
     "slug": "new-category",
     "parent": 0
   }
   ```
3. Validate: `node scripts/update-json-files.js categories validate`
4. Test in the app

## 📝 Example: Adding a New Attribute

1. Open `public/data/attributes.json`
2. Add a new object:
   ```json
   {
     "id": 99999,
     "name": "New Attribute",
     "slug": "new-attribute",
     "type": "select",
     "order_by": "menu_order",
     "has_archives": true
   }
   ```
3. Validate: `node scripts/update-json-files.js attributes validate`
4. Update category mappings in `src/config/categoryAttributeMap.js` if needed
5. Test in the app





