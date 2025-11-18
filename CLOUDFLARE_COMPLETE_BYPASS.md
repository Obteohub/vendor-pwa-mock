# 🚨 COMPLETE Cloudflare Bypass Guide

## Current Status
Still getting: `"cf-mitigated": "challenge"` and "Just a moment..."

This means Cloudflare rules aren't working. Let's try ALL methods:

---

## Method 1: Turn Off "I'm Under Attack Mode" (FASTEST - 30 seconds)

This is likely the issue. "Under Attack Mode" overrides all other rules.

1. **Cloudflare Dashboard** → `shopwice.com`
2. **Overview** page (first page you see)
3. **Look for:** "Under Attack Mode" toggle or banner
4. **Turn it OFF** if it's on
5. **OR go to:** Security → Settings → Security Level
6. **Change from:** "I'm Under Attack" → **"Medium"** or **"High"**

**Test immediately after changing.**

---

## Method 2: Disable Bot Fight Mode (2 minutes)

Bot Fight Mode can block API requests:

1. **Security** → **Bots**
2. **Bot Fight Mode:** Turn **OFF**
3. **Super Bot Fight Mode:** Turn **OFF** (if you have it)

---

## Method 3: Create WAF Skip Rule (5 minutes)

This is the most powerful method:

1. **Security** → **WAF** → **Custom rules**
2. **Create rule**
3. **Rule name:** `Allow API - Skip All Security`

4. **Field:** `URI Path`
5. **Operator:** `contains`
6. **Value:** `/wp-json/`

7. **Then:** Select **"Skip"**
8. **Check ALL these boxes:**
   - ✅ All remaining custom rules
   - ✅ Rate limiting  
   - ✅ Super Bot Fight Mode
   - ✅ Bot Fight Mode
   - ✅ Challenge (Managed)
   - ✅ Challenge (Legacy)
   - ✅ All other options

9. **Deploy**

10. **IMPORTANT:** Drag this rule to the **TOP** of the list

---

## Method 4: Disable Cloudflare Proxy Temporarily (NUCLEAR OPTION)

If nothing else works, temporarily disable Cloudflare for testing:

1. **DNS** → **Records**
2. **Find:** `shopwice.com` A record
3. **Click the orange cloud** 🟠 to make it **gray** ☁️ (DNS only)
4. **Wait 2 minutes**
5. **Test login**

**⚠️ This disables ALL Cloudflare protection temporarily**

After confirming it works:
- Turn proxy back on (orange cloud)
- Then fix the WAF rules properly

---

## Method 5: Add IP Allowlist (If you know Vercel's current IP)

1. **Security** → **WAF** → **Tools** → **IP Access Rules**
2. **Add rule:**
   - **Value:** Get from Vercel logs or test endpoint
   - **Action:** Allow
   - **Zone:** This website

---

## Method 6: Disable All Security Features (TEMPORARY TEST)

To isolate the issue:

1. **Security** → **Settings**
2. **Security Level:** Essentially Off
3. **Challenge Passage:** 1 year
4. **Browser Integrity Check:** Off
5. **Privacy Pass Support:** Off

**Test, then re-enable after confirming it works**

---

## Method 7: Check for Firewall Rules

1. **Security** → **WAF** → **Firewall rules** (old interface)
2. **Look for rules blocking API**
3. **Disable or delete** any rules that might block `/wp-json/`

---

## Method 8: Check Rate Limiting

1. **Security** → **WAF** → **Rate limiting rules**
2. **Disable** any rules that might affect API endpoints

---

## Diagnostic: Find What's Blocking

### Check Cloudflare Firewall Events

1. **Security** → **Events**
2. **Filter by:** Last 30 minutes
3. **Look for:** Requests to `/wp-json/`
4. **Check:** What rule is blocking them

This will tell you EXACTLY what's blocking the requests.

---

## Quick Test After Each Method

```bash
# Should return JSON, not HTML
curl https://shopwice.com/wp-json/

# Test JWT endpoint
curl https://shopwice.com/wp-json/jwt-auth/v1/token

# Check for Cloudflare challenge
curl -v https://shopwice.com/wp-json/ 2>&1 | grep -i "cf-mitigated"
```

**Or use the diagnostic endpoint:**
```
https://vendor-pwa-mock.vercel.app/api/test-connection
```

Look for:
- ✅ `"status": 200` or `404` = Working!
- ✅ `"contentType": "application/json"` = Working!
- ❌ `"cf-mitigated": "challenge"` = Still blocked
- ❌ `"isHTML": true` = Still blocked

---

## Recommended Order

Try these in order (fastest to slowest):

1. ✅ **Turn off "Under Attack Mode"** (30 sec) - Most likely cause
2. ✅ **Disable Bot Fight Mode** (1 min)
3. ✅ **Check Firewall Events** (2 min) - See what's blocking
4. ✅ **Create WAF Skip Rule** (5 min) - Most powerful
5. ✅ **Disable proxy temporarily** (2 min) - Nuclear option for testing
6. ✅ **Re-enable proxy + fix rules** (5 min)

---

## After It Works

Once you confirm login works:

1. **Re-enable security features** one by one
2. **Keep the WAF Skip rule** for `/wp-json/`
3. **Monitor Firewall Events** for 24 hours
4. **Adjust rules** as needed

---

## Still Not Working?

### Share These Details:

1. **Cloudflare plan:** Free / Pro / Business / Enterprise
2. **Security Level:** Current setting
3. **Under Attack Mode:** On or Off
4. **Bot Fight Mode:** On or Off
5. **Firewall Events:** Screenshot of blocked requests
6. **WAF Rules:** List of active rules

### Or Try Alternative:

If Cloudflare is too restrictive, consider:
- Moving WordPress to a different server without Cloudflare
- Using Cloudflare only for static assets
- Using a different CDN/security service

---

## Nuclear Option: Disable Cloudflare Entirely for Testing

If you need to test urgently:

1. **DNS** → **Records**
2. **Change all records to DNS only** (gray cloud)
3. **Wait 5 minutes**
4. **Test login**
5. **Confirm it works**
6. **Then re-enable Cloudflare** and fix rules properly

This proves whether Cloudflare is the issue or if there's another problem.

---

## Expected Working Response

When it's working, you should see:

```json
{
  "test": "JWT Endpoint Test",
  "url": "https://shopwice.com/wp-json/jwt-auth/v1/token",
  "status": 200,
  "contentType": "application/json",
  "headers": {
    "content-type": "application/json"
  },
  "bodyPreview": {
    "code": "rest_no_route",
    "message": "No route was found matching the URL and request method"
  }
}
```

Or with POST:
```json
{
  "code": "invalid_username",
  "message": "Unknown username"
}
```

**Key indicators:**
- ✅ No `"cf-mitigated"` header
- ✅ `"contentType": "application/json"`
- ✅ No HTML in response
- ✅ Status 200, 404, or 401 (not 403)

---

Start with Method 1 (Under Attack Mode) - that's the most common cause! 🚀
