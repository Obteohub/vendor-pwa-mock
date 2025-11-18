# 🔧 Fix: SSL/Redirect Issues with WordPress API

## The Problem

Your diagnostic shows:
- ❌ **"fetch failed"** - Can't connect to shopwice.com from Vercel
- ❌ **"<!DOCTYPE" HTML** - Getting HTML instead of JSON

This is likely caused by:
1. **HTTP → HTTPS redirect** blocking API calls
2. **WWW redirect** (www.shopwice.com vs shopwice.com)
3. **Cloudflare Page Rule not applied yet**
4. **SSL certificate issue**

---

## 🚀 Solution 1: Check Cloudflare Page Rule (Most Likely)

### Verify Page Rule is Active

1. **Cloudflare Dashboard** → `shopwice.com` → **Rules** → **Page Rules**
2. **Check your rule:**
   - URL should be: `shopwice.com/wp-json/*` or `*shopwice.com/wp-json/*`
   - Status should be: **Active** (not Draft)
   - Order should be: **First** (drag to top if needed)

3. **If rule exists but not working:**
   - Try changing URL pattern to: `*shopwice.com/wp-json/*` (with asterisk at start)
   - Or try: `https://shopwice.com/wp-json/*`

### Wait for Propagation

Cloudflare changes can take 2-5 minutes. Clear cache:

1. **Cloudflare** → **Caching** → **Configuration**
2. **Purge Everything**
3. Wait 2 minutes

---

## 🚀 Solution 2: Use Configuration Rules Instead

If Page Rules aren't working, try Configuration Rules (newer method):

1. **Cloudflare** → **Rules** → **Configuration Rules**
2. **Create Rule:**
   - **Name:** `Bypass Security for API`
   - **When incoming requests match:**
     ```
     (http.request.uri.path contains "/wp-json/")
     ```
   - **Then the settings are:**
     - Security Level: `Essentially Off`
     - Browser Integrity Check: `Off`
   - **Deploy**

---

## 🚀 Solution 3: Disable SSL Verification (Temporary Test)

Let's test if it's an SSL issue. Update the login route temporarily:

```javascript
// In src/app/api/auth/login/route.js
// Add this at the top
import https from 'https';

// Then in the fetch call, add:
const authRes = await fetch(JWT_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    // Temporarily disable SSL verification for testing
    agent: new https.Agent({
        rejectUnauthorized: false
    })
});
```

**⚠️ Only for testing! Remove this after diagnosis.**

---

## 🚀 Solution 4: Check WordPress Redirects

Your WordPress might be forcing redirects. Check these:

### A. Check .htaccess

Look for redirect rules in your WordPress `.htaccess`:

```apache
# Bad - This might break API
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Good - Exclude API from redirects
RewriteCond %{HTTPS} off
RewriteCond %{REQUEST_URI} !^/wp-json/
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### B. Check WordPress Settings

1. **WordPress Admin** → **Settings** → **General**
2. **Verify both URLs use HTTPS:**
   - WordPress Address (URL): `https://shopwice.com`
   - Site Address (URL): `https://shopwice.com`
3. **No trailing slashes!**

### C. Check for WWW Redirect

If your site redirects to www.shopwice.com, update env vars:

```
NEXT_PUBLIC_JWT_AUTH_URL=https://www.shopwice.com/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_WC_API_BASE_URL=https://www.shopwice.com/wp-json/dokan/v1
WP_BASE_URL=https://www.shopwice.com
```

---

## 🚀 Solution 5: API Subdomain (Best Long-term Fix)

This bypasses all Cloudflare/redirect issues:

### Step 1: Create Subdomain

1. **Cloudflare** → **DNS** → **Records**
2. **Add Record:**
   - Type: `CNAME`
   - Name: `api`
   - Target: `shopwice.com`
   - Proxy status: **DNS only** (gray cloud ☁️)
   - Save

### Step 2: Configure WordPress

Add to `wp-config.php`:

```php
// Allow API subdomain
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'api.shopwice.com') {
    define('WP_SITEURL', 'https://shopwice.com');
    define('WP_HOME', 'https://shopwice.com');
    
    // CORS headers
    header('Access-Control-Allow-Origin: https://vendor-pwa-mock.vercel.app');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
}
```

### Step 3: Update Vercel Environment Variables

```
NEXT_PUBLIC_JWT_AUTH_URL=https://api.shopwice.com/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_WC_API_BASE_URL=https://api.shopwice.com/wp-json/dokan/v1
WP_BASE_URL=https://api.shopwice.com
```

### Step 4: Redeploy

```bash
vercel --prod
```

---

## 🧪 Test Each Solution

After each fix, redeploy and test:

```bash
# Redeploy
vercel --prod

# Test diagnostic endpoint
https://vendor-pwa-mock.vercel.app/api/test-connection

# Test login
https://vendor-pwa-mock.vercel.app
```

---

## 📊 What to Look For

**Good response from test-connection:**
```json
{
  "test": "JWT Endpoint Test",
  "status": 200,
  "contentType": "application/json",
  "bodyPreview": {
    "code": "invalid_username",
    "message": "Unknown username"
  }
}
```

**Bad response (still broken):**
```json
{
  "test": "JWT Endpoint Test",
  "error": "fetch failed",
  "isHTML": true
}
```

---

## 🎯 Recommended Order

Try these in order:

1. ✅ **Verify Cloudflare Page Rule** (2 min)
2. ✅ **Purge Cloudflare Cache** (2 min)
3. ✅ **Try Configuration Rules** (5 min)
4. ✅ **Check WordPress URLs** (2 min)
5. ✅ **API Subdomain** (10 min - best solution)

---

## Need More Help?

Redeploy the updated diagnostic:

```bash
vercel --prod
```

Then visit: `https://vendor-pwa-mock.vercel.app/api/test-connection`

Share the full output and I'll tell you exactly what's wrong! 🔍
