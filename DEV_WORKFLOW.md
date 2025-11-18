# 🛠️ Development Workflow Best Practices

## Current Status

✅ **Production is live and working!**
- Deployed on Vercel
- Cloudflare configured
- Nginx configured
- Users can access the app

⚠️ **Don't make changes directly to production!**

---

## Proper Development Workflow

### Step 1: Set Up Local Development

1. **Clone/Pull the latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` for development:**
   ```bash
   cp .env.production.example .env.local
   ```

4. **Update `.env.local` with your local/dev settings:**
   ```env
   # Use production API for now, or set up local WordPress
   NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
   NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token
   WP_BASE_URL=https://shopwice.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open:** http://localhost:3000

---

### Step 2: Make Changes Locally

**Test everything locally before deploying:**

1. Make your code changes
2. Test in browser at localhost:3000
3. Check console for errors
4. Test all features work
5. Test on mobile (responsive design)

---

### Step 3: Git Workflow

**Create a feature branch:**

```bash
# Create and switch to new branch
git checkout -b feature/toast-notifications

# Make your changes...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add toast notification system"

# Push to GitHub
git push origin feature/toast-notifications
```

**Create Pull Request:**
1. Go to GitHub
2. Create Pull Request from your branch to `main`
3. Review changes
4. Merge when ready

---

### Step 4: Deploy to Preview (Vercel)

**Automatic preview deployments:**

When you push to a branch, Vercel automatically creates a preview:
- URL: `https://vendor-pwa-mock-[branch-name].vercel.app`
- Test here before merging to main

**Manual preview deployment:**
```bash
vercel
```

This creates a preview URL you can test.

---

### Step 5: Deploy to Production

**Option A: Automatic (Recommended)**

When you merge to `main` branch:
- Vercel automatically deploys to production
- URL: `https://vendor-pwa-mock.vercel.app`

**Option B: Manual**

```bash
# Deploy to production
vercel --prod

# Or with specific environment
vercel --prod --env NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
```

---

## Development Environment Setup

### Option 1: Use Production API (Easier)

**Pros:**
- ✅ No local WordPress setup needed
- ✅ Real data for testing
- ✅ Quick to start

**Cons:**
- ⚠️ Changes affect real data
- ⚠️ Need internet connection

**Setup:**
```env
# .env.local
NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token
WP_BASE_URL=https://shopwice.com
```

---

### Option 2: Local WordPress (Better)

**Pros:**
- ✅ Safe testing environment
- ✅ No risk to production data
- ✅ Faster development

**Cons:**
- ⚠️ Requires local WordPress setup
- ⚠️ More complex initial setup

**Setup:**

1. **Install Local WordPress:**
   - Use LocalWP, XAMPP, or Docker
   - Install WordPress
   - Install WooCommerce
   - Install Dokan plugin
   - Install JWT Auth plugin

2. **Configure `.env.local`:**
   ```env
   NEXT_PUBLIC_WC_API_BASE_URL=http://localhost:8000/wp-json/dokan/v1
   NEXT_PUBLIC_JWT_AUTH_URL=http://localhost:8000/wp-json/jwt-auth/v1/token
   WP_BASE_URL=http://localhost:8000
   ```

3. **Add test data:**
   - Create test vendor account
   - Add test products
   - Create test orders

---

## Testing Checklist

Before deploying to production:

### Functionality Tests
- [ ] Login works
- [ ] Dashboard loads
- [ ] Products list loads
- [ ] Can add new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Orders list loads
- [ ] Can view order details
- [ ] Can update order status
- [ ] Settings page works
- [ ] Logout works

### UI/UX Tests
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] No console errors
- [ ] Loading states work
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Performance Tests
- [ ] Pages load quickly
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Offline mode works (if applicable)

---

## Deployment Checklist

### Before Deploying

- [ ] All tests pass locally
- [ ] No console errors
- [ ] Code reviewed
- [ ] Git committed and pushed
- [ ] Environment variables set in Vercel
- [ ] Preview deployment tested

### After Deploying

- [ ] Production URL loads
- [ ] Login works in production
- [ ] Test critical features
- [ ] Check error logs in Vercel
- [ ] Monitor for 24 hours

---

## Rollback Plan

If something breaks in production:

### Quick Rollback (Vercel)

1. **Go to Vercel Dashboard**
2. **Deployments** tab
3. **Find last working deployment**
4. **Click "..." → Promote to Production**

### Git Rollback

```bash
# Revert last commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

---

## Recommended Improvements Workflow

### Phase 1: Set Up Development (Today)

1. ✅ Pull latest code
2. ✅ Set up `.env.local`
3. ✅ Run `npm run dev`
4. ✅ Test locally

### Phase 2: Add Features (This Week)

**Priority improvements:**
1. Toast notifications (I already created the components)
2. Confirmation dialogs
3. Search functionality
4. Better loading states
5. Mobile improvements

**For each feature:**
1. Create feature branch
2. Develop locally
3. Test thoroughly
4. Create PR
5. Deploy to preview
6. Test preview
7. Merge to main
8. Auto-deploy to production

### Phase 3: Monitor & Iterate (Ongoing)

1. Monitor Vercel logs
2. Check user feedback
3. Fix bugs quickly
4. Add requested features
5. Optimize performance

---

## Tools & Commands

### Development

```bash
# Start dev server
npm run dev

# Build for production (test locally)
npm run build

# Start production build locally
npm start

# Lint code
npm run lint

# Format code (if using Prettier)
npm run format
```

### Deployment

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

### Git

```bash
# Create feature branch
git checkout -b feature/name

# Stage all changes
git add .

# Commit
git commit -m "Description"

# Push
git push origin feature/name

# Switch back to main
git checkout main

# Pull latest
git pull origin main
```

---

## Next Steps

**To continue improving the app safely:**

1. **Set up local development:**
   ```bash
   npm run dev
   ```

2. **I'll create the improvements in separate files**

3. **You test locally first**

4. **Then deploy to preview**

5. **Finally deploy to production when ready**

---

## Summary

✅ **Production is working - don't touch it directly!**

✅ **Always develop locally first**

✅ **Use preview deployments to test**

✅ **Only deploy to production after thorough testing**

✅ **Have a rollback plan ready**

---

Ready to set up local development? Let me know and I'll guide you through it! 🚀
