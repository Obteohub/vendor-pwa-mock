# How to Change WordPress Domain

## 🎯 Quick Guide

### Step 1: Edit `.env.local`

Change **ONLY** this line:

```env
# FROM:
WP_BASE_URL=https://shopwice.com

# TO:
WP_BASE_URL=https://yournewdomain.com
```

### Step 2: Update Related URLs

Also update these to match:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://yournewdomain.com
NEXT_PUBLIC_SITE_URL=https://yournewdomain.com
```

### Step 3: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Done! ✅

## 📝 Complete Example

### Before (shopwice.com)
```env
WP_BASE_URL=https://shopwice.com
NEXT_PUBLIC_WORDPRESS_URL=https://shopwice.com
NEXT_PUBLIC_SITE_URL=https://shopwice.com
```

### After (newdomain.com)
```env
WP_BASE_URL=https://newdomain.com
NEXT_PUBLIC_WORDPRESS_URL=https://newdomain.com
NEXT_PUBLIC_SITE_URL=https://newdomain.com
```

## ✅ What Gets Auto-Derived

These URLs are **automatically constructed** from `WP_BASE_URL`:

- ✅ JWT Auth URL: `${WP_BASE_URL}/wp-json/jwt-auth/v1/token`
- ✅ WooCommerce API: `${WP_BASE_URL}/wp-json/wc/v3`
- ✅ WCFM API: `${WP_BASE_URL}/wp-json/wcfmmp/v1`

**You don't need to set them manually!**

## 🔧 Environment Variables Explained

### Required (Change when switching domains)

```env
# Main WordPress URL - CHANGE THIS
WP_BASE_URL=https://your-domain.com

# Should match WP_BASE_URL
NEXT_PUBLIC_WORDPRESS_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Auto-Derived (Don't need to set)

```env
# These are built automatically from WP_BASE_URL
# NEXT_PUBLIC_JWT_AUTH_URL - Auto: ${WP_BASE_URL}/wp-json/jwt-auth/v1/token
# WC_API_URL - Auto: ${WP_BASE_URL}/wp-json/wc/v3
```

### Never Change (App Configuration)

```env
NEXT_PUBLIC_WC_API_BASE_URL=/api/vendor
COOKIE_NAME=sw_token
COOKIE_MAX_AGE=604800
CURRENCY=GHS
```

### WordPress Credentials (Update if different on new domain)

```env
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
WP_APP_USERNAME=admin
WP_APP_PASSWORD=your-app-password
```

## 🧪 Testing After Domain Change

### 1. Check Server Logs

```
[JWT MIDDLEWARE] 🔒 Server-side auth request...
[WCFM PROXY] 🔒 Server-side request: GET /wp-json/wcfmmp/v1/...
```

Should show your **new domain** in the URLs.

### 2. Check Browser Network Tab

Open DevTools → Network tab:
- ✅ Should see: `/api/*` endpoints
- ❌ Should NOT see: Direct WordPress domain calls

### 3. Test Login

Try logging in - should work with new domain!

## 🚀 Production Deployment

When deploying to production, set these environment variables:

```env
WP_BASE_URL=https://production-domain.com
NEXT_PUBLIC_WORDPRESS_URL=https://production-domain.com
NEXT_PUBLIC_SITE_URL=https://production-domain.com
WC_CONSUMER_KEY=ck_production_key
WC_CONSUMER_SECRET=cs_production_secret
WP_APP_USERNAME=production_admin
WP_APP_PASSWORD=production_password
```

## 📊 Summary

### To Change Domain:

1. ✅ Update `WP_BASE_URL`
2. ✅ Update `NEXT_PUBLIC_WORDPRESS_URL`
3. ✅ Update `NEXT_PUBLIC_SITE_URL`
4. ✅ Restart server
5. ✅ Done!

### Auto-Derived:

- ✅ JWT Auth URL
- ✅ WooCommerce API URL
- ✅ WCFM API URL

### No Code Changes Needed! 🎉

All API endpoints automatically use the domain from `.env.local`!
