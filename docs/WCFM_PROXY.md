# WCFM Proxy Middleware

## Overview

The WCFM Proxy Middleware provides a secure, centralized way to communicate with the WCFM REST API. **No client-side code ever communicates directly with WCFM** - all requests go through the Next.js middleware layer.

## Architecture

```
Client/Frontend
    ↓
/api/wcfm/proxy (Middleware)
    ↓
WCFM REST API (/wp-json/wcfmmp/v1/*)
```

## Benefits

1. **Security**: JWT tokens never exposed to client-side
2. **Centralized Control**: All WCFM calls go through one endpoint
3. **Error Handling**: Consistent error handling across all requests
4. **Logging**: Centralized logging of all WCFM API calls
5. **Rate Limiting**: Easy to add rate limiting in one place
6. **Caching**: Can add caching layer if needed

## Endpoints

### Universal Proxy

**Endpoint**: `POST /api/wcfm/proxy`

**Request Body**:
```json
{
  "endpoint": "users/me",
  "method": "GET",
  "body": {},
  "params": {}
}
```

**Response**:
```json
{
  // WCFM API response data
}
```

## WCFM Client Library

Use the `wcfmClient` library for easy access to WCFM API:

```javascript
import wcfmClient from '@/lib/wcfmClient';

// Get current user
const user = await wcfmClient.getMe();

// Get products
const products = await wcfmClient.getProducts({
  page: 1,
  per_page: 20,
  status: 'publish'
});

// Get orders
const orders = await wcfmClient.getOrders({
  page: 1,
  per_page: 10,
  status: 'processing'
});

// Get sales stats
const stats = await wcfmClient.getSalesStats();

// Get settings
const settings = await wcfmClient.getSettings();

// Update settings
await wcfmClient.updateSettings({
  store_name: 'My Store',
  phone: '123-456-7890'
});
```

## Available WCFM Endpoints

All endpoints are proxied through `/api/wcfm/proxy`:

### User & Settings
- `users/me` - Get current vendor details
- `settings` - Get/Update vendor settings

### Products
- `products` - List products
- `products/{id}` - Get/Update/Delete product
- `products/categories` - Get product categories

### Orders
- `orders` - List orders
- `orders/{id}` - Get/Update order
- `orders/{id}/notes` - Order notes

### Statistics
- `sales-stats` - Get sales statistics

### Other
- `notifications` - Get notifications
- `store-vendors/{id}` - Get vendor profile

## Usage Examples

### Basic Request

```javascript
import wcfmClient from '@/lib/wcfmClient';

try {
  const data = await wcfmClient.request('users/me', {
    method: 'GET'
  });
  console.log('User data:', data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### With Query Parameters

```javascript
const products = await wcfmClient.request('products', {
  method: 'GET',
  params: {
    page: 1,
    per_page: 20,
    status: 'publish',
    search: 'laptop'
  }
});
```

### POST Request

```javascript
const newProduct = await wcfmClient.request('products', {
  method: 'POST',
  body: {
    name: 'New Product',
    type: 'simple',
    regular_price: '99.99',
    status: 'pending'
  }
});
```

### PUT Request

```javascript
const updated = await wcfmClient.request('products/123', {
  method: 'PUT',
  body: {
    name: 'Updated Product Name',
    regular_price: '89.99'
  }
});
```

### DELETE Request

```javascript
await wcfmClient.request('products/123', {
  method: 'DELETE',
  params: { force: true }
});
```

## Error Handling

```javascript
import wcfmClient, { WcfmError } from '@/lib/wcfmClient';

try {
  const data = await wcfmClient.getProducts();
} catch (error) {
  if (error instanceof WcfmError) {
    console.error('WCFM Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    });
  } else {
    console.error('Network error:', error.message);
  }
}
```

## Pagination

Responses with pagination include headers:

```javascript
const result = await wcfmClient.getProducts({
  page: 1,
  per_page: 20
});

console.log(result.data); // Products array
console.log(result.pagination); // { total: 100, totalPages: 5 }
```

## Server-Side Usage

You can also use the proxy from server components or API routes:

```javascript
// In a server component or API route
export async function GET(request) {
  const response = await fetch('http://localhost:3000/api/wcfm/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('Cookie') // Forward cookies
    },
    body: JSON.stringify({
      endpoint: 'users/me',
      method: 'GET'
    })
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

## Security

1. **Authentication**: All requests require valid JWT token in cookies
2. **Authorization**: WCFM API handles vendor-specific authorization
3. **No Direct Access**: Client never accesses WCFM directly
4. **Token Protection**: JWT tokens are httpOnly cookies, never exposed to client

## Environment Variables

Required environment variables:

```env
WP_BASE_URL=https://your-domain.com
NEXT_PUBLIC_WORDPRESS_URL=https://your-domain.com
```

## Logging

All WCFM proxy requests are logged:

```
[WCFM PROXY] GET /users/me
[WCFM PROXY] POST /products
[WCFM PROXY] Request failed: { status: 404, endpoint: 'products/999' }
```

## Migration Guide

### Before (Direct WCFM calls)

```javascript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wcfmmp/v1/products`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

### After (Using proxy)

```javascript
import wcfmClient from '@/lib/wcfmClient';

const products = await wcfmClient.getProducts();
```

## Best Practices

1. **Use convenience methods** when available (e.g., `getProducts()` instead of `request('products')`)
2. **Handle errors** properly with try/catch
3. **Use pagination** for large datasets
4. **Cache results** on client-side when appropriate
5. **Validate data** before sending to proxy

## Troubleshooting

### "Unauthorized" Error
- Ensure user is logged in
- Check JWT token is valid
- Verify cookies are being sent

### "Endpoint is required" Error
- Make sure `endpoint` parameter is provided
- Check endpoint path is correct

### Timeout Errors
- Default timeout is 30 seconds
- Check WCFM API is responding
- Verify network connectivity

### Non-JSON Response
- WCFM API returned HTML instead of JSON
- Usually indicates authentication or routing issue
- Check WordPress/WCFM configuration
