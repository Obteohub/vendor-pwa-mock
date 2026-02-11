# 🔄 Domain Change - Quick Reference

## To Change WordPress Domain:

### 1. Edit `.env.local`

Change these **3 lines**:

```env
WP_BASE_URL=https://yournewdomain.com
NEXT_PUBLIC_WORDPRESS_URL=https://yournewdomain.com
NEXT_PUBLIC_SITE_URL=https://yournewdomain.com
```

### 2. Restart Server

```bash
npm run dev
```

### 3. Done! ✅

---

## ✅ Auto-Derived URLs

These are **automatically** built from `WP_BASE_URL`:

- JWT Auth: `${WP_BASE_URL}/wp-json/jwt-auth/v1/token`
- WooCommerce: `${WP_BASE_URL}/wp-json/wc/v3`
- WCFM: `${WP_BASE_URL}/wp-json/wcfmmp/v1`

**No need to set them manually!**

---

## 📝 Example

### shopwice.com → newdomain.com

```env
# Before
WP_BASE_URL=https://shopwice.com
NEXT_PUBLIC_WORDPRESS_URL=https://shopwice.com
NEXT_PUBLIC_SITE_URL=https://shopwice.com

# After
WP_BASE_URL=https://newdomain.com
NEXT_PUBLIC_WORDPRESS_URL=https://newdomain.com
NEXT_PUBLIC_SITE_URL=https://newdomain.com
```

---

## 🚫 Don't Change

These stay the same:

```env
NEXT_PUBLIC_WC_API_BASE_URL=/api/vendor
COOKIE_NAME=sw_token
COOKIE_MAX_AGE=604800
CURRENCY=GHS
```

---

## 📚 Full Guide

See: `docs/HOW_TO_CHANGE_DOMAIN.md`
