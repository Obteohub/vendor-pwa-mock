# ✅ API Subdomain Setup Checklist

## Current Status: "Failed to connect to the authentication server"

This error means we're making progress! The connection is attempting but failing. Let's verify each step:

---

## Step 1: Verify DNS Setup ✓

**Check if DNS is working:**

```bash
# Test DNS resolution
nslookup api.shopwice.com

# Test if it returns JSON (not Cloudflare challenge)
curl https://api.shopwice.com/wp-json/
```

**Expected:**
- DNS should resolve to your server IP
- curl should return JSON, not HTML

**If you see:**
- ❌ "Just a moment..." → DNS is still proxied (orange cloud)
- ❌ "Connection refused" → DNS not propagated yet
- ✅ JSON response → DNS is working!

---

## Step 2: Verify Cloudflare DNS Settings ✓

1. **Cloudflare Dashboard** → `shopwice.com` → **DNS**
2. **Find the `api` record**
3. **Check:**
   - Name: `api`
   - Type: `CNAME` or `A`
   - Target: Your server IP or `shopwice.com`
   - **Proxy status: GRAY cloud ☁️ (DNS only)**
   
**If it's orange 🟠:** Click it to turn it gray!

---

## Step 3: Verify SSL Certificate ✓

Your server needs an SSL certificate for `api.shopwice.com`.

**If using cPanel/Plesk:**
- SSL certificates usually auto-generate for subdomains
- Check: SSL/TLS → Manage SSL

**If using Let's Encrypt:**
```bash
# Add subdomain to certificate
certbot certonly --expand -d shopwice.com -d www.shopwice.com -d api.shopwice.com
```

**Test SSL:**
```bash
curl -v https://api.shopwice.com/wp-json/ 2>&1 | grep -i ssl
```

---

## Step 4: Verify Vercel Environment Variables ✓

**Go to:** Vercel Dashboard → Project → Settings → Environment Variables

**Check these 3 variables are set for PRODUCTION:**

```
NEXT_PUBLIC_JWT_AUTH_URL = https://api.shopwice.com/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_WC_API_BASE_URL = https://api.shopwice.com/wp-json/dokan/v1
WP_BASE_URL = https://api.shopwice.com
```

**Important:**
- Must be set for "Production" environment
- Must use `https://` (not http)
- No trailing slashes

**After changing:** Redeploy!
```bash
vercel --prod
```

---

## Step 5: Verify WordPress CORS Headers ✓

Add this to `wp-config.php` (before "That's all, stop editing!"):

```php
// CORS for API subdomain
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
```

**Test CORS:**
```bash
curl -H "Origin: https://vendor-pwa-mock.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.shopwice.com/wp-json/jwt-auth/v1/token -v
```

Look for: `Access-Control-Allow-Origin` in response headers

---

## Step 6: Test JWT Plugin ✓

**Test with real credentials:**

```bash
curl -X POST https://api.shopwice.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}'
```

**Expected responses:**

✅ **Success:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "user@example.com"
}
```

❌ **Plugin not configured:**
```json
{
  "code": "jwt_auth_bad_config",
  "message": "JWT is not configured properly"
}
```

❌ **Plugin not installed:**
```json
{
  "code": "rest_no_route",
  "message": "No route was found"
}
```

---

## Step 7: Check Diagnostic Endpoint ✓

Visit: `https://vendor-pwa-mock.vercel.app/api/test-connection`

**Look for:**

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

**If you see:**
- ❌ `"error": "fetch failed"` → DNS/SSL issue
- ❌ `"isHTML": true` → Still hitting Cloudflare
- ❌ `"status": 403` → CORS or security issue
- ✅ `"status": 200` with JSON → Working!

---

## Common Issues & Fixes

### Issue: "SSL certificate problem"

**Fix:** Add SSL certificate for api.shopwice.com on your server

### Issue: "CORS policy blocked"

**Fix:** Add CORS headers to wp-config.php (see Step 5)

### Issue: "Connection refused"

**Fix:** DNS not propagated yet, wait 5 minutes

### Issue: Still seeing Cloudflare challenge

**Fix:** DNS record is still proxied (orange cloud), change to gray

### Issue: "jwt_auth_bad_config"

**Fix:** Add to wp-config.php:
```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

---

## Quick Diagnostic Commands

Run these to check each component:

```bash
# 1. DNS
nslookup api.shopwice.com

# 2. SSL
curl -v https://api.shopwice.com/wp-json/ 2>&1 | grep -i "ssl\|certificate"

# 3. WordPress API
curl https://api.shopwice.com/wp-json/

# 4. JWT endpoint
curl https://api.shopwice.com/wp-json/jwt-auth/v1/token

# 5. CORS
curl -H "Origin: https://vendor-pwa-mock.vercel.app" \
     -X OPTIONS \
     https://api.shopwice.com/wp-json/jwt-auth/v1/token -v
```

---

## Next Steps

1. ✅ Run diagnostic endpoint: `/api/test-connection`
2. ✅ Share the output
3. ✅ Run the curl commands above
4. ✅ Share any error messages

This will tell us exactly what's failing! 🔍
