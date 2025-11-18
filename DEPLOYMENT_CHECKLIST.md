# 🚀 Deployment Checklist for vendor.shopwice.com

## Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] `.env.production` file created
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No console errors in production build
- [ ] All API endpoints tested

## DNS & Domain

- [ ] DNS A/CNAME record added for `vendor.shopwice.com`
- [ ] DNS propagation verified (use https://dnschecker.org)
- [ ] SSL certificate obtained
- [ ] HTTPS working correctly
- [ ] Redirects from HTTP to HTTPS configured

## Hosting Setup

### If using Vercel:
- [ ] Project created on Vercel
- [ ] Custom domain added
- [ ] Environment variables added
- [ ] Auto-deploy configured
- [ ] Build successful

### If using Netlify:
- [ ] Site created on Netlify
- [ ] Custom domain configured
- [ ] Environment variables added
- [ ] Build settings configured
- [ ] Deploy successful

### If using own server:
- [ ] Node.js 18+ installed
- [ ] App deployed to server
- [ ] PM2 configured and running
- [ ] Nginx/Apache configured
- [ ] SSL certificate installed
- [ ] Firewall rules configured

## WordPress/WooCommerce Configuration

- [ ] JWT Authentication plugin active
- [ ] Dokan plugin active and configured
- [ ] CORS headers configured for vendor.shopwice.com
- [ ] API endpoints accessible
- [ ] Test vendor account created
- [ ] Vendor permissions verified

## Security

- [ ] SSL certificate valid
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] API authentication working
- [ ] Cookies setting correctly
- [ ] Session management working
- [ ] No sensitive data in client code

## Functionality Testing

### Authentication:
- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes redirect to login
- [ ] Settings page loads

### Products:
- [ ] Products list loads
- [ ] Search works
- [ ] Add product works
- [ ] Edit product works
- [ ] Images upload correctly
- [ ] Categories load
- [ ] Attributes load

### Orders:
- [ ] Orders list loads
- [ ] Order details load
- [ ] Status update works
- [ ] Filtering works

### Notifications:
- [ ] Notification bell appears
- [ ] Notifications load
- [ ] Badge counter works
- [ ] Mark as read works
- [ ] Polling works (30s interval)

### Dashboard:
- [ ] Dashboard loads
- [ ] Stats display correctly
- [ ] Recent orders show
- [ ] Quick actions work

## PWA Features

- [ ] Manifest.json accessible
- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] App installs on mobile
- [ ] Offline mode works
- [ ] Icons display correctly

## Performance

- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] Caching working
- [ ] No memory leaks
- [ ] Mobile performance good
- [ ] Lighthouse score > 90

## Mobile Testing

### Android:
- [ ] Chrome - works
- [ ] Firefox - works
- [ ] Samsung Internet - works
- [ ] Install as PWA - works

### iOS:
- [ ] Safari - works
- [ ] Chrome - works
- [ ] Add to Home Screen - works

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Monitoring & Analytics

- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring configured (optional)
- [ ] Performance monitoring configured (optional)

## Documentation

- [ ] README updated
- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] User guide created (optional)

## Communication

- [ ] Vendors notified about new dashboard
- [ ] Login instructions sent
- [ ] Support email configured
- [ ] Feedback mechanism in place

## Post-Deployment

- [ ] Monitor error logs (first 24 hours)
- [ ] Check analytics (first week)
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Document lessons learned

## Rollback Plan

- [ ] Previous version backed up
- [ ] Rollback procedure documented
- [ ] Database backup created (if applicable)
- [ ] Quick rollback tested

---

## Quick Commands

### Build and Test:
```bash
npm run build
npm start
```

### Deploy to Vercel:
```bash
vercel --prod
```

### Deploy to Netlify:
```bash
netlify deploy --prod
```

### Check DNS:
```bash
nslookup vendor.shopwice.com
```

### Test SSL:
```bash
curl -I https://vendor.shopwice.com
```

### Check Service Worker:
Open DevTools → Application → Service Workers

---

## Emergency Contacts

- **Hosting Support:** [Your hosting provider]
- **Domain Registrar:** [Your domain provider]
- **Developer:** [Your contact]
- **WordPress Admin:** [Admin contact]

---

## Success Criteria

✅ App accessible at https://vendor.shopwice.com
✅ All features working
✅ No critical errors
✅ Performance acceptable
✅ Mobile experience good
✅ Vendors can login and use

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Status:** _______________

---

Last Updated: November 15, 2025
