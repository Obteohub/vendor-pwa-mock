# Resilience System Maintenance Guide

## Regular Maintenance Tasks

### Weekly
- [ ] Check browser console for errors
- [ ] Monitor cache hit rates
- [ ] Review queue processing success rates
- [ ] Test offline functionality

### Monthly
- [ ] Review and adjust cache expiry times
- [ ] Analyze retry patterns
- [ ] Check localStorage usage
- [ ] Update service worker version if needed

### Quarterly
- [ ] Performance audit
- [ ] User feedback review
- [ ] Update documentation
- [ ] Review error logs

---

## Monitoring

### Key Metrics to Track

1. **Cache Hit Rate**
   - Target: > 70%
   - Location: Browser console logs
   - Action: If low, increase cache expiry

2. **Retry Success Rate**
   - Target: > 80% success after retries
   - Location: Server logs
   - Action: If low, investigate server issues

3. **Queue Processing Rate**
   - Target: > 95% successful sync
   - Location: Debug panel
   - Action: If low, check network stability

4. **Average Response Time**
   - Target: < 2 seconds
   - Location: Network tab
   - Action: If high, optimize API or increase cache

### Console Monitoring

Watch for these patterns:

```javascript
// Good patterns
"Using cached data for: /api/vendor/categories"
"Processed 5/5 queued requests"
"Service Worker registered"

// Warning patterns
"Using stale cache due to error: ..."
"Retry attempt 3/3 failed"
"Cache write failed after cleanup"

// Error patterns
"All retry attempts failed"
"Failed to register service worker"
"localStorage quota exceeded"
```

---

## Common Issues & Solutions

### Issue 1: Cache Growing Too Large

**Symptoms:**
- localStorage quota errors
- Slow page loads
- Cache write failures

**Solutions:**
```javascript
// Option 1: Reduce cache expiry
const cacheExpiry = 3 * 60 * 1000; // 3 minutes instead of 5

// Option 2: Limit cache size
const MAX_CACHE_ITEMS = 50;

// Option 3: Clear old cache more aggressively
cache.clearOldest(); // Remove 50% instead of 25%
```

### Issue 2: Queue Not Processing

**Symptoms:**
- Queued items not syncing
- "Sync failed" notifications
- Growing queue size

**Solutions:**
1. Check network connectivity
2. Verify API endpoints are accessible
3. Check authentication tokens
4. Manually trigger sync from debug panel
5. Clear and retry:
   ```javascript
   offlineQueue.clear();
   // Re-submit operations
   ```

### Issue 3: Stale Data Showing

**Symptoms:**
- Old data displayed
- Changes not reflected
- Cache age > 5 minutes

**Solutions:**
```javascript
// Option 1: Force refresh
fetchWithCache(url, {}, { forceRefresh: true });

// Option 2: Clear specific cache
cache.delete('categories');

// Option 3: Clear all cache
cache.clearAll();
```

### Issue 4: Service Worker Not Updating

**Symptoms:**
- Old version running
- Changes not reflected
- Update notification not showing

**Solutions:**
1. Increment cache version in `sw.js`:
   ```javascript
   const CACHE_NAME = 'vendor-pwa-v2'; // was v1
   ```

2. Force update:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   ```

3. Hard refresh: `Ctrl+Shift+R`

### Issue 5: Retry Loop

**Symptoms:**
- Infinite retry attempts
- High network usage
- Slow performance

**Solutions:**
```javascript
// Add max retry limit
const MAX_RETRIES = 3;

// Add circuit breaker
let failureCount = 0;
if (failureCount > 10) {
  // Stop retrying, show error
}

// Increase backoff delay
const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
```

---

## Performance Optimization

### 1. Cache Strategy Tuning

```javascript
// High-traffic endpoints: Longer cache
fetchWithCache('/api/vendor/categories', {}, {
  maxAge: 10 * 60 * 1000 // 10 minutes
});

// Frequently changing data: Shorter cache
fetchWithCache('/api/vendor/products', {}, {
  maxAge: 2 * 60 * 1000 // 2 minutes
});

