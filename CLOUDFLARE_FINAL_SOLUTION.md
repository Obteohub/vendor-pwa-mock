# ✅ Final Solution: Keep Bot Fight Mode, Skip for API Only

## The Goal

- ✅ Keep Bot Fight Mode ON for website protection
- ✅ Skip Bot Fight Mode ONLY for `/wp-json/*` (API endpoints)
- ✅ Allow Vercel to access API without challenges

---

## Solution: WAF Custom Rule with Skip Action

### Step 1: Re-enable Bot Fight Mode

1. **Cloudflare Dashboard** → `shopwice.com`
2. **Security** → **Bots**
3. **Bot Fight Mode:** Turn **ON**

### Step 2: Create WAF Skip Rule

1. **Security** → **WAF** → **Custom rules**
2. **Create rule**

3. **Rule configuration:**

   **Rule name:**
   ```
   Skip Bot Fight for API
   ```

   **When incoming requests match:**
   - Click **"Edit expression"**
   - Enter this EXACT expression:
   ```
   (http.request.uri.path contains "/wp-json/")
   ```

   **Then:**
   - Select **"Skip"**
   
   **Skip the following (CHECK ALL):**
   - ✅ All remaining custom rules
   - ✅ Rate limiting
   - ✅ Super Bot Fight Mode
   - ✅ Bot Fight Mode
   - ✅ Challenge (Managed)
   - ✅ Challenge (Legacy)
   - ✅ All other available options

4. **Deploy**

### Step 3: CRITICAL - Move Rule to TOP

After creating the rule:
1. **Go back to Custom rules list**
2. **Find your "Skip Bot Fight for API" rule**
3. **Drag it to the TOP** of the list (position #1)
4. Rules execute in order - this MUST be first!

### Step 4: Verify Rule is Active

Check:
- ✅ Status shows **"Active"** (not Paused)
- ✅ Position is **#1** (top of list)
- ✅ Expression is correct: `(http.request.uri.path contains "/wp-json/")`

### Step 5: Purge Cache

1. **Caching** → **Configuration**
2. **Purge Everything**
3. Wait 1 minute

### Step 6: Test

```
https://vendor-pwa-mock.vercel.app/api/test-connection
```

**Expected:**
- ✅ No `"cf-mitigated"` header
- ✅ JSON response
- ✅ Status 200 or 404

---

## If WAF Skip Rule Still Doesn't Work

### Alternative 1: Use Expression Builder (Not Edit Expression)

Instead of "Edit expression", try the visual builder:

1. **When incoming requests match:**
   - **Field:** `URI Path`
   - **Operator:** `contains`
   - **Value:** `/wp-json/`

2. **Then:** Skip → Check all boxes

### Alternative 2: Use Multiple Conditions

Try a more specific expression:

```
(http.request.uri.path contains "/wp-json/jwt-auth/") or (http.request.uri.path contains "/wp-json/dokan/")
```

### Alternative 3: Use IP-based Skip

Skip Bot Fight Mode for Vercel IPs only:

```
(ip.src in {76.76.21.0/24 76.76.19.0/24 64.252.128.0/18}) and (http.request.uri.path contains "/wp-json/")
```

---

## Why This is Secure

✅ **Bot Fight Mode stays ON** for your entire website
✅ **Only `/wp-json/*` paths** skip bot protection
✅ **WordPress admin** (`/wp-admin/`) still protected
✅ **Login pages** still protected
✅ **Main site** still protected
✅ **API endpoints** are public anyway (require authentication)

---

## Monitor After Setup

### Check Firewall Events

1. **Security** → **Events**
2. **Filter:** Last 24 hours
3. **Look for:**
   - ✅ `/wp-json/` requests should show "Skip" action
   - ✅ Other requests should show "Challenge" or "Block" if bots

### Test Both Scenarios

**API should work:**
```bash
curl https://shopwice.com/wp-json/
# Should return JSON
```

**Main site should still be protected:**
```bash
curl -A "BadBot" https://shopwice.com/
# Should return challenge or block
```

---

## Troubleshooting

### Rule Not Working?

1. **Check rule order** - Must be #1 (top)
2. **Check rule status** - Must be "Active"
3. **Check expression** - Must match exactly
4. **Purge cache** - Wait 2 minutes after purging
5. **Check Firewall Events** - See if rule is executing

### Still Getting Challenged?

Check if there's another rule blocking:

1. **Security** → **WAF** → **Managed rules**
2. **Disable temporarily** to test
3. If that fixes it, re-enable and add exception

### Cloudflare Plan Limitations

**Free Plan:**
- ✅ Can create 5 custom rules
- ✅ Skip action available
- ✅ Should work fine

**If you hit limits:**
- Delete unused rules
- Or upgrade to Pro plan

---

## Complete Setup Checklist

- [ ] Bot Fight Mode: ON
- [ ] WAF Custom Rule created: "Skip Bot Fight for API"
- [ ] Expression: `(http.request.uri.path contains "/wp-json/")`
- [ ] Action: Skip (all options checked)
- [ ] Rule position: #1 (top of list)
- [ ] Rule status: Active
- [ ] Cache purged
- [ ] Tested: `/api/test-connection` returns JSON
- [ ] Tested: Login works
- [ ] Monitored: Firewall Events show "Skip" for API

---

## Final Test

After setup, test everything:

1. **API Access:**
   ```
   https://vendor-pwa-mock.vercel.app/api/test-connection
   ```
   Should return JSON ✅

2. **Login:**
   ```
   https://vendor-pwa-mock.vercel.app
   ```
   Should be able to login ✅

3. **Bot Protection:**
   Main site should still challenge suspicious traffic ✅

---

## Summary

**What we did:**
1. ✅ Fixed nginx to allow Vercel IPs
2. ✅ Created WAF rule to skip Bot Fight Mode for `/wp-json/`
3. ✅ Kept Bot Fight Mode ON for rest of site
4. ✅ API accessible, site still protected

**Result:**
- Vendor dashboard works
- WordPress API accessible from Vercel
- Main site still protected from bots
- Best of both worlds! 🎉

---

If the WAF Skip rule still doesn't work after following these steps exactly, share a screenshot of:
1. Your WAF Custom Rules list
2. The rule configuration
3. Firewall Events showing the blocked request

And I'll help debug further!
