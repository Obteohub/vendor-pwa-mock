# Bulk Create WooCommerce Attributes

This guide explains how to create multiple WooCommerce product attributes at once using PHP scripts.

## 📁 Available Scripts

### 1. `bulk-create-attributes.php`
Creates attributes from a hardcoded array in the script.

### 2. `bulk-create-attributes-from-json.php`
Creates attributes by reading from a JSON file (like your `attributes.json`).

## 🚀 Usage

### Method 1: Create from Hardcoded Array

1. **Edit the script** to add your attributes:
   ```php
   $attributes_to_create = array(
       'Brand',
       'Size',
       'Color',
       // ... more attributes
   );
   ```

2. **Run the script**:
   ```bash
   # Via command line
   php bulk-create-attributes.php
   
   # Via browser (must be logged in as admin)
   https://yoursite.com/bulk-create-attributes.php
   
   # Via WP-CLI
   wp eval-file bulk-create-attributes.php
   ```

### Method 2: Create from JSON File

1. **Use your existing JSON file**:
   ```bash
   php bulk-create-attributes-from-json.php public/data/attributes.json
   ```

2. **Or specify a different file**:
   ```bash
   php bulk-create-attributes-from-json.php path/to/your/attributes.json
   ```

3. **Via browser**:
   ```
   https://yoursite.com/bulk-create-attributes-from-json.php?file=public/data/attributes.json
   ```

## 📋 Attribute Formats

### Simple Format (String)
```php
'Brand',
'Size',
'Color'
```

### Array Format (Full Control)
```php
array(
    'name' => 'Warranty Period',
    'slug' => 'warranty-period',
    'type' => 'select',
    'has_archives' => true
)
```

### JSON Format
```json
[
  {
    "id": 21,
    "name": "Air Conditioner Capacity",
    "slug": "air-conditioner-capacity",
    "type": "select",
    "has_archives": true
  }
]
```

## ⚙️ Attribute Types

- `select` - Dropdown select (default)
- `text` - Text input
- `textarea` - Textarea input

## 🔒 Security

- Scripts check for admin access when run via browser
- Safe to run via command line or WP-CLI
- Existing attributes are skipped (won't create duplicates)

## 📊 Output

The scripts provide detailed output:
- ✅ Successfully created attributes
- ⏭️ Skipped (already exists)
- ❌ Failed (with error messages)
- 📈 Summary statistics

## 💡 Tips

1. **Backup first**: Always backup your database before bulk operations
2. **Test on staging**: Test the script on a staging site first
3. **Check existing**: The script skips attributes that already exist
4. **Add terms later**: After creating attributes, add terms via WooCommerce admin

## 🔄 Syncing with Your PWA

To keep your WooCommerce attributes in sync with your PWA JSON:

1. **Export from WooCommerce** (if needed):
   ```php
   // Use generate-static-data.php to create JSON
   ```

2. **Import to WooCommerce**:
   ```bash
   php bulk-create-attributes-from-json.php public/data/attributes.json
   ```

3. **Update mappings**: Update your category-attribute mappings in the PWA

## 🐛 Troubleshooting

### "Unauthorized access" error
- Make sure you're logged in as admin (browser)
- Or run via command line/WP-CLI

### "Attribute already exists"
- This is normal - the script skips existing attributes
- Check the "Skipped" section in output

### "Invalid JSON" error
- Verify your JSON file is valid
- Use a JSON validator online
- Check file encoding (should be UTF-8)

### Attributes not showing
- Clear WooCommerce cache
- Regenerate permalinks: Settings > Permalinks > Save
- Check WooCommerce > Products > Attributes

## 📝 Example: Complete Workflow

```bash
# 1. Download latest attributes from server
npm run update-attributes

# 2. Create attributes in WooCommerce
php bulk-create-attributes-from-json.php public/data/attributes.json

# 3. Add terms to attributes (via WooCommerce admin or another script)
# WooCommerce > Products > Attributes > [Attribute Name] > Configure terms

# 4. Update category mappings in PWA
# Edit src/config/categoryAttributeMap.js
```





