# PWA Resilience & Offline Support

This document explains how the Vendor PWA is designed to work independently of the WooCommerce site and handle errors gracefully.

## Overview

The app implements multiple layers of resilience to ensure it continues working even when the WooCommerce site has issues:

1. **Retry Logic with Exponential Backoff**
2. **Aggressive Caching**
3. **Offline Queue**
4. **Service Worker**
5. **Graceful Degradation**
6. **Connection Status Monitoring**

---

## 1. Retry Logic with Exponential Backoff

### Location
- `src/lib/apiClient.js` - `retryWithBackoff()` and `resilientFetch()`
- `src/app/api/vendor/products/route.js` - Product creation with retry

### How It Works
- Automatically retries failed requests up to 3 times
- Uses exponential backoff: 1s, 2s, 4s delays
- Skips retry for client errors (4xx) except 408, 429
- Includes 30-second timeout per request

### Example
```javascript
import { resilientFetch } from '@/lib/apiClient';

const data = await resilientFetch('/api/vendor/products', {
  method: 'GET'
});
// Automatically retries on network errors or 5xx responses
```

---

## 2. Aggressive Caching

### Location
- `src/lib/apiClient.js` - `CacheManager` class
- `src/app/dashboard/products/add/page.jsx` - Form data caching

### How It Works
- Caches API responses in localStorage
- Default cache lifetime: 5 minutes
- Falls back to stale cache if server is unreachable
- Automatically clears oldest cache when storage is full

### Cache Strategy
- **GET requests**: Cache first, network fallback
- **API failures**: Use stale cache (any age)
- **Offline**: Always use cache

### Example
```javascript
import { fetchWithCache } from '@/lib/apiClient';

const data = await fetchWithCache('/api/vendor/categories', {}, {
  cacheKey: 'categories',
  maxAge: 5 * 60 * 1000, // 5 minutes
  fallbackToCache: true  // Use stale cache on error
});
```

---

## 3. Offline Queue

### Location
- `src/lib/apiClient.js` - `OfflineQueue` class
- `src/app/dashboard/products/add/page.jsx` - Form submission

### How It Works
- Queues POST/PUT/DELETE requests when offline
- Automatically processes queue when connection returns
- Stores queue in localStorage (persists across sessions)
- Shows queue count in UI

### User Experience
1. User submits form while offline
2. Request is queued with success message
3. When online, queue auto-processes
4. User sees sync notification

### Example
```javascript
import { offlineQueue } from '@/lib/apiClient';

// Queue a request
offlineQueue.add({
  url: '/api/vendor/products',
  options: { method: 'POST', body: formData }
});

// Process queue manually
await offlineQueue.processAll();
```

---

## 4. Service Worker

### Location
- `public/sw.js` - Service worker implementation
- `src/app/dashboard/layout.jsx` - Registration

### How It Works
- Caches static assets (pages, scripts, styles)
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Serves offline page when navigation fails

### Cached Assets
- Dashboard pages
- Product list/add/edit pages
- Offline fallback page

### Cache Strategy
```
API Requests:
  Network → Success → Cache → Return
  Network → Fail → Cache → Return cached

Static Assets:
  Cache → Return (+ background update)
  Cache Miss → Network → Cache → Return
```

---

## 5. Graceful Degradation

### Location
- All API routes (`src/app/api/vendor/*`)
- Form components

### How It Works
- Returns empty arrays instead of errors for non-critical data
- Form loads even if categories/brands fail
- Shows warnings but doesn't block functionality
- Provides helpful error messages with suggestions

### Example Scenarios

#### Scenario 1: Categories API Fails
```javascript
// Instead of breaking the form:
return NextResponse.json({
  categories: [],
  error: 'Failed to fetch categories',
  fallback: true,
  message: 'Form will work without categories'
}, { status: 200 }); // 200 so app doesn't break
```

#### Scenario 2: WooCommerce Site Down
- Form loads with cached data
- User can fill out product details
- Submission is queued for later
- User continues working

---

## 6. Connection Status Monitoring

### Location
- `src/components/ConnectionStatus.jsx`
- `src/app/dashboard/layout.jsx`

