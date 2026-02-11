# ShopWice Vendor Dashboard - Wiki

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Features](#features)
5. [API Documentation](#api-documentation)
6. [Performance](#performance)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

ShopWice Vendor Dashboard is a modern Progressive Web App (PWA) built for marketplace vendors to manage their products, orders, and business operations.

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Authentication:** JWT (WordPress)
- **Backend:** WordPress + WooCommerce + Dokan
- **Deployment:** Vercel
- **PWA:** Service Worker, Offline Support

### Key Features

- ✅ Product Management (CRUD)
- ✅ Order Management
- ✅ Dashboard Analytics
- ✅ Offline Support
- ✅ Mobile Optimized
- ✅ Vendor Isolation
- ✅ JWT Authentication

---

## Architecture

### Frontend Structure

```
src/
├── app/
│   ├── api/              # API routes (server-side)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── vendor/       # Vendor-specific APIs
│   │   └── products/     # Product APIs
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   └── layout.jsx        # Root layout
├── components/           # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & helpers
└── config/               # Configuration files
```

### API Flow

```
User → Next.js API Route → WordPress REST API → Database
     ← JWT Token ←        ← JSON Response ←
```

### Authentication Flow

1. User enters credentials
2. Next.js calls WordPress JWT endpoint
3. WordPress validates and returns JWT token
4. Token stored in HTTP-only cookie
5. All subsequent requests include token
6. Vendor ID extracted from token for data filtering

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- WordPress with WooCommerce & Dokan
- JWT Authentication plugin

### Local Development

1. **Clone Repository**
```bash
git clone https://github.com/your-username/vendor-pwa-mock.git
cd vendor-pwa-mock
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.production.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_WC_API_BASE_URL=https://your-site.com/wp-json/dokan/v1
NEXT_PUBLIC_JWT_AUTH_URL=https://your-site.com/wp-json/jwt-auth/v1/token
WP_BASE_URL=https://your-site.com
```

4. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### WordPress Setup

1. **Install Required Plugins**
   - WooCommerce
   - Dokan (Multivendor Marketplace)
   - JWT Authentication for WP REST API

2. **Update wp-config.php**

Use the provided `wp-config-corrected.php` file to enable CORS:

```php
// Allow localhost and production domains
$allowed_origins = array(
    'https://vendor.shopwice.com',
    'https://vendor-pwa-mock.vercel.app',
    'http://localhost:3000',
);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
```

3. **Configure JWT**

Add to `wp-config.php`:
```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

---

## Features

### 1. Dashboard

- **Stats Cards:** Revenue, Orders, Products, Pending Orders
- **Quick Wins:** Motivational guidance for new vendors
- **Recent Orders:** Last 5 orders
- **Quick Actions:** Add Product, Manage Products, View Orders

### 2. Product Management

- **List Products:** View all vendor products
- **Add Product:** Create new products with images
- **Edit Product:** Update product details
- **Delete Product:** Remove products
- **Categories & Attributes:** Dynamic category-based attributes

### 3. Order Management

- **List Orders:** View all vendor orders
- **Order Details:** Full order information
- **Status Updates:** Change order status
- **Filtering:** Filter by status (pending, processing, completed)

### 4. Authentication

- **JWT-based:** Secure token authentication
- **Vendor Isolation:** Each vendor sees only their data
- **Session Management:** Auto-logout on token expiry

---

## API Documentation

### Authentication

#### POST `/api/auth/login`

Login with WordPress credentials.

**Request:**
```json
{
  "username": "vendor",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 123,
    "display_name": "Vendor Name",
    "email": "vendor@example.com"
  }
}
```

### Products

#### GET `/api/products`

Get vendor products.

**Query Params:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": "99.99",
    "stock_quantity": 10,
    "status": "publish"
  }
]
```

### Orders

#### GET `/api/vendor/orders`

Get vendor orders.

**Query Params:**
- `page` - Page number
- `per_page` - Items per page
- `status` - Filter by status

**Response:**
```json
{
  "orders": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

---

## Performance

### Current Performance

- **Login:** ~2-3 seconds
- **Dashboard Load:** ~2-3 seconds
- **Product List:** ~1-2 seconds

### Optimization Strategies

1. **Parallel API Calls:** Fetch multiple endpoints simultaneously
2. **Caching:** Cache static data (categories, attributes)
3. **Lazy Loading:** Load components on demand
4. **Image Optimization:** Use Next.js Image component
5. **Code Splitting:** Automatic with Next.js App Router

### Caching Strategy

- **Static Data:** 1 hour cache (categories, brands, locations)
- **Dynamic Data:** 30 seconds cache (orders, products)
- **User Data:** No cache (always fresh)

---

## Deployment

### Vercel Deployment

1. **Connect Repository**
```bash
vercel
```

2. **Configure Environment Variables**

In Vercel Dashboard, add:
- `NEXT_PUBLIC_WC_API_BASE_URL`
- `NEXT_PUBLIC_JWT_AUTH_URL`
- `WP_BASE_URL`

3. **Deploy**
```bash
vercel --prod
```

### Custom Domain

1. Add domain in Vercel
2. Update DNS records
3. Update CORS in WordPress

---

## Troubleshooting

### Login Issues

**Problem:** 503 Service Unavailable

**Solution:** Check JWT endpoint URL in `.env.local`
```env
NEXT_PUBLIC_JWT_AUTH_URL=https://your-site.com/wp-json/jwt-auth/v1/token
```

### CORS Errors

**Problem:** CORS policy blocking requests

**Solution:** Update `wp-config.php` with correct origins

### Empty Dashboard

**Problem:** No products/orders showing

**Solution:** 
1. Verify vendor has products in WordPress
2. Check vendor ID in JWT token
3. Verify Dokan API is enabled

### Slow Performance

**Problem:** Pages taking 5+ seconds to load

**Solution:**
1. Enable caching in API routes
2. Reduce API calls
3. Use parallel fetching
4. Check WordPress server performance

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues:** GitHub Issues
- **Docs:** This Wiki
- **Email:** support@shopwice.com

---

Built with ❤️ for ShopWice vendors
