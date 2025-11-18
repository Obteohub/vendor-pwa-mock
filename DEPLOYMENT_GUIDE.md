# Deployment Guide - vendor.shopwice.com

## 🚀 Deploying Your Vendor PWA to Production

This guide will help you deploy your Shopwice Vendor PWA to `vendor.shopwice.com` as a separate subdomain from your main website.

---

## 📋 Prerequisites

1. Access to your domain DNS settings (shopwice.com)
2. A hosting platform (Vercel, Netlify, or your own server)
3. SSL certificate for vendor.shopwice.com
4. Your WooCommerce/Dokan API credentials

---

## 🔧 Step 1: Environment Configuration

### Update `.env.local` for Production

Create a `.env.production` file with your production settings:

```env
# Production Environment Variables

# WooCommerce/Dokan API Base URL
NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1

# JWT Authentication URL
NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token

# WordPress Base URL
WP_BASE_URL=https://shopwice.com

# App URL (your vendor subdomain)
NEXT_PUBLIC_APP_URL=https://vendor.shopwice.com

# Node Environment
NODE_ENV=production
```

### Update Cookie Settings for Production

The app is already configured to work with production. The cookies are set with:
- `secure: false` for localhost
- `secure: true` for HTTPS in production (automatic)

---

## 🌐 Step 2: DNS Configuration

### Add Subdomain DNS Record

In your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

