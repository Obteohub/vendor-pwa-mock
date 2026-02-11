# Vendor Dashboard Middleware API

This document outlines the standardized API endpoints implemented for the Vendor PWA dashboard. The PWA now relies on these "Middleware" endpoints (Next.js API Routes) rather than contacting the backend directly.

## 1. Login & Registration

### **Login**
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ "username": "...", "password": "..." }`
- **Response**: JWT Token + User Info

### **Register (Vendor)**
- **Endpoint**: `POST /api/auth/register`
- **Payload**: `{ "email": "...", "username": "...", "password": "...", "role": "wcfm_vendor" }`
- **Response**: Account creation status.

---

## 2. Dashboard Home (Overview)

### **Get Stats & Profile**
- **Endpoint**: `GET /api/vendor/account`
- **Response**:
  ```json
  {
    "profile": {
      "id": 123,
      "store_name": "My Tech Store",
      "status": "online",
      "banner": "...", 
      "gravatar": "..."
    },
    "stats": {
      "total_sales": "1500.00",
      "total_earnings": "1200.00",
      "total_orders": 45,
      "product_count": 12
    }
  }
  ```

---

## 3. Products Management

### **List Products**
- **Endpoint**: `GET /api/vendor/products`
- **Query Params**: `?page=1&per_page=10&search=...&status=any`
- **Response**: array of products + pagination metadata.

### **Add Product**
- **Endpoint**: `POST /api/vendor/products`
- **Payload**: Standard Product JSON / FormData (supports images).

### **Edit Product**
- **Endpoint**: `PUT /api/vendor/products/:id`
- **Payload**: Product fields to update.

### **Delete Product**
- **Endpoint**: `DELETE /api/vendor/products/:id`
- **Response**: Success/Failure.

---

## 4. Orders & Sales

### **List Orders**
- **Endpoint**: `GET /api/vendor/orders`
- **Query Params**: `?page=1&status=pending`
- **Response**:
  ```json
  {
    "orders": [
      {
        "id": 8801,
        "status": "processing",
        "commission_status": "unpaid",
        "earnings": "45.00",
        "total": "50.00",
        "date_created": "...",
        "billing": { ... }
      }
    ]
  }
  ```

---

## 5. Settings / Profile

### **Update Settings**
- **Endpoint**: `PUT /api/vendor/account`
- **Payload**:
  ```json
  {
    "shop_name": "New Store Name",
    "phone": "1234567890",
    "address": { "street_1": "...", "city": "..." },
    "social": { "fb": "...", "twitter": "..." }
  }
  ```

---

## 6. Public Store Page (Preview)

### **View Public Store**
- **Endpoint**: `GET /api/vendor/:id`
- **Response**: Public-facing store details (Banner, Address, Ratings, Name).