// Static data: Very long cache
fetchWithCache('/api/vendor/attributes', {}, {
  maxAge: 30 * 60 * 1000 // 30 minutes
});
```

### 2. Lazy Loading

```javascript
// Load critical data first
await Promise.all([
  fetchCategories(),
  fetchBrands()
]);

// Load non-critical data in background
setTimeout(() => {
  fetchAttributes();
  fetchLocations();
}, 1000);
```

### 3. Batch Requests

```javascript
// Instead of multiple requests
const categories = await fetch('/api/vendor/categories');
const brands = await fetch('/api/vendor/brands');

// Use single batch endpoint
const data = await fetch('/api/vendor/batch?include=categories,brands');
```

### 4. Compression

```javascript
// Enable compression in API responses
// Add to API route:
headers: {
  'Content-Encoding': 'gzip'
}
```

---

## Security Considerations

### 1. Cache Sensitive Data

```javascript
// Don't cache sensitive data
if (url.includes('/api/auth/') || url.includes('/api/payment/')) {
  return fetch(url); // Skip cache
}
```

### 2. Token Expiry

```javascript
// Check token expiry before using cache
const tokenExpiry = getTokenExpiry();
if (Date.now() > tokenExpiry) {
  cache.clearAll(); // Clear cache on logout
}
```

### 3. Queue Security

```javascript
// Don't queue sensitive operations
if (url.includes('/api/payment/')) {
  throw new Error('Cannot queue payment operations');
}
```

---

## Debugging Tools

### 1. Enable Verbose Logging

```javascript
// Add to apiClient.js
const DEBUG = true;

if (DEBUG) {
  console.log('[Cache] Hit:', key);
  console.log('[Retry] Attempt:', attempt);
  console.log('[Queue] Added:', url);
}
```

### 2. Network Simulation

```javascript
// Simulate slow network
await new Promise(resolve => setTimeout(resolve, 3000));

// Simulate offline
if (Math.random() < 0.3) {
  throw new Error('Network error');
}

// Simulate server error
if (Math.random() < 0.2) {
  return { status: 500 };
}
```

### 3. Cache Inspector

```javascript
// Add to debug panel
function inspectCache() {
  const keys = Object.keys(localStorage);
  const cacheData = keys
    .filter(k => k.startsWith('api_cache_'))
    .map(k => {
      const data = JSON.parse(localStorage.getItem(k));
      return {
        key: k,
        age: Date.now() - data.timestamp,
        size: JSON.stringify(data).length
      };
    });
  console.table(cacheData);
}
```

---

## Testing Checklist

### Unit Tests

```javascript
// Test retry logic
test('retries 3 times on failure', async () => {
  let attempts = 0;
  const fn = () => {
    attempts++;
    if (attempts < 3) throw new Error('Fail');
    return 'Success';
  };
  
  const result = await retryWithBackoff(fn);
  expect(attempts).toBe(3);
  expect(result).toBe('Success');
});

// Test cache expiry
test('returns null for expired cache', () => {
  cache.set('test', 'data');
  // Fast-forward time
  jest.advanceTimersByTime(6 * 60 * 1000);
  expect(cache.get('test')).toBeNull();
});

// Test queue processing
test('processes all queued items', async () => {
  offlineQueue.add({ url: '/test1' });
  offlineQueue.add({ url: '/test2' });
  
  const results = await offlineQueue.processAll();
  expect(results.length).toBe(2);
});
```

### Integration Tests

```javascript
// Test offline flow
test('queues request when offline', async () => {
  // Simulate offline
  Object.defineProperty(navigator, 'onLine', { value: false });
  
  await submitProduct(formData);
  
  const queue = offlineQueue.getAll();
  expect(queue.length).toBe(1);
});

