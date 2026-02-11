# Troubleshooting Bulk Create Attributes Script

## Common Issues and Solutions

### 1. "This site can't be reached" or ERR_FAILED

**Possible Causes:**
- File not in WordPress root directory
- PHP syntax errors
- Server blocking direct PHP file access
- File permissions issue

**Solutions:**

#### Check File Location
The file must be in your WordPress root directory (same folder as `wp-config.php`):
```
/var/www/html/                    (or your server path)
├── wp-config.php
├── wp-load.php
├── bulk-create-attributes.php    ← Should be here
├── wp-content/
└── wp-admin/
```

#### Check File Permissions
```bash
chmod 644 bulk-create-attributes.php
```

#### Check PHP Errors
Enable error display temporarily in `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', true);
```

#### Alternative: Run via Command Line
```bash
cd /path/to/wordpress
php bulk-create-attributes.php
```

#### Alternative: Run via WP-CLI
```bash
wp eval-file bulk-create-attributes.php
```

### 2. "Unauthorized access" Error

**Solution:** Make sure you're logged in as an administrator when accessing via browser.

### 3. PHP Fatal Errors

**Common Issues:**
- Missing WooCommerce plugin
- WordPress not fully loaded
- PHP version too old (needs PHP 7.4+)

**Check:**
```bash
php -v  # Should be 7.4 or higher
```

### 4. File Not Found

**Solution:** Verify the file exists:
```bash
ls -la bulk-create-attributes.php
```

### 5. Server Configuration Blocking

Some servers block direct PHP file execution. Try:
- Using command line instead
- Creating a plugin version
- Using WP-CLI

## Recommended: Use Command Line

The most reliable method is via command line (SSH):

```bash
# Navigate to WordPress root
cd /path/to/wordpress

# Run the script
php bulk-create-attributes.php
```

## Alternative: Create as Plugin

If browser access doesn't work, we can convert this to a WordPress plugin that you can activate and run from the admin panel.





