# Quick Reference - Vendor API Endpoints

## 🆕 New WCFM Proxy Endpoints

```javascript
// Get current user
const user = await fetch('/api/vendor/users/me').then(r => r.json());

// Get settings
const settings = await fetch('/api/vendor/settings').then(r => r.json());

// Update settings
await fetch('/api/vendor/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ store_name: 'New Name', phone: '555-1234' })
});

// Get sales stats
const stats = await fetch('/api/vendor/sales-stats').then(r => r.json());
```

## 📦 All Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vendor/users/me` | GET | Current user details |
| `/api/vendor/settings` | GET | Vendor settings |
| `/api/vendor/settings` | POST | Update settings |
| `/api/vendor/sales-stats` | GET | Sales statistics |
| `/api/vendor/products` | GET | List products |
| `/api/vendor/products` | POST | Create product |
| `/api/vendor/products/[id]` | GET | Get product |
| `/api/vendor/products/[id]` | PUT | Update product |
| `/api/vendor/products/[id]` | DELETE | Delete product |
| `/api/vendor/orders` | GET | List orders |
| `/api/vendor/orders/[id]` | GET | Get order |
| `/api/vendor/orders/[id]/status` | PUT | Update order status |
| `/api/vendor/account` | GET | Account info |
| `/api/vendor/account` | PUT | Update account |

## 🔒 Security

- ✅ All requests authenticated via httpOnly cookies
- ✅ No direct WordPress/WCFM API access
- ✅ All calls go through Next.js middleware

## 📚 Documentation

- **Complete API Reference**: `docs/VENDOR_API_REFERENCE.md`
- **Integration Summary**: `docs/INTEGRATION_COMPLETE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **WCFM Proxy**: `docs/WCFM_PROXY.md`

## 🧪 Test Page

Visit: `http://localhost:3000/test-wcfm-proxy`
