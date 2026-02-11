# Vendor API Endpoints - Complete Reference

## Overview

All vendor API endpoints are **middleware proxies** that communicate with WCFM REST API on the server-side. The client never communicates directly with WordPress.

## 🆕 New WCFM Proxy Endpoints

### 1. Get Current User
**Endpoint**: `GET /api/vendor/users/me`  
**Proxies to**: `/wp-json/wcfmmp/v1/users/me`  
**Description**: Returns current vendor user details

**Response**:
```json
{
  "id": 123,
  "username": "vendor1",
  "email": "vendor@example.com",
  "role": "wcfm_vendor",
  "display_name": "Vendor Name",
  "store_name": "My Store"
}
```

**Usage**:
```javascript
const response = await fetch('/api/vendor/users/me');
const user = await response.json();
```

---

### 2. Get Vendor Settings
**Endpoint**: `GET /api/vendor/settings`  
**Proxies to**: `/wp-json/wcfmmp/v1/settings`  
**Description**: Returns vendor store settings

**Response**:
```json
{
  "store_name": "My Store",
  "phone": "123-456-7890",
  "email": "store@example.com",
  "address": "123 Main St",
  "banner": "https://example.com/banner.jpg",
  "gravatar": "https://example.com/avatar.jpg",
  "social": {
    "facebook": "https://facebook.com/mystore",
    "twitter": "https://twitter.com/mystore"
  }
}
```

**Usage**:
```javascript
const response = await fetch('/api/vendor/settings');
const settings = await response.json();
```

---

### 3. Update Vendor Settings
**Endpoint**: `POST /api/vendor/settings`  
**Proxies to**: `/wp-json/wcfmmp/v1/settings`  
**Description**: Updates vendor store settings

**Request Body**:
```json
{
  "store_name": "Updated Store Name",
  "phone": "987-654-3210",
  "email": "newemail@example.com",
  "address": "456 New St"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

**Usage**:
```javascript
const response = await fetch('/api/vendor/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    store_name: 'New Store Name',
    phone: '555-1234'
  })
});
const result = await response.json();
```

---

### 4. Get Sales Statistics
**Endpoint**: `GET /api/vendor/sales-stats`  
**Proxies to**: `/wp-json/wcfmmp/v1/sales-stats`  
**Description**: Returns vendor sales statistics

**Query Parameters**:
- `period` - Time period (e.g., 'week', 'month', 'year')
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)

**Response**:
```json
{
  "total_sales": "12345.67",
  "total_orders": 150,
  "total_products": 45,
  "pending_orders": 5,
  "processing_orders": 10,
  "completed_orders": 135,
  "today_sales": "234.56",
  "today_orders": 3
}
```

**Usage**:
```javascript
const response = await fetch('/api/vendor/sales-stats?period=month');
const stats = await response.json();
```

---

## ✅ Existing Vendor Endpoints

### Products

#### List Products
**Endpoint**: `GET /api/vendor/products`  
**Query Parameters**:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)
- `status` - Product status (publish, pending, draft, any)
- `search` - Search term

**Response**: Array of products

---

#### Get Single Product
**Endpoint**: `GET /api/vendor/products/[id]`  
**Response**: Product object

---

#### Create Product
**Endpoint**: `POST /api/vendor/products`  
**Request Body**: Product data

---

#### Update Product
**Endpoint**: `PUT /api/vendor/products/[id]`  
**Request Body**: Product data

---

#### Delete Product
**Endpoint**: `DELETE /api/vendor/products/[id]`  
**Query Parameters**:
- `force` - Force delete (default: true)

---

### Orders

#### List Orders
**Endpoint**: `GET /api/vendor/orders`  
**Query Parameters**:
- `page` - Page number
- `per_page` - Items per page
- `status` - Order status (processing, completed, pending, etc.)

**Response**: Array of orders

---

#### Get Single Order
**Endpoint**: `GET /api/vendor/orders/[id]`  
**Response**: Order object

---

#### Update Order Status
**Endpoint**: `PUT /api/vendor/orders/[id]/status`  
**Request Body**:
```json
{
  "status": "completed"
}
```

---

### Account

#### Get Account Info
**Endpoint**: `GET /api/vendor/account`  
**Response**: Account info with stats and profile

---

#### Update Account
**Endpoint**: `PUT /api/vendor/account`  
**Request Body**: Account data

---

### Categories

#### List Categories
**Endpoint**: `GET /api/vendor/categories`  
**Response**: Array of categories

---

#### Get Category Tree
**Endpoint**: `GET /api/vendor/categories/tree`  
**Response**: Hierarchical category tree

---

### Brands

#### List Brands
**Endpoint**: `GET /api/vendor/brands`  
**Response**: Array of brands

---

### Attributes

#### List Attributes
**Endpoint**: `GET /api/vendor/attributes`  
**Response**: Array of product attributes

---

#### Get Attribute Terms
**Endpoint**: `GET /api/vendor/attributes/[id]/terms`  
**Response**: Array of attribute terms

---

### Media

#### Upload Media
**Endpoint**: `POST /api/vendor/media`  
**Request**: FormData with file
**Response**: Media object with URL

---

### Notifications

#### Get Notifications
**Endpoint**: `GET /api/vendor/notifications`  
**Response**: Array of notifications

---

### Locations

#### Get Locations
**Endpoint**: `GET /api/vendor/locations`  
**Response**: Array of locations

---

### Dashboard Stats

#### Get Dashboard Statistics
**Endpoint**: `GET /api/vendor/dashboard/stats`  
**Response**: Dashboard statistics

---

## 🔒 Authentication

All endpoints require authentication via JWT token stored in httpOnly cookie (`sw_token`).

**Unauthorized Response** (401):
```json
{
  "error": "Unauthorized. Missing authentication token."
}
```

## ⚠️ Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "status": 400
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `504` - Gateway Timeout

## 📊 Response Headers

All endpoints include:
- `Cache-Control: private, no-store` - Prevent caching of user-specific data
- `Vary: Cookie` - Cache varies by authentication

## 🧪 Testing

### Using Fetch API
```javascript
// Get current user
const user = await fetch('/api/vendor/users/me').then(r => r.json());

