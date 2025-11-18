# 🔧 Fix: Nginx 403 Forbidden on WordPress API

## The Problem

After bypassing Cloudflare, we're now getting:
```
403 Forbidden
nginx
```

This means your **nginx server** is blocking access to `/wp-json/`.

---

## Common Causes & Fixes

### 1. ModSecurity / WAF Rules (Most Common)

Your server has ModSecurity or a WAF blocking API requests.

**Fix - Disable for /wp-json/:**

Add to your nginx config (usually in `/etc/nginx/sites-available/shopwice.com`):

```nginx
location ~ ^/wp-json/ {
    # Disable ModSecurity for API
    modsecurity off;
    
    # Or if using specific rules:
    # modsecurity_rules '
    #   SecRuleRemoveById 920100
    #   SecRuleRemoveById 920120
    # ';
    
    try_files $uri $uri/ /index.php?$args;
}
```

**Then reload nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 2. IP Whitelist / Geo-blocking

Your server might be blocking requests from certain IPs or countries.

**Check nginx config for:**
```nginx
# Look for these and comment them out for /wp-json/
deny all;
allow 192.168.1.0/24;
geo $blocked_country {
    default 0;
    US 1;
}
```

**Fix - Allow Vercel IPs:**

Add before the deny rules:
```nginx
# Allow Vercel
allow 76.76.21.0/24;
allow 76.76.19.0/24;
allow 64.252.128.0/18;
```

---

### 3. WordPress Security Plugin

Plugins like Wordfence, iThemes Security, or All In One WP Security might be blocking API access.

**Check these plugins:**

1. **Wordfence:**
   - Wordfence → Firewall → Manage Rate Limiting
   - Add exception for `/wp-json/`

2. **iThemes Security:**
   - Security → Settings → REST API
   - Disable "Restrict Access to REST API"

3. **All In One WP Security:**
   - WP Security → Firewall
   - Disable "Block Access to debug.log"
   - Check "6G Firewall Rules" - might need to whitelist API

**Quick test:** Temporarily deactivate security plugins and test.

---

### 4. .htaccess Rules

Even with nginx, WordPress might have .htaccess rules being processed.

**Check your `.htaccess` file for:**
```apache
# Look for these and remove/comment out:
<FilesMatch "^(wp-json)">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Or:
RewriteRule ^wp-json/ - [F,L]
```

---

### 5. File Permissions

Incorrect permissions on WordPress files.

**Fix:**
```bash
cd /path/to/wordpress
sudo chown -R www-data:www-data .
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;
```

---

### 6. Nginx Configuration - Missing PHP Handler

The `/wp-json/` requests might not be routed to PHP correctly.

**Add to nginx config:**

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;  # Adjust PHP version
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}

# Explicitly handle REST API
location ~ ^/wp-json/ {
    try_files $uri $uri/ /index.php?$args;
}
```

---

## Quick Diagnostic Commands

Run these on your server to find the issue:

### 1. Check nginx error log:
```bash
sudo tail -f /var/log/nginx/error.log
```

Then test the API and see what error appears.

### 2. Check ModSecurity log:
```bash
sudo tail -f /var/log/modsec_audit.log
# or
sudo tail -f /var/log/nginx/modsec_audit.log
```

### 3. Test from server itself:
```bash
curl -v http://localhost/wp-json/
```

If this works but external requests don't, it's an IP/firewall issue.

### 4. Check nginx config:
```bash
sudo nginx -t
sudo cat /etc/nginx/sites-available/shopwice.com | grep -A 10 "wp-json"
```

---

## Recommended Fix Order

1. ✅ **Check nginx error log** - See exact error
2. ✅ **Disable ModSecurity for /wp-json/** - Most common cause
3. ✅ **Check WordPress security plugins** - Temporarily deactivate
4. ✅ **Check IP whitelist rules** - Allow Vercel IPs
5. ✅ **Test from server** - `curl http://localhost/wp-json/`

---

## Quick Test: Disable ModSecurity Temporarily

If you have cPanel/Plesk:

**cPanel:**
1. Security → ModSecurity
2. Disable ModSecurity
3. Test API
4. Re-enable and add exception

**Plesk:**
1. Tools & Settings → Web Application Firewall
2. Disable
3. Test API
4. Re-enable and add exception

---

## After Fixing Nginx

Once the nginx 403 is fixed:

1. ✅ Test: `https://vendor-pwa-mock.vercel.app/api/test-connection`
2. ✅ Should see JSON response (not 403)
3. ✅ Then re-enable Cloudflare (orange cloud)
4. ✅ Configure Cloudflare WAF to skip Bot Fight Mode for `/wp-json/`

---

## Need Server Access?

If you don't have SSH access:
- Contact your hosting provider
- Ask them to "allow REST API access to /wp-json/ from external IPs"
- Provide Vercel IP ranges: `76.76.21.0/24, 76.76.19.0/24, 64.252.128.0/18`

---

## Alternative: Use Different Server for API

If your hosting is too restrictive:
- Move WordPress to a different server without strict firewall
- Or use WordPress.com hosting (allows API access)
- Or use a VPS with full control

---

What's your hosting setup? cPanel, Plesk, VPS, or managed WordPress? This will help determine the exact fix.