1. Go to DNS settings for `shopwice.com`
2. Add a new record:
   - **Type:** A Record (or CNAME)
   - **Host:** vendor
   - **Value:** Your server IP (or hosting provider's domain)
   - **TTL:** Automatic or 3600

**Example:**
```
Type: A
Host: vendor
Value: 76.76.21.21 (your server IP)
TTL: 3600
```

Or if using Vercel/Netlify:
```
Type: CNAME
Host: vendor
Value: cname.vercel-dns.com (or your hosting provider)
TTL: 3600
```

---

## 📦 Step 3: Deployment Options

### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Automatic SSL
- Global CDN
- Zero configuration
- Free tier available

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure Custom Domain:**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Domains
   - Add `vendor.shopwice.com`
   - Follow DNS instructions

5. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all variables from `.env.production`
   - Redeploy

---

### Option B: Deploy to Netlify

**Steps:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build your app:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod
```

4. **Configure Custom Domain:**
   - Go to Netlify Dashboard
   - Domain Settings → Add custom domain
   - Enter `vendor.shopwice.com`
   - Follow DNS instructions

5. **Add Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.production`

---

### Option C: Deploy to Your Own Server (VPS/Dedicated)

**Requirements:**
- Node.js 18+ installed
- Nginx or Apache
- SSL certificate (Let's Encrypt)
- PM2 for process management

**Steps:**

1. **Install dependencies on server:**
```bash
ssh user@your-server-ip
cd /var/www/vendor-app
npm install
```

2. **Build the app:**
```bash
npm run build
```

3. **Install PM2:**
```bash
npm install -g pm2
```

4. **Start the app:**
```bash
pm2 start npm --name "vendor-app" -- start
pm2 save
pm2 startup
```

5. **Configure Nginx:**

Create `/etc/nginx/sites-available/vendor.shopwice.com`:

```nginx
server {
    listen 80;
    server_name vendor.shopwice.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vendor.shopwice.com;

    ssl_certificate /etc/letsencrypt/live/vendor.shopwice.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vendor.shopwice.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Enable site and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/vendor.shopwice.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Get SSL Certificate:**
```bash
sudo certbot --nginx -d vendor.shopwice.com
```

---

## 🔒 Step 4: Security Configuration

### Update CORS Settings on Main Site

On your main WordPress site (shopwice.com), add to `wp-config.php` or use a plugin:

```php
// Allow vendor subdomain to access API
header("Access-Control-Allow-Origin: https://vendor.shopwice.com");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

Or use a CORS plugin and whitelist: `https://vendor.shopwice.com`

### Update Cookie Domain

In your Next.js app, cookies are already configured to work across subdomains.

---

## ✅ Step 5: Verification Checklist

After deployment, verify:

- [ ] App loads at https://vendor.shopwice.com
- [ ] SSL certificate is valid (green padlock)
- [ ] Login works correctly
- [ ] API calls to shopwice.com succeed
- [ ] Cookies are set properly
- [ ] Products load correctly
- [ ] Orders load correctly
- [ ] Images display properly
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] Notifications work

---

## 🔍 Step 6: Testing

### Test Login Flow:
1. Go to https://vendor.shopwice.com/login
2. Enter credentials
3. Should redirect to dashboard
4. Check browser cookies (should see `sw_token` and `sw_user`)

### Test API Calls:
1. Open browser DevTools → Network tab
2. Navigate through the app
3. Check API calls to shopwice.com
4. Verify 200 responses

### Test PWA:
1. On mobile, visit https://vendor.shopwice.com
2. Browser should prompt "Add to Home Screen"
3. Install and open as app
4. Should work like native app

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:**
- Add vendor.shopwice.com to WordPress CORS whitelist
- Check CORS headers in browser DevTools
- Ensure credentials are included in requests

### Issue: Cookies Not Setting

**Solution:**
- Verify SSL is working (HTTPS)
- Check cookie settings in browser
- Ensure `sameSite: 'lax'` is set
- Check domain settings

### Issue: API Calls Failing

**Solution:**
- Verify environment variables are set
- Check API URLs in `.env.production`
- Test API endpoints directly with Postman
- Check WordPress JWT plugin is active

### Issue: Images Not Loading

**Solution:**
- Check image URLs in API responses
- Verify CORS allows image loading
- Check CDN settings if using one

---

## 📊 Step 7: Monitoring & Analytics

### Add Analytics (Optional)

1. **Google Analytics:**
   - Add tracking code to `src/app/layout.jsx`
   - Track page views and events

2. **Error Tracking:**
   - Use Sentry for error monitoring
   - Add to `next.config.js`

3. **Performance Monitoring:**
   - Use Vercel Analytics (if on Vercel)
   - Monitor Core Web Vitals

---

## 🔄 Step 8: Continuous Deployment

### Set Up Auto-Deploy (Vercel/Netlify)

1. Connect your Git repository
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. Enable auto-deploy on push to main branch

### Manual Deploy

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart (if using PM2)
pm2 restart vendor-app
```

---

## 📱 Step 9: PWA Configuration

### Verify PWA Settings

The app is already configured with:
- ✅ `manifest.json` in `/public`
- ✅ Service worker at `/public/sw.js`
- ✅ Offline support
- ✅ Install prompts

### Test PWA Installation:

**On Android:**
1. Open Chrome
2. Visit https://vendor.shopwice.com
3. Tap menu → "Add to Home screen"
4. App installs like native app

**On iOS:**
1. Open Safari
2. Visit https://vendor.shopwice.com
3. Tap Share → "Add to Home Screen"
4. App installs to home screen

---

## 🎯 Step 10: Go Live!

### Final Steps:

1. ✅ Deploy to production
2. ✅ Configure DNS
3. ✅ Set up SSL
4. ✅ Test all features
5. ✅ Monitor for errors
6. ✅ Announce to vendors!

### Announcement Template:

```
🎉 New Vendor Dashboard Available!

We're excited to announce our new vendor dashboard at:
https://vendor.shopwice.com

Features:
✅ Manage products easily
✅ Track orders in real-time
✅ Get instant notifications
✅ Works offline
✅ Install as mobile app

Login with your existing Shopwice credentials.

Need help? Contact support@shopwice.com
```

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review error logs
3. Test API endpoints
4. Check DNS propagation (can take 24-48 hours)
5. Verify SSL certificate

---

## 🎉 Success!

Your Shopwice Vendor PWA is now live at:
**https://vendor.shopwice.com**

The main website (shopwice.com) remains separate and unaffected.

---

**Last Updated:** November 15, 2025
**Status:** Ready for Production Deployment