// Get settings
const settings = await fetch('/api/vendor/settings').then(r => r.json());

// Update settings
const result = await fetch('/api/vendor/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ store_name: 'New Name' })
}).then(r => r.json());

// Get sales stats
const stats = await fetch('/api/vendor/sales-stats').then(r => r.json());
```

### Using wcfmClient (Alternative)
```javascript
import wcfmClient from '@/lib/wcfmClient';

const user = await wcfmClient.getMe();
const settings = await wcfmClient.getSettings();
await wcfmClient.updateSettings({ store_name: 'New Name' });
const stats = await wcfmClient.getSalesStats();
```

## 🎯 Complete Endpoint List

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vendor/users/me` | GET | Get current user |
| `/api/vendor/settings` | GET | Get vendor settings |
| `/api/vendor/settings` | POST | Update vendor settings |
| `/api/vendor/sales-stats` | GET | Get sales statistics |
| `/api/vendor/products` | GET, POST | List/Create products |
| `/api/vendor/products/[id]` | GET, PUT, DELETE | Get/Update/Delete product |
| `/api/vendor/orders` | GET | List orders |
| `/api/vendor/orders/[id]` | GET | Get order |
| `/api/vendor/orders/[id]/status` | PUT | Update order status |
| `/api/vendor/account` | GET, PUT | Get/Update account |
| `/api/vendor/categories` | GET | List categories |
| `/api/vendor/categories/tree` | GET | Get category tree |
| `/api/vendor/brands` | GET | List brands |
| `/api/vendor/attributes` | GET | List attributes |
| `/api/vendor/attributes/[id]/terms` | GET | Get attribute terms |
| `/api/vendor/media` | POST | Upload media |
| `/api/vendor/notifications` | GET | Get notifications |
| `/api/vendor/locations` | GET | Get locations |
| `/api/vendor/dashboard/stats` | GET | Get dashboard stats |

## 🔐 Security Features

- ✅ All requests authenticated server-side
- ✅ JWT tokens in httpOnly cookies
- ✅ No direct WCFM API access from client
- ✅ Request validation and sanitization
- ✅ Timeout protection (15-30 seconds)
- ✅ Error message sanitization
- ✅ CORS handled by Next.js

## 📝 Notes

1. All endpoints are server-side middleware - client never calls WCFM directly
2. Authentication is handled automatically via cookies
3. All responses are JSON
4. Timeouts are set to prevent hanging requests
5. Errors are logged server-side for debugging
