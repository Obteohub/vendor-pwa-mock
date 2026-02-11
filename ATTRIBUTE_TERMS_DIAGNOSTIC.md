# Attribute Terms Not Showing - Diagnostic Guide

## Quick Test

1. **Test the API directly**:
   - Open: `http://localhost:3000/api/vendor/attributes/test-terms`
   - This will show if terms are being fetched from WordPress

2. **Check browser console**:
   - Open DevTools (F12)
   - Go to Add Product page
   - Select an attribute
   - Look for logs starting with `[AttributeSelector]`

## Common Issues & Solutions

### Issue 1: Attributes Have No Terms in WooCommerce ⚠️

**Symptom**: API returns empty array `{ terms: [], total: 0 }`

**Cause**: The attributes exist in WooCommerce but have no values/terms configured.

**Solution**:
1. Go to WordPress Admin
2. Navigate to: **Products → Attributes**
3. Click "Configure terms" for each attribute
4. Add values (e.g., for "Color": Red, Blue, Green)

### Issue 2: Authentication Problem 🔐

**Symptom**: Console shows `HTTP 401` or `Authentication required`

**Solution**:
- Make sure you're logged in
- Check if `sw_token` cookie exists (DevTools → Application → Cookies)
- Try logging out and back in

### Issue 3: Middleware/Backend Issue 🔌

**Symptom**: Console shows `HTTP 500` or `Failed to fetch`

**Solution**:
- Check if `NEXT_PUBLIC_MIDDLEWARE_URL` is correct in `.env.local`
- Verify middleware is running and accessible
- Check middleware logs for errors

### Issue 4: CORS or Network Error 🌐

**Symptom**: Console shows `CORS error` or `Network request failed`

**Solution**:
- Check if middleware allows requests from your domain
- Verify User-Agent headers are being sent (already configured in backend-client.js)

## Manual Testing Steps

### Step 1: Test Attributes API
```bash
# In browser console or terminal:
fetch('/api/vendor/attributes')
  .then(r => r.json())
  .then(d => console.log('Attributes:', d))
```

Expected: List of attributes with IDs

### Step 2: Test Terms API
```bash
# Replace 123 with an actual attribute ID from step 1:
fetch('/api/vendor/attributes/123/terms')
  .then(r => r.json())
  .then(d => console.log('Terms:', d))
```

Expected: List of terms/values for that attribute

### Step 3: Check Middleware Direct
```bash
# Test middleware directly (replace with your middleware URL):
curl -H "User-Agent: Mozilla/5.0" \
  https://your-middleware.com/api/attributes/123/terms
```

## What the Logs Should Show

### ✅ Working Correctly:
```
[AttributeSelector] Loading terms for attribute ID: 123
[AttributeSelector] Fetching from: /api/vendor/attributes/123/terms
[AttributeSelector] Response status: 200
[AttributeSelector] Response data: { terms: [...], total: 5 }
[AttributeSelector] ✓ Loaded 5 terms for attribute 123
```

### ❌ No Terms Configured:
```
[AttributeSelector] Loading terms for attribute ID: 123
[AttributeSelector] Response status: 200
[AttributeSelector] Response data: { terms: [], total: 0 }
[AttributeSelector] ⚠️ No terms found for attribute 123
```

### ❌ API Error:
```
[AttributeSelector] Loading terms for attribute ID: 123
[AttributeSelector] Response status: 500
[AttributeSelector] ✗ Failed to load terms
```

## Quick Fixes

### Fix 1: Clear Cache and Reload
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Force Re-sync Attributes
1. Go to Dashboard
2. Click the sync/refresh button
3. Wait for completion
4. Try adding product again

### Fix 3: Check WooCommerce Attribute Configuration

In WordPress Admin:
1. **Products → Attributes**
2. For each attribute, click **"Configure terms"**
3. Add at least one term/value
4. Save

Example for "Color" attribute:
- Red
- Blue
- Green
- Black
- White

Example for "Size" attribute:
- Small
- Medium
- Large
- XL
- XXL

## Still Not Working?

### Enable Full Debug Mode

Add this to `src/components/AttributeSelector.jsx` after line 1:

```javascript
// TEMPORARY DEBUG - Remove after testing
window.DEBUG_ATTRIBUTES = true;
```

Then check console for detailed logs.

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "terms"
3. Select an attribute
4. Check the request/response

Look for:
- Request URL
- Status code
- Response body
- Any error messages

## Expected Behavior

When working correctly:
1. Select a category → attributes filter automatically
2. Click "Add Attribute" → dropdown shows filtered attributes
3. Select an attribute → terms load automatically
4. Checkboxes appear with all available values
5. Select values → they're added to the product

## Need More Help?

Share these details:
1. Console logs (especially `[AttributeSelector]` lines)
2. Network tab screenshot showing the terms request
3. Response from `/api/vendor/attributes/test-terms`
4. Your WooCommerce attribute configuration (screenshot)
