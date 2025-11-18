# Quick Start: Testing Resilience Features

## 1. Start Your App

```bash
npm run dev
```

## 2. Open Debug Panel

1. Navigate to `/dashboard/products/add`
2. Look for purple **Activity** button (bottom right)
3. Click to open Resilience Debug Panel
4. You'll see:
   - Connection status (Online/Offline)
   - Cache size
   - Queue size
   - Cached items list
   - Queued operations

## 3. Test Offline Mode

### Method 1: Chrome DevTools
1. Press `F12` to open DevTools
2. Go to **Network** tab
3. Select **Offline** from throttling dropdown
4. Try to submit a product form
5. ✅ Should queue the operation
6. Select **Online** again
7. ✅ Should auto-sync

### Method 2: Debug Panel
1. Open Debug Panel
2. Turn off your WiFi/disconnect internet
3. Watch status change to "Offline"
4. Submit a product
5. Check "Queued Operations" section
6. Reconnect internet
7. Click "Sync Now" or wait for auto-sync

## 4. Test Cache

### View Cached Data
1. Open Debug Panel
2. Load the product form (fetches categories, brands, etc.)
3. Check "Cached Items" section
4. You'll see:
   - `categories_page_1`
   - `brands`
   - `attributes_page_1`
   - `locations_page_1`
5. Each shows age and size

### Test Cache Fallback
1. Load form normally (online)
2. Go offline
3. Refresh page
4. ✅ Form should load with cached data
5. Debug panel shows cache being used

### Clear Cache
1. Open Debug Panel
2. Click "Clear Cache"
3. Refresh page while offline
4. ❌ Form won't load (no cache)
5. Go online and refresh
6. ✅ Fetches fresh data

## 5. Test Retry Logic

### Simulate Server Error
1. Stop your WooCommerce site temporarily
2. Try to submit a product
3. Watch browser console
4. You'll see:
   ```
   Attempt 1/3 failed: ...
   Retrying in 1000ms...
   Attempt 2/3 failed: ...
   Retrying in 2000ms...
   Attempt 3/3 failed: ...
   ```
5. After 3 attempts, shows error message

### Simulate Slow Network
1. DevTools → Network → Select "Slow 3G"
2. Submit product
3. Request will retry if it times out (30s)
4. Shows helpful timeout message

## 6. Test Service Worker

### Check Registration
1. DevTools → Application tab
2. Service Workers section
3. Should see `/sw.js` registered
4. Status: "activated and is running"

### Test Offline Page
1. DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Navigate to a new page
4. ✅ Should show beautiful offline page
5. Uncheck "Offline"
6. Click "Try Again"
7. ✅ Page loads normally

### Inspect Cache
1. DevTools → Application → Cache Storage
2. You'll see:
   - `vendor-pwa-v1` (static assets)
   - `runtime-cache-v1` (API responses)
3. Click to view cached files

## 7. Monitor Connection Status

### Top Banner
- Shows when connection changes
- Green = Online
- Red = Offline
- Shows queue count
- "Sync Now" button when online

### Floating Badge
- Bottom right corner
- Only shows when offline
- Shows queue count
- Persistent reminder

### Sync Notifications
- Appears after sync completes
- Shows success count
- Auto-dismisses after 5 seconds

## 8. Real-World Scenarios

### Scenario 1: Vendor on Train
1. Start filling product form
2. Train enters tunnel (offline)
3. Continue filling form
4. Submit → Queued
5. Train exits tunnel (online)
6. Auto-syncs → Product created

### Scenario 2: WooCommerce Site Down
1. Try to load form
2. Categories API fails
3. ✅ Form loads with cached categories
4. Warning message shown
5. Can still submit products
6. Queued until site is back

### Scenario 3: Slow Connection
1. Submit product on slow network
2. Request times out
3. Automatically retries
4. Eventually succeeds or queues

## 9. Console Monitoring

Open browser console to see:

```javascript
// Cache usage
"Using cached data for: /api/vendor/categories"
"Using stale cache due to error: Network error"

// Retry attempts
"Retry attempt 1/3 after 1000ms"
"Retry attempt 2/3 after 2000ms"

// Queue operations
"Queueing request for later: /api/vendor/products"
"Connection restored. Processing queued requests..."
"Processed 2/3 queued requests"

// Service Worker
"Service Worker registered"
"Serving API from cache: /api/vendor/brands"
```

## 10. Troubleshooting

### Queue Not Processing
**Check:**
- Browser console for errors
- Network tab for failed requests
- Debug panel queue section

**Fix:**
- Click "Sync Now" in debug panel
- Or wait for auto-sync on reconnect

### Stale Data Showing
**Check:**
- Debug panel cache age
- Cache expiry setting (5 minutes default)

**Fix:**
- Click "Clear Cache" in debug panel
- Or wait for cache to expire

### Service Worker Issues
**Check:**
- DevTools → Application → Service Workers
- Look for errors

**Fix:**
- Unregister service worker
- Hard refresh (Ctrl+Shift+R)
- Re-register

## 11. Performance Testing

### Measure Cache Impact
1. Clear cache
2. Load form → Note time
3. Reload form → Note time (should be faster)
4. Go offline → Reload → Still works!

### Measure Retry Impact
1. Simulate intermittent connection
2. Submit product
3. Watch retry attempts
4. Eventually succeeds

## 12. Production Checklist

Before deploying:

- [ ] Test offline mode thoroughly
- [ ] Verify cache expiry times
- [ ] Test queue processing
- [ ] Check service worker registration
- [ ] Test on mobile devices
- [ ] Test on slow networks
- [ ] Verify error messages are helpful
- [ ] Test with real WooCommerce site
- [ ] Monitor console for errors
- [ ] Test cache cleanup

## 13. Configuration

Adjust settings in `src/lib/apiClient.js`:

```javascript
// Cache expiry (default: 5 minutes)
const cacheExpiry = 5 * 60 * 1000;

// Retry attempts (default: 3)
const maxRetries = 3;

// Initial retry delay (default: 1 second)
const initialDelay = 1000;

// Request timeout (default: 30 seconds)
const timeout = 30000;
```

## 14. Debug Panel Features

### Stats Display
- Online/Offline status
- Cache item count
- Queue size
- Auto-sync status

### Actions
- **Clear Cache**: Remove all cached data
- **Clear Queue**: Remove pending operations
- **Sync Now**: Manually process queue

### Cache Items
- Shows all cached API responses
- Displays age and size
- Auto-updates every 2 seconds

### Queue Items
- Shows pending operations
- Displays method and URL
- Shows how long queued

## Summary

Your PWA now has **enterprise-grade resilience**:

✅ Works offline  
✅ Automatic retries  
✅ Smart caching  
✅ Queue management  
✅ Real-time monitoring  
✅ Graceful degradation  

Test it thoroughly and adjust settings as needed!
