# ⚡ Quick Deploy Guide - vendor.shopwice.com

## 🎯 Fastest Way to Deploy (Vercel - Recommended)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Add Custom Domain
- Go to https://vercel.com/dashboard
- Select your project
- Settings → Domains
- Add: `vendor.shopwice.com`
- Copy the DNS records shown

### 5. Update DNS
Go to your domain registrar and add:
```
Type: CNAME
Name: vendor
Value: cname.vercel-dns.com (or as shown by Vercel)
```

### 6. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token
WP_BASE_URL=https://shopwice.com
NEXT_PUBLIC_APP_URL=https://vendor.shopwice.com
NODE_ENV=production
```

### 7. Redeploy
```bash
vercel --prod
```

### 8. Done! ✅
Visit: https://vendor.shopwice.com

---

## 🔧 WordPress Configuration

### Enable CORS for Subdomain

Add to your WordPress `wp-config.php`:
```php
// Allow vendor subdomain
header("Access-Control-Allow-Origin: https://vendor.shopwice.com");
header("Access-Control-Allow-Credentials: true");
```

Or use a CORS plugin and whitelist: `https://vendor.shopwice.com`

---

## ✅ Quick Test

1. Visit https://vendor.shopwice.com
2. Login with vendor credentials
3. Check products load
4. Check orders load
5. Test notifications

---

## 🐛 Common Issues

### Issue: "CORS Error"
**Fix:** Add vendor.shopwice.com to WordPress CORS whitelist

### Issue: "Login Failed"
**Fix:** Check JWT plugin is active on WordPress

### Issue: "DNS Not Found"
**Fix:** Wait 24-48 hours for DNS propagation

### Issue: "SSL Error"
**Fix:** Vercel handles SSL automatically, just wait a few minutes

---

## 📱 Test PWA

**Android:**
1. Open in Chrome
2. Menu → "Add to Home screen"

**iOS:**
1. Open in Safari
2. Share → "Add to Home Screen"

---

## 🎉 That's It!

Your vendor dashboard is now live at:
**https://vendor.shopwice.com**

Total time: ~15 minutes (plus DNS propagation)

---

## 📞 Need Help?

Check the full guides:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `FEATURES_IMPLEMENTED.md` - Feature documentation

---

Last Updated: November 15, 2025
