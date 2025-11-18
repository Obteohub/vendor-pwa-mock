# 🎯 FINAL FIX: API Subdomain Setup

## Why This Works

Your Cloudflare Page Rule isn't working because:
- ❌ Redirect loop: "redirect count exceeded"
- ❌ Still showing "Just a moment..." (Cloudflare challenge)
- ❌ 403 Forbidden

**Solution:** Create `api.shopwice.com` that bypasses Cloudflare entirely.

---

## Step 1: Add DNS Record in Cloudflare (2 minutes)

1. **Go to:** https://dash.cloudflare.com
2. **Select:** `shopwice.com`
3. **Click:** DNS → Records
4. **Click:** Add record

5. **Fill in:**
   - **Type:** `CNAME`
   - **Name:** `api`
   - **Target:** `shopwice.com` (or your server IP if using A record)
   - **Proxy status:** ⚠️ **DNS only** (Click the cloud to make it GRAY ☁️, NOT orange 🟠)
   - **TTL:** Auto
   
6. **Click:** Save

**Result:** `api.shopwice.com` will point to your server but bypass Cloudflare protection.

---

## Step 2: Test DNS Propagation (1 minute)

Wait 1-2 minutes, then test:

```bash
# Should return JSON, not Cloudflare challenge
curl https://api.shopwice.com/wp-json/
```

**Expected:** JSON response with WordPress API info
**If you see HTML:** DNS not propagated yet, wait another minute

---

## Step 3: Update Vercel Environment Variables (3 minutes)

1. **Go to:** https://vercel.com/dashboard
2. **Select your project:** vendor-pwa-mock
3. **Settings** → **Environment Variables**

4. **Update these 3 variables for Production:**

   **Delete old values and add new:**
   
   ```
   NEXT_PUBLIC_JWT_AUTH_URL
   Value: https://api.shopwice.com/wp-json/jwt-auth/v1/token
   ```
   
   ```
   NEXT_PUBLIC_WC_API_BASE_URL
   Value: https://api.shopwice.com/wp-json/dokan/v1
   ```
   
   ```
   WP_BASE_URL
   Value: https://api.shopwice.com
   ```

5. **Click:** Save for each

---

## Step 4: Configure WordPress CORS (5 minutes)

Add this to your `wp-config.php` (before "That's all, stop editing!"):

```php
// Allow API subdomain
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'api.shopwice.com') {
    // CORS headers for Vercel app
    header('Access-Control-Allow-Origin: https://vendor-pwa-mock.vercel.app');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
```

**Or add to your theme's `functions.php`:**

```php
add_action('init', function() {
    if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'api.shopwice.com') {
        header('Access-Control-Allow-Origin: https://vendor-pwa-mock.vercel.app');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
});
```

---

## Step 5: Redeploy Vercel (1 minute)

```bash
vercel --prod
```

Or in Vercel Dashboard:
- **Deployments** → **...** (three dots) → **Redeploy**

---

## Step 6: Test Everything (2 minutes)

### Test 1: Diagnostic Endpoint
```
https://vendor-pwa-mock.vercel.app/api/test-connection
```

**Expected result:**
```json
{
  "test": "JWT Endpoint Test",
  "url": "https://api.shopwice.com/wp-json/jwt-auth/v1/token",
  "status": 200,
  "contentType": "application/json",
  "bodyPreview": {
    "code": "invalid_username"
  }
}
```

### Test 2: Login
Go to: `https://vendor-pwa-mock.vercel.app`

Try logging in with your vendor credentials.

---

## Troubleshooting

### DNS Not Propagating?

Check DNS:
```bash
nslookup api.shopwice.com
```

Should show your server IP.

### Still Getting Cloudflare?

Make sure the cloud icon is **GRAY** (DNS only), not orange (proxied).

### CORS Errors?

Check the origin in wp-config.php matches your Vercel URL exactly:
```php
header('Access-Control-Allow-Origin: https://vendor-pwa-mock.vercel.app');
```

### Still Not Working?

Share the output from:
```
https://vendor-pwa-mock.vercel.app/api/test-connection
```

---

## Why This Works

✅ **No Cloudflare challenges** - DNS only mode bypasses all security
✅ **No redirects** - Direct connection to WordPress
✅ **No SSL issues** - Uses your existing SSL certificate
✅ **Main site still protected** - Only API subdomain is exposed
✅ **Fast** - No extra hops or processing

---

## Summary

1. ✅ Add `api.shopwice.com` DNS record (gray cloud)
2. ✅ Update 3 Vercel environment variables
3. ✅ Add CORS headers to wp-config.php
4. ✅ Redeploy: `vercel --prod`
5. ✅ Test login

**Total time: 10-15 minutes** ⏱️

This is the most reliable solution and will work immediately! 🚀