// Test cache fallback
test('uses cache when API fails', async () => {
  // Cache data
  cache.set('categories', mockCategories);
  
  // Simulate API failure
  fetch.mockRejectedValue(new Error('Network error'));
  
  const data = await fetchWithCache('/api/vendor/categories');
  expect(data).toEqual(mockCategories);
});
```

### E2E Tests

```javascript
// Test complete offline workflow
test('complete offline workflow', async () => {
  // 1. Load form online
  await page.goto('/dashboard/products/add');
  await page.waitForSelector('form');
  
  // 2. Go offline
  await page.setOfflineMode(true);
  
  // 3. Fill and submit form
  await page.fill('[name="name"]', 'Test Product');
  await page.click('button[type="submit"]');
  
  // 4. Verify queued
  const queueSize = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('offline_queue')).length;
  });
  expect(queueSize).toBe(1);
  
  // 5. Go online
  await page.setOfflineMode(false);
  
  // 6. Wait for sync
  await page.waitForSelector('.sync-notification');
  
  // 7. Verify product created
  await page.goto('/dashboard/products');
  await expect(page.locator('text=Test Product')).toBeVisible();
});
```

---

## Upgrade Path

### Version 1.0 → 2.0

**New Features:**
- IndexedDB for larger storage
- Background Sync API
- Push notifications

**Migration Steps:**

1. **Add IndexedDB support:**
```javascript
// Install Dexie.js
npm install dexie

// Create database
import Dexie from 'dexie';

const db = new Dexie('VendorPWA');
db.version(1).stores({
  cache: 'key, data, timestamp',
  queue: '++id, url, options, timestamp'
});
```

2. **Migrate localStorage to IndexedDB:**
```javascript
async function migrateToIndexedDB() {
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (key.startsWith('api_cache_')) {
      const data = JSON.parse(localStorage.getItem(key));
      await db.cache.add({
        key: key.replace('api_cache_', ''),
        data: data.data,
        timestamp: data.timestamp
      });
      localStorage.removeItem(key);
    }
  }
}
```

3. **Add Background Sync:**
```javascript
// Register sync
if ('sync' in registration) {
  await registration.sync.register('sync-queue');
}

// Handle sync event in service worker
self.addEventListener('sync', event => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(processQueue());
  }
});
```

---

## Best Practices

### 1. Always Provide Feedback

```javascript
// Bad
await submitProduct(data);

// Good
setStatus('Submitting...');
try {
  await submitProduct(data);
  setStatus('Success!');
} catch (error) {
  if (error.isQueued) {
    setStatus('Queued for later');
  } else {
    setStatus('Error: ' + error.message);
  }
}
```

### 2. Graceful Degradation

```javascript
// Bad
const categories = await fetchCategories();
// Breaks if API fails

// Good
const categories = await fetchCategories().catch(() => []);
// Returns empty array, form still works
```

### 3. Clear Error Messages

```javascript
// Bad
throw new Error('Failed');

// Good
throw new Error(
  'Failed to create product. ' +
  'The WooCommerce server is not responding. ' +
  'Please check your connection and try again.'
);
```

### 4. Log Everything

```javascript
console.log('[Cache] Hit:', key);
console.log('[Retry] Attempt:', attempt, 'of', maxRetries);
console.log('[Queue] Added:', url);
console.log('[Sync] Processed:', successful, 'of', total);
```

### 5. Test Edge Cases

- Slow network (3G)
- Intermittent connection
- Server timeout
- Invalid responses
- localStorage full
- Service worker disabled

---

## Support & Troubleshooting

### User Reports Issue

1. **Gather Information:**
   - Browser and version
   - Network conditions
   - Console errors
   - Debug panel screenshot

2. **Check Common Causes:**
   - Cache corruption → Clear cache
   - Queue stuck → Manual sync
   - Service worker issue → Unregister and refresh

3. **Reproduce:**
   - Use same browser
   - Simulate network conditions
   - Check console logs

4. **Fix and Deploy:**
   - Update code
   - Increment service worker version
   - Test thoroughly
   - Deploy

### Emergency Fixes

**Clear All User Data:**
```javascript
// Add to debug panel
function emergencyReset() {
  localStorage.clear();
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  location.reload();
}
```

---

## Summary

Maintaining the resilience system requires:

✅ Regular monitoring  
✅ Performance optimization  
✅ Security awareness  
✅ Thorough testing  
✅ Clear documentation  
✅ User feedback  

Follow this guide to keep your PWA running smoothly!
