# 🚀 Quick GitHub Setup

## Run These Commands:

### 1. Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Create Initial Commit
```bash
git commit -m "Initial commit: Vendor Dashboard PWA with auto-updating JSON data"
```

### 3. Create GitHub Repository
Go to: https://github.com/new
- Name: `vendor-pwa-mock`
- Private or Public
- **Don't** initialize with README
- Click "Create repository"

### 4. Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/vendor-pwa-mock.git
git branch -M main
git push -u origin main
```

### 5. Enable GitHub Actions
1. Go to: Settings → Actions → General
2. Select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Save

## ✅ Done!

Your project is now on GitHub with automatic weekly data updates!

---

## Next: Deploy to Vercel

1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (from `.env.production`)
4. Deploy!

---

See `GITHUB_SETUP.md` for detailed instructions.
