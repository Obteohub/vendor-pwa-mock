# 🔧 Fix: Use Configuration Rules (No Subdomain Needed)

## The Problem

`api.shopwice.com` doesn't have an SSL certificate. The error:
```
SSL routines:ssl3_read_bytes:tlsv1 unrecognized name
```

## Solution: Use Configuration Rules on Main Domain

This disables Cloudflare security ONLY for `/wp-json/*` paths, no subdomain needed.

---

## Step 1: Revert Vercel Environment Variables (2 minutes)

**Go to:** Vercel Dashboard → Project → Settings → Environment Variables

**Change back to main domain:**

```
NEXT_PUBLIC_JWT_AUTH_URL = https://shopwice.com/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_WC_API_BASE_URL = https://shopwice.com/wp-json/dokan/v1
WP_BASE_URL = https://shopwice.com
```

---

## Step 2: Create Configuration Rule in Cloudflare (5 minutes)

### Option A: Configuration Rules (Recommended - Newer)

1. **Cloudflare Dashboard** → `shopwice.com`
2. **Rules** → **Configuration Rules**
3. **Create rule**

4. **Rule name:** `Disable Security for API`

5. **When incoming requests match:**
   - Click "Edit expression"
   - Enter:
   ```
   (http.request.uri.path contains "/wp-json/")
   ```

6. **Then the settings are:**
   - Click "Add setting"
   - Select **"Security Level"** → Set to **"Essentially Off"**
   - Click "Add setting"
   - Select **"Browser Integrity Check"** → Set to **"Off"**

7. **Deploy**

### Option B: WAF Custom Rule (Alternative)

If Configuration Rules don't work:

1. **Security** → **WAF** → **Custom rules**
2. **Create rule**
3. **Rule name:** `Allow API Access`
4. **When incoming requests match:**
   ```
   (http.request.uri.path contains "/wp-json/")
   ```
5. **Then:** Select **"Skip"**
   - Check ALL boxes:
     - ✅ All remaining custom rules
     - ✅ Rate limiting
     - ✅ Super Bot Fight Mode
     - ✅ Bot Fight Mode
     - ✅ Challenge
6. **Deploy**

---

## Step 3: Purge Cloudflare Cache (1 minute)

1. **Cloudflare** → **Caching** → **Configuration**
2. **Purge Everything**
3. **Purge**

---

## Step 4: Disable "Under Attack Mode" (if enabled)

1. **Cloudflare** → **Security** → **Settings**
2. **Security Level:** Change from "I'm Under Attack" to **"High"** or **"Medium"**

---

## Step 5: Redeploy Vercel (1 minute)

```bash
vercel --prod
```

---

## Step 6: Wait and Test (2 minutes)

**Wait 2-3 minutes** for Cloudflare to propagate changes.

Then test:

1. **Diagnostic endpoint:**
   ```
   https://vendor-pwa-mock.vercel.app/api/test-connection
   ```

2. **Direct test:**
   ```bash
   curl https://shopwice.com/wp-json/jwt-auth/v1/token
   ```

**Expected:** JSON response (not HTML)

---

## Why This Works

✅ **No SSL certificate needed** - Uses existing shopwice.com certificate
✅ **No DNS changes** - Uses main domain
✅ **No subdomain setup** - Simpler configuration
✅ **Main site still protected** - Only `/wp-json/*` paths are exposed

---

## Troubleshooting

### Still Getting Cloudflare Challenge?

1. **Check rule is active** - Should show "Active" status
2. **Check rule order** - Should be first in the list
3. **Try WAF Skip rule** instead of Configuration Rule
4. **Disable "I'm Under Attack Mode"**

### Still Getting SSL Error?

Make sure you reverted the environment variables to use `shopwice.com` (not `api.shopwice.com`)

### Test from Command Line

```bash
# Should return JSON, not HTML
curl -v https://shopwice.com/wp-json/jwt-auth/v1/token

# Look for these in output:
# ✅ "HTTP/2 200" or "HTTP/2 404" = Good (API accessible)
# ❌ "HTTP/2 403" with HTML = Still blocked
```

---

## Alternative: Fix SSL Certificate for api.shopwice.com

If you want to use the subdomain approach later:

### cPanel/Plesk:
1. SSL/TLS → Manage SSL
2. Add `api.shopwice.com` to certificate
3. AutoSSL should regenerate automatically

### Let's Encrypt:
```bash
certbot certonly --expand \
  -d shopwice.com \
  -d www.shopwice.com \
  -d api.shopwice.com
```

### Cloudflare SSL:
- Set DNS to **Proxied** (orange cloud) temporarily
- Cloudflare will provide SSL automatically
- Then set back to **DNS only** (gray cloud)

---

## Summary

1. ✅ Revert env vars to use `shopwice.com`
2. ✅ Create Configuration Rule or WAF Skip rule
3. ✅ Purge Cloudflare cache
4. ✅ Redeploy: `vercel --prod`
5. ✅ Wait 2-3 minutes
6. ✅ Test login

**This will work immediately!** 🚀
