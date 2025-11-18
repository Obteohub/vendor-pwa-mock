# 🔧 Fix: Allow Vercel IPs in Nginx

## The Problem

Nginx error log shows:
```
access forbidden by rule, client: 54.159.45.140
```

Your nginx has an IP whitelist/deny rule blocking Vercel's IPs.

---

## Solution: Whitelist Vercel IPs

### Step 1: Find Your Nginx Config

Common locations:
```bash
/etc/nginx/sites-available/shopwice.com
/etc/nginx/conf.d/shopwice.com.conf
/etc/nginx/nginx.conf
```

### Step 2: Find the Deny Rule

Look for something like:
```nginx
location / {
    deny all;
    allow 192.168.1.0/24;
}

# Or:
location ~ ^/wp-json/ {
    deny all;
}

# Or:
geo $blocked {
    default 1;
    192.168.1.0/24 0;
}
```

### Step 3: Add Vercel IPs BEFORE the deny rule

```nginx
# Allow Vercel IPs
allow 76.76.21.0/24;
allow 76.76.19.0/24;
allow 64.252.128.0/18;

# Allow AWS IPs (Vercel uses AWS)
allow 54.0.0.0/8;
allow 52.0.0.0/8;
allow 18.0.0.0/8;

# Then your existing rules
deny all;
```

### Step 4: Or Better - Allow for /wp-json/ Only

```nginx
# Allow API access from anywhere
location ~ ^/wp-json/ {
    # Remove any deny rules here
    # allow all;  # Uncomment if needed
    
    try_files $uri $uri/ /index.php?$args;
}

# Keep restrictions for other paths
location / {
    allow 192.168.1.0/24;  # Your existing whitelist
    deny all;
}
```

### Step 5: Test and Reload

```bash
# Test config
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx

# Or restart
sudo systemctl restart nginx
```

---

## Quick Fix: Remove Deny Rule for /wp-json/

If you want API accessible from anywhere (recommended for public API):

**Edit your nginx config:**

```nginx
# Add this BEFORE your main location block
location ~ ^/wp-json/ {
    # Allow from anywhere
    allow all;
    
    try_files $uri $uri/ /index.php?$args;
    
    # Pass to PHP
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}

# Your existing location block with restrictions
location / {
    allow 192.168.1.0/24;
    deny all;
    try_files $uri $uri/ /index.php?$args;
}
```

---

## Alternative: Use Cloudflare IPs

If you want to keep restrictions but allow through Cloudflare:

```nginx
# Cloudflare IP ranges
include /etc/nginx/cloudflare-ips.conf;

# Or manually:
allow 173.245.48.0/20;
allow 103.21.244.0/22;
allow 103.22.200.0/22;
allow 103.31.4.0/22;
allow 141.101.64.0/18;
allow 108.162.192.0/18;
allow 190.93.240.0/20;
allow 188.114.96.0/20;
allow 197.234.240.0/22;
allow 198.41.128.0/17;
allow 162.158.0.0/15;
allow 104.16.0.0/13;
allow 104.24.0.0/14;
allow 172.64.0.0/13;
allow 131.0.72.0/22;

# Then deny others
deny all;
```

Then re-enable Cloudflare proxy (orange cloud) and configure WAF to skip Bot Fight Mode.

---

## If Using cPanel/Plesk

### cPanel:
1. **Security** → **IP Blocker**
2. **Remove any blocks** on Vercel/AWS IPs
3. Or add to whitelist

### Plesk:
1. **Tools & Settings** → **IP Address Banning**
2. **Trusted IP Addresses** → Add Vercel IPs

---

## Test After Fix

```bash
# From your server
curl -v http://localhost/wp-json/

# From external
curl -v https://shopwice.com/wp-json/

# Test diagnostic
https://vendor-pwa-mock.vercel.app/api/test-connection
```

**Expected:** JSON response, not 403

---

## Complete Nginx Config Example

```nginx
server {
    listen 80;
    server_name shopwice.com www.shopwice.com;
    root /var/www/shopwice.com;
    index index.php index.html;

    # Allow WordPress REST API from anywhere
    location ~ ^/wp-json/ {
        allow all;
        try_files $uri $uri/ /index.php?$args;
    }

    # Main location with restrictions (if needed)
    location / {
        # Your IP restrictions here (optional)
        # allow 192.168.1.0/24;
        # deny all;
        
        try_files $uri $uri/ /index.php?$args;
    }

    # PHP handler
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

---

## After Fixing Nginx

1. ✅ Test: `https://vendor-pwa-mock.vercel.app/api/test-connection`
2. ✅ Should see JSON (not 403)
3. ✅ Re-enable Cloudflare (orange cloud)
4. ✅ Configure Cloudflare WAF to skip Bot Fight Mode
5. ✅ Test login

---

## Summary

**The fix:**
1. Edit nginx config: `/etc/nginx/sites-available/shopwice.com`
2. Add `allow all;` to `/wp-json/` location block
3. Or whitelist Vercel/AWS IPs
4. Test: `sudo nginx -t`
5. Reload: `sudo systemctl reload nginx`
6. Test API access

This will fix the 403 error! 🚀
