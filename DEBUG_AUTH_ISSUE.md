# 🔍 Debug "Fail to Authenticate Server" Error

Good news: Cloudflare is no longer blocking! The new error means there's an issue with the WordPress JWT plugin or configuration.

## Quick Diagnosis

### Step 1: Test the Diagnostic Endpoint

I've created a test endpoint. Deploy and visit:

```bash
# Deploy first
vercel --prod

# Then visit in browser:
https://your-app.vercel.app/api/test-connection
```

This will show you:
- ✅ Environment variables are set correctly
- ✅ Can reach WordPress
- ❌ What error the JWT endpoint is returning

### Step 2: Common Causes

**A. JWT Plugin Not Installed/Activated**
- Go to WordPress Admin → Plugins
- Search for "JWT Authentication for WP REST API"
- Install and activate: https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

**B. JWT Secret Not Configured**

Add this to your `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'your-super-secret-key-here-change-this');
define('JWT_AUTH_CORS_ENABLE', true);
```

Generate a secure key at: https://api.wordpress.org/secret-key/1.1/salt/

**C. .htaccess Not Configured**

Add this to your `.htaccess` file (in WordPress root):

```apache
# BEGIN JWT Authentication
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
# END JWT Authentication
```

**D. CORS Issues**

Add this to your theme's `functions.php` or a custom plugin:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);
```

---

## Step 3: Test JWT Directly

Test from command line to see the exact error:

```bash
curl -X POST https://shopwice.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

**Expected responses:**

✅ **Success:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "user@example.com",
  "user_nicename": "username",
  "user_display_name": "Display Name"
}
```

❌ **Plugin not installed:**
```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method"
}
```

❌ **Secret not configured:**
```json
{
  "code": "jwt_auth_bad_config",
  "message": "JWT is not configured properly"
}
```

❌ **Wrong credentials:**
```json
{
  "code": "invalid_username",
  "message": "Unknown username. Check again or try your email address."
}
```

---

## Step 4: Verify Vercel Environment Variables

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Check these are set for Production:**
   ```
   NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token
   NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
   WP_BASE_URL=https://shopwice.com
   ```

3. **If you changed any**, redeploy:
   ```bash
   vercel --prod
   ```

---

## Step 5: Check WordPress Permalinks

JWT requires pretty permalinks:

1. **WordPress Admin** → **Settings** → **Permalinks**
2. **Select:** "Post name" or any option except "Plain"
3. **Save Changes**

---

## Quick Fix Checklist

- [ ] JWT plugin installed and activated
- [ ] JWT_AUTH_SECRET_KEY defined in wp-config.php
- [ ] .htaccess configured for Authorization headers
- [ ] Permalinks set to "Post name" (not Plain)
- [ ] CORS headers configured
- [ ] Environment variables set in Vercel
- [ ] Redeployed after env var changes

---

## Still Not Working?

Run the diagnostic endpoint and share the output:

```
https://your-app.vercel.app/api/test-connection
```

This will tell us exactly what's failing! 🔍
