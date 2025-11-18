# 🛡️ Cloudflare + Vercel Setup Guide

## Problem
Cloudflare's security challenge is blocking Vercel from accessing your WordPress API endpoints.

## Solution: Whitelist Vercel IPs in Cloudflare

### Step 1: Get Vercel's IP Ranges

Vercel uses these IP ranges for outbound requests:

```
76.76.21.0/24
76.76.19.0/24
64.252.128.0/18
```

**Note:** Vercel's IPs can change. Check the latest at: https://vercel.com/docs/concepts/edge-network/overview

### Step 2: Create Cloudflare WAF Rule

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain: `shopwice.com`

2. **Navigate to WAF**
   - Click **Security** in the left sidebar
   - Click **WAF** (Web Application Firewall)
   - Click **Custom rules** tab

3. **Create New Rule**
   - Click **Create rule** button
   
4. **Configure Rule:**

   **Rule name:**
   ```
   Allow Vercel API Access
   ```

   **Field:** `IP Source Address`
   
   **Operator:** `is in list`
   
   **Value:** Create an IP list (recommended) or use inline IPs
   
   **Then:** `Skip` → Select:
   - ✅ All remaining custom rules
   - ✅ Rate limiting
   - ✅ Super Bot Fight Mode
   - ✅ Bot Fight Mode
   - ✅ Challenge

5. **Add IP Addresses**

   If using inline (simpler):
   - Click **Edit expression**
   - Use this expression:
   ```
   (ip.src in {76.76.21.0/24 76.76.19.0/24 64.252.128.0/18})
   ```

6. **Save and Deploy**
   - Click **Deploy**

### Step 3: Optional - Restrict to API Paths Only

For extra security, only allow Vercel IPs to access API endpoints:

**Update the expression to:**
```
(ip.src in {76.76.21.0/24 76.76.19.0/24 64.252.128.0/18}) and (http.request.uri.path contains "/wp-json/")
```

This ensures only API requests from Vercel bypass security, not your entire site.

### Step 4: Test the Configuration

1. **Wait 2-3 minutes** for Cloudflare to propagate changes

2. **Test from your local machine:**
   ```bash
   curl -X POST https://shopwice.com/wp-json/jwt-auth/v1/token \
     -H "Content-Type: application/json" \
     -d '{"username":"your_username","password":"your_password"}'
   ```
   
   You should still see the Cloudflare challenge (good - your site is protected)

3. **Test from Vercel:**
   - Redeploy your app: `vercel --prod`
   - Try logging in through your app
   - Check Vercel logs: `vercel logs`

### Step 5: Verify in Cloudflare

1. Go to **Security** → **Events**
2. Look for requests from Vercel IPs
3. They should show **Action: Allow** or **Skip**

---

## Alternative: Create IP List (Recommended for Multiple Rules)

If you plan to use these IPs in multiple rules:

1. **Security** → **WAF** → **Tools**
2. Click **Lists** → **Create new list**
3. **List name:** `Vercel IPs`
4. **Add IPs:**
   ```
   76.76.21.0/24
   76.76.19.0/24
   64.252.128.0/18
   ```
5. **Save**

Then in your WAF rule:
- **Field:** `IP Source Address`
- **Operator:** `is in list`
- **Value:** Select `Vercel IPs`

---

## Troubleshooting

### Still Getting Blocked?

1. **Check Cloudflare Firewall Events:**
   - Security → Events
   - Filter by your domain
   - Look for blocked requests from Vercel IPs

2. **Verify Rule Order:**
   - WAF rules execute in order
   - Make sure "Allow Vercel" is at the **top** of the list
   - Drag to reorder if needed

3. **Check Security Level:**
   - Security → Settings
   - If "Under Attack Mode" is on, it may override rules
   - Set to "High" or "Medium" instead

4. **Verify IP Ranges:**
   - Vercel may have updated their IPs
   - Check: https://vercel.com/docs/concepts/edge-network/overview
   - Update your rule if needed

### Test Specific Endpoint

```bash
# Test JWT endpoint
curl -v https://shopwice.com/wp-json/jwt-auth/v1/token

# Test Dokan endpoint
curl -v https://shopwice.com/wp-json/dokan/v1/stores
```

Look for:
- ❌ `cf-mitigated: challenge` header = Still blocked
- ✅ `200 OK` or `401 Unauthorized` = Working (401 is fine, means API is accessible)

---

## Security Notes

✅ **Pros:**
- Keeps Cloudflare protection for regular visitors
- Only Vercel can access API without challenges
- No subdomain needed
- Free on all Cloudflare plans

⚠️ **Cons:**
- If Vercel changes IPs, you need to update the rule
- Anyone can spoof these IPs if they're on the same network (rare)

---

## Next Steps After Setup

1. ✅ Whitelist Vercel IPs in Cloudflare
2. ✅ Test login from your deployed app
3. ✅ Monitor Cloudflare Events for 24 hours
4. ✅ Update IP list if Vercel changes ranges

---

## Quick Reference

**Vercel IP Ranges:**
```
76.76.21.0/24
76.76.19.0/24
64.252.128.0/18
```

**WAF Rule Expression (API only):**
```
(ip.src in {76.76.21.0/24 76.76.19.0/24 64.252.128.0/18}) and (http.request.uri.path contains "/wp-json/")
```

**WAF Rule Expression (All paths):**
```
(ip.src in {76.76.21.0/24 76.76.19.0/24 64.252.128.0/18})
```

---

Need help? Check Cloudflare Events log to see what's being blocked! 🚀
