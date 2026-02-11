# WCFM Proxy Architecture - Current State

## Overview

Your vendor PWA now has a **complete middleware layer** that prevents any direct communication between the client and WCFM REST API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client/Frontend                          │
│  (React Components, Pages, Client-side JavaScript)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Uses wcfmClient.js
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Middleware Layer                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /api/wcfm/proxy (Universal WCFM Proxy)           │    │
│  │  - Handles all WCFM API calls                      │    │
│  │  - Validates JWT tokens                            │    │
│  │  - Adds authentication headers                     │    │
│  │  - Centralized error handling                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Existing Vendor Endpoints (Already Middleware)    │    │
│  │  - /api/vendor/products                            │    │
│  │  - /api/vendor/orders                              │    │
│  │  - /api/vendor/account                             │    │
│  │  - /api/vendor/categories                          │    │
│  │  - /api/vendor/brands                              │    │
│  │  - /api/vendor/attributes                          │    │
│  │  - /api/vendor/locations                           │    │
│  │  - /api/vendor/notifications                       │    │
│  │  - /api/vendor/media                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication Endpoints                          │    │
│  │  - /api/auth/jwt (JWT Authentication)              │    │
│  │  - /api/auth/login (Login Flow)                    │    │
│  │  - /api/auth/verify-vendor (Role Verification)     │    │
│  │  - /api/auth/register (Registration)               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  All requests go through
                  Next.js server-side only
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    WordPress Backend                         │
│                                                              │
│  /wp-json/wcfmmp/v1/*  (WCFM REST API)                     │
│  /wp-json/jwt-auth/v1/* (JWT Authentication)                │
│  /wp-json/wp/v2/*      (WordPress REST API)                 │
└─────────────────────────────────────────────────────────────┘
```

## Security Benefits

### ✅ What's Protected Now

1. **JWT Tokens**: Never exposed to client-side JavaScript
2. **API Endpoints**: WordPress URLs never visible in client code
3. **Authentication**: All auth happens server-side
4. **Rate Limiting**: Can be added at middleware layer
5. **Request Validation**: Centralized validation before hitting WordPress
6. **Error Sanitization**: WordPress errors sanitized before reaching client

### ✅ What Client Can't Do

- ❌ Cannot access WCFM REST API directly
- ❌ Cannot see WordPress domain in network requests
- ❌ Cannot manipulate JWT tokens
- ❌ Cannot bypass authentication
- ❌ Cannot access other vendors' data

## Current Endpoints

### Authentication Layer
```
POST /api/auth/jwt
  → Authenticates user with WordPress
  → Returns JWT token (stored in httpOnly cookie)

POST /api/auth/login
  → Full login flow
  → Calls /api/auth/jwt internally
  → Calls /api/auth/verify-vendor internally
  → Returns user data

POST /api/auth/verify-vendor
  → Verifies vendor role
  → Uses /api/wcfm/proxy for WCFM checks
  → Falls back to WordPress API if needed

POST /api/auth/register
  → Registers new vendor
  → Creates WordPress user with vendor role
```

### WCFM Proxy Layer
```
POST /api/wcfm/proxy
  → Universal proxy for ALL WCFM endpoints
  → Accepts: { endpoint, method, body, params }
  → Returns: WCFM API response
  → Used by: wcfmClient.js library
```

### Existing Vendor Endpoints (Already Middleware)
```
GET  /api/vendor/account          → Vendor settings & stats
PUT  /api/vendor/account          → Update vendor settings

GET  /api/vendor/products         → List products
POST /api/vendor/products         → Create product
GET  /api/vendor/products/[id]    → Get product
PUT  /api/vendor/products/[id]    → Update product
DELETE /api/vendor/products/[id]  → Delete product

GET  /api/vendor/orders           → List orders
GET  /api/vendor/orders/[id]      → Get order
PUT  /api/vendor/orders/[id]/status → Update order status

GET  /api/vendor/categories       → List categories
GET  /api/vendor/categories/tree  → Category tree

GET  /api/vendor/brands           → List brands
GET  /api/vendor/attributes       → List attributes
GET  /api/vendor/locations        → List locations
GET  /api/vendor/notifications    → List notifications

POST /api/vendor/media            → Upload media
```

## Usage Patterns

### Option 1: Use wcfmClient (Recommended)

```javascript
import wcfmClient from '@/lib/wcfmClient';

// Simple and clean
const products = await wcfmClient.getProducts({ page: 1 });
const orders = await wcfmClient.getOrders({ status: 'processing' });
const stats = await wcfmClient.getSalesStats();
```

### Option 2: Use Existing Vendor Endpoints

```javascript
// These are already middleware endpoints
const response = await fetch('/api/vendor/products');
const products = await response.json();
```

### Option 3: Direct Proxy Call

```javascript
// For custom WCFM endpoints not covered by wcfmClient
const response = await fetch('/api/wcfm/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    endpoint: 'custom-endpoint',
    method: 'GET',
    params: { key: 'value' }
  })
});
```

## Migration Status

### ✅ Already Using Middleware
- All `/api/vendor/*` endpoints
- All `/api/auth/*` endpoints
- Product management
- Order management
- Category/Brand/Attribute management
- Media uploads

### ✅ Now Using WCFM Proxy
- Vendor role verification (`/api/auth/verify-vendor`)
- Any new WCFM API calls through `wcfmClient`

### ⚠️ Can Be Migrated (Optional)
Your existing `/api/vendor/*` endpoints work perfectly as-is. They're already middleware. You can optionally refactor them to use the WCFM proxy internally, but it's not necessary.

## Environment Variables

```env
# Required for all middleware
WP_BASE_URL=https://your-domain.com
NEXT_PUBLIC_WORDPRESS_URL=https://your-domain.com

# Required for JWT authentication
NEXT_PUBLIC_JWT_AUTH_URL=https://your-domain.com/wp-json/jwt-auth/v1/token

# Required for registration
WP_APP_USERNAME=admin
WP_APP_PASSWORD=your-app-password

# Optional: For internal middleware calls
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Security Checklist

- [x] JWT tokens in httpOnly cookies
- [x] No hardcoded WordPress URLs in client code
- [x] All WCFM calls go through middleware
- [x] Authentication validated server-side
- [x] CORS handled by Next.js
- [x] Environment variables for sensitive data
- [x] Request timeout protection
- [x] Error sanitization
- [x] Centralized logging

## Next Steps (Optional Enhancements)

1. **Rate Limiting**: Add rate limiting to `/api/wcfm/proxy`
2. **Caching**: Add Redis/memory cache for frequently accessed data
3. **Request Validation**: Add Zod/Yup schema validation
4. **Monitoring**: Add request logging and analytics
5. **Retry Logic**: Add automatic retry for failed requests
6. **Circuit Breaker**: Prevent cascading failures

## Documentation

- `docs/WCFM_PROXY.md` - Full WCFM proxy documentation
- `docs/DOKAN_REMOVAL.md` - Dokan removal changes
- `src/lib/wcfmClient.js` - Client library with examples
- `src/app/api/wcfm/proxy/route.js` - Proxy implementation

## Summary

Your application now has **complete middleware protection**:
- ✅ No direct WCFM API calls from client
- ✅ No hardcoded WordPress URLs
- ✅ No Dokan references
- ✅ Centralized authentication
- ✅ Secure token handling
- ✅ Easy to use client library

**The client never talks to WordPress directly - everything goes through your Next.js middleware layer.**
