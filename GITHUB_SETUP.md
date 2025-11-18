# GitHub Setup Guide

## Step 1: Configure Git

Run these commands (replace with your info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

```bash
git commit -m "Initial commit: Vendor Dashboard PWA with auto-updating JSON data"
```

## Step 3: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `vendor-pwa-mock` (or your preferred name)
3. Description: "High-performance vendor dashboard PWA with auto-updating data"
4. Choose: Private or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 4: Connect to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/vendor-pwa-mock.git
git branch -M main
git push -u origin main
```

## Step 5: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files
3. Check that `.github/workflows/update-json-data.yml` is there

## Step 6: Enable GitHub Actions

1. Go to: Settings → Actions → General
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
3. Click "Save"

## Step 7: Test Auto-Update (Optional)

1. Go to: Actions tab
2. Click "Update JSON Data Files"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"
6. Watch it run and complete

## Step 8: Connect to Vercel

1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_WC_API_BASE_URL=https://shopwice.com/wp-json/dokan/v1
   NEXT_PUBLIC_JWT_AUTH_URL=https://shopwice.com/wp-json/jwt-auth/v1/token
   NEXT_PUBLIC_WORDPRESS_URL=https://shopwice.com
   WP_BASE_URL=https://shopwice.com
   WC_CONSUMER_KEY=your_key
   WC_CONSUMER_SECRET=your_secret
   ```
5. Click "Deploy"

## ✅ Done!

Your project is now:
- ✅ On GitHub
- ✅ Auto-updating weekly
- ✅ Deployed on Vercel
- ✅ Production ready

## 🔄 Future Updates

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will auto-deploy!

## 📊 Monitor

- **GitHub Actions:** https://github.com/YOUR_USERNAME/vendor-pwa-mock/actions
- **Vercel Deployments:** https://vercel.com/your-project/deployments

---

## Quick Commands Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Update data manually
npm run update-data
```

---

## Troubleshooting

### Push rejected?

```bash
git pull origin main --rebase
git push origin main
```

### Wrong remote URL?

```bash
git remote -v
git remote set-url origin https://github.com/YOUR_USERNAME/vendor-pwa-mock.git
```

### Need to undo last commit?

```bash
git reset --soft HEAD~1
```

---

## 🎉 Success!

Your vendor dashboard is now on GitHub with automatic weekly updates! 🚀