### Features
- Real-time online/offline detection
- Visual indicators (banner, floating badge)
- Queue count display
- Manual sync button
- Sync result notifications

### UI Elements
1. **Top Banner**: Shows connection status
2. **Floating Badge**: Persistent offline indicator
3. **Sync Button**: Manual queue processing
4. **Notifications**: Sync results

---

## Error Handling Best Practices

### 1. Always Provide Context
```javascript
return NextResponse.json({
  error: 'Product creation failed',
  details: errorData,
  retryable: true,
  suggestion: 'Check your WooCommerce connection'
}, { status: 503 });
```

### 2. Distinguish Error Types
- **Client errors (4xx)**: Don't retry, show specific message
- **Server errors (5xx)**: Retry with backoff
- **Network errors**: Use cache, queue if mutation
- **Timeout errors**: Retry with longer timeout

### 3. Fallback Hierarchy
```
1. Fresh data from server
2. Cached data (recent)
3. Stale cached data (any age)
4. Empty array / default values
5. Error message (last resort)
```

---

## Configuration

### Cache Settings
```javascript
// src/lib/apiClient.js
const cacheExpiry = 5 * 60 * 1000; // 5 minutes
```

### Retry Settings
```javascript
// src/lib/apiClient.js
const maxRetries = 3;
const initialDelay = 1000; // 1 second
```

### Timeout Settings
```javascript
// src/lib/apiClient.js
const timeout = 30000; // 30 seconds
```

---

## Testing Offline Functionality

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Test form submission → Should queue
5. Select "Online" → Should auto-sync

### Service Worker
1. Open DevTools → Application tab
2. Service Workers section
3. Check "Offline" checkbox
4. Test navigation → Should show offline page

### Cache Inspection
1. DevTools → Application tab
2. Storage → Local Storage
3. Look for:
   - `api_cache_*` - API response cache
   - `offline_queue` - Queued requests
   - `product_form_data` - Form data cache

---

## Monitoring & Debugging

### Console Logs
```javascript
// Retry attempts
"Retry attempt 1/3 after 1000ms"

// Cache usage
"Using cached data for: /api/vendor/categories"
"Using stale cache due to error: Network error"

// Queue operations
"Queueing request for later: /api/vendor/products"
"Processed 2/3 queued requests"
```

### Network Tab
- Failed requests show retry attempts
- Cached responses marked with "(from cache)"
- Service worker responses marked with "ServiceWorker"

---

## Benefits

### For Users
- ✅ App works even when WooCommerce is down
- ✅ No data loss when offline
- ✅ Faster load times (caching)
- ✅ Clear feedback on connection status
- ✅ Automatic sync when back online

### For Developers
- ✅ Reduced support tickets
- ✅ Better error visibility
- ✅ Easier debugging
- ✅ Graceful failure handling
- ✅ Improved user experience

---

## Future Enhancements

1. **IndexedDB Storage**: For larger data sets
2. **Background Sync API**: Better queue processing
3. **Push Notifications**: Sync completion alerts
4. **Conflict Resolution**: Handle concurrent edits
5. **Partial Sync**: Sync individual items
6. **Retry Strategies**: Per-endpoint configuration

---

## Troubleshooting

### Issue: Queue Not Processing
**Solution**: Check browser console for errors, manually trigger sync

### Issue: Stale Data Showing
**Solution**: Clear cache via DevTools or add cache-busting

### Issue: Service Worker Not Updating
**Solution**: Unregister old worker, hard refresh (Ctrl+Shift+R)

### Issue: localStorage Full
**Solution**: Cache manager auto-clears oldest 25%

---

## Summary

This PWA is designed to be **resilient, reliable, and user-friendly** even when the WooCommerce backend has issues. The multi-layered approach ensures:

1. **Network issues** → Retry with backoff
2. **Server errors** → Use cached data
3. **Offline** → Queue operations
4. **Data unavailable** → Graceful degradation
5. **Connection restored** → Auto-sync

The app prioritizes **user experience** over strict data consistency, allowing vendors to continue working regardless of backend status.
