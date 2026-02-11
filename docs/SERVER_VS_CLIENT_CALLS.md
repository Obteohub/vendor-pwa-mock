# Understanding Server-Side vs Client-Side Calls

## ❓ Why Do I See `shopwice.com` in the Logs?

**Short Answer**: This is **CORRECT and SECURE**! The logs show **server-side** calls, not client-side calls.

## 🔒 How the Middleware Works

### What You See in Server Logs (Terminal)
```
[JWT MIDDLEWARE] 🔒 Server-side auth request for user: user@example.com
[WCFM PROXY] 🔒 Server-side request: GET /wp-json/wcfmmp/v1/users/me
```

**This is GOOD!** These logs show that:
- ✅ Your **Next.js server** is calling WordPress
- ✅ The **client browser** never sees these URLs
- ✅ JWT tokens are handled server-side only
- ✅ WordPress domain is hidden from the client

### What Client Sees (Browser Network Tab)
```
POST /api/auth/login
POST /api/auth/jwt
POST /api/wcfm/proxy
GET /api/vendor/users/me
```

**This is PERFECT!** The client only sees:
- ✅ Your Next.js API routes (`/api/*`)
- ❌ NO WordPress domain
- ❌ NO `shopwice.com`
- ❌ NO direct WCFM API calls

## 📊 Request Flow Diagram

### Login Flow
```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client)                                           │
│  User enters credentials                                    │
└─────────────────────────────────────────────────────────────┘
                    ↓
            POST /api/auth/login
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Next.js Server (Middleware)                                │
│  /api/auth/login receives request                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
         Calls /api/auth/jwt internally
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Next.js Server (JWT Middleware)                            │
│  /api/auth/jwt makes server-side call                       │
│  🔒 Server-side: https://shopwice.com/wp-json/jwt-auth/...  │
│  (Client never sees this!)                                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
         Returns JWT token to /api/auth/login
                    ↓
         Calls /api/auth/verify-vendor internally
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Next.js Server (Verify Middleware)                         │
│  /api/auth/verify-vendor makes server-side call             │
│  🔒 Server-side: https://shopwice.com/wp-json/wcfmmp/...    │
│  (Client never sees this!)                                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
         Returns user data to /api/auth/login
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client)                                           │
│  Receives: { success: true, user: {...} }                   │
│  JWT token stored in httpOnly cookie                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Points

### ✅ What's Secure

1. **Server Logs Show WordPress Domain**
   - This is NORMAL and EXPECTED
   - The Next.js server must call WordPress to get data
   - These calls happen server-side only

2. **Client Never Sees WordPress**
   - Open browser DevTools → Network tab
   - You'll only see `/api/*` calls
   - NO `shopwice.com` visible to client

3. **JWT Tokens Protected**
   - Stored in httpOnly cookies
   - Never accessible via JavaScript
   - Never sent in URLs

### ❌ What Would Be Insecure

1. **Client Calling WordPress Directly**
   ```javascript
   // ❌ BAD - Client sees WordPress domain
   fetch('https://shopwice.com/wp-json/wcfmmp/v1/products')
   ```

2. **JWT Tokens in Client Code**
   ```javascript
   // ❌ BAD - Token exposed to JavaScript
   const token = localStorage.getItem('jwt_token');
   ```

3. **WordPress Domain in Client Bundle**
   ```javascript
   // ❌ BAD - Domain visible in source code
   const API_URL = 'https://shopwice.com/wp-json';
   ```

## 🧪 How to Verify Security

### 1. Check Browser Network Tab
```bash
# Open your app in browser
# Open DevTools (F12) → Network tab
# Log in to your app
# Look at the requests
```

**You should see:**
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/jwt`
- ✅ `POST /api/wcfm/proxy`
- ✅ `GET /api/vendor/users/me`

**You should NOT see:**
- ❌ `https://shopwice.com/*`
- ❌ Direct WordPress API calls

### 2. Check Source Code
```bash
# View page source in browser
# Search for "shopwice"
```

**You should NOT find:**
- ❌ WordPress domain in HTML
- ❌ WordPress domain in JavaScript bundles

### 3. Check Cookies
```bash
# Open DevTools → Application → Cookies
# Find sw_token cookie
```

**You should see:**
- ✅ `HttpOnly` flag is checked
- ✅ Cannot access via `document.cookie`

## 📝 Understanding the Logs

### Server Terminal Logs (What You See)

```
[JWT MIDDLEWARE] 🔒 Server-side auth request for user: user@example.com
```
- **Where**: Next.js server terminal
- **Who sees it**: Only you (developer)
- **What it means**: Server is calling WordPress (GOOD!)

```
[WCFM PROXY] 🔒 Server-side request: GET /wp-json/wcfmmp/v1/users/me
```
- **Where**: Next.js server terminal
- **Who sees it**: Only you (developer)
- **What it means**: Server is proxying WCFM call (GOOD!)

### Browser Console Logs (What Client Sees)

```
POST /api/auth/login 200
```
- **Where**: Browser DevTools → Console
- **Who sees it**: Anyone using the app
- **What it means**: Client called your API (GOOD!)

## 🎓 Summary

| Aspect | Server Logs | Client Network Tab |
|--------|-------------|-------------------|
| **Shows WordPress domain?** | ✅ Yes (server-side) | ❌ No (hidden) |
| **Shows JWT tokens?** | ✅ Yes (server-side) | ❌ No (httpOnly cookie) |
| **Who can see?** | Only developers | Anyone using app |
| **Is this secure?** | ✅ Yes | ✅ Yes |

## ✅ Your Setup is CORRECT!

Seeing `shopwice.com` in your **server logs** is:
- ✅ **Expected** - The server must call WordPress
- ✅ **Secure** - Client never sees these calls
- ✅ **Correct** - This is how middleware works

**The important thing is**: Open your browser's Network tab and verify you DON'T see `shopwice.com` there!

## 🔍 Quick Test

1. Open your app in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Log in
5. Look at the requests

**If you see only `/api/*` requests and NO `shopwice.com`, you're SECURE!** ✅

The server logs showing WordPress domain is just the middleware doing its job - calling WordPress on your behalf, keeping the client completely isolated from WordPress.
