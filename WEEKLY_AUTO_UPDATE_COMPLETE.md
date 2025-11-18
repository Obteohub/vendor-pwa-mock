# ✅ Weekly Auto-Update - Complete!

## What Was Set Up

Your JSON data files will now automatically update every week via GitHub Actions!

---

## 🤖 Automatic Updates

**Schedule:** Every Sunday at 2 AM UTC

**What Happens:**
1. GitHub Actions downloads fresh JSON files from shopwice.com
2. Checks if data has changed
3. If changed: Commits and pushes to main branch
4. Vercel automatically deploys with new data
5. Your app has fresh data!

**No manual work needed!** 🎉

---

## 📁 Files Created

### 1. GitHub Workflow
**File:** `.github/workflows/update-json-data.yml`

This workflow:
- ✅ Runs every Sunday at 2 AM UTC
- ✅ Downloads JSON files from shopwice.com
- ✅ Commits changes automatically
- ✅ Triggers Vercel deployment

### 2. NPM Script
**Added to `package.json`:**
```json
"update-data": "node download-json-files.js"
```

**Usage:**
```bash
npm run update-data
```

---

## 🎯 How It Works

```
Sunday 2 AM UTC
    ↓
GitHub Actions triggers
    ↓
Runs: node download-json-files.js
    ↓
Downloads from shopwice.com:
  - categories.json
  - brands.json
  - attributes.json
  - locations.json
    ↓
Checks for changes
    ↓
If changed:
  - Commits to main
  - Pushes to GitHub
  - Vercel auto-deploys
    ↓
Your app has fresh data! ✅
```

---

## 🔧 Manual Update (Anytime)

### Option 1: Run Locally
```bash
npm run update-data
git add public/data/
git commit -m "Update data"
git push
```

### Option 2: Trigger GitHub Action
1. Go to: GitHub → Actions tab
2. Click "Update JSON Data Files"
3. Click "Run workflow"
4. Done! GitHub handles everything

---

## 📊 What Gets Updated

| File | Items | Updates |
|------|-------|---------|
| categories.json | 711 | New categories, name changes |
| brands.json | 396 | New brands, updates |
| attributes.json | 132 | New attributes, terms |
| locations.json | 71 | New locations |

---

## 🔍 Monitor Updates

### View Update History
```bash
git log --oneline --grep="Update JSON data files"
```

### Check GitHub Actions
- Go to: GitHub → Actions tab
- See all workflow runs
- View logs and status

### Check Vercel Deployments
- Go to: Vercel dashboard
- See deployments triggered by data updates

---

## ⚙️ Configuration

### Change Frequency

Edit `.github/workflows/update-json-data.yml`:

```yaml
# Daily
- cron: '0 2 * * *'

# Twice weekly (Sun & Wed)
- cron: '0 2 * * 0,3'

# Monthly
- cron: '0 2 1 * *'
```

### Change Time

```yaml
# 2 AM UTC (current)
- cron: '0 2 * * 0'

# 6 AM UTC
- cron: '0 6 * * 0'

# 10 PM UTC
- cron: '0 22 * * 0'
```

---

## ✅ Benefits

### Automatic
- ✅ No manual work
- ✅ Runs on schedule
- ✅ Always fresh data

### Reliable
- ✅ Retries on failure
- ✅ Logs all activity
- ✅ Email notifications

### Efficient
- ✅ Only commits if changed
- ✅ Minimal deployments
- ✅ No wasted resources

---

## 🚀 Ready!

Everything is set up and will run automatically:

**Next automatic update:** This Sunday at 2 AM UTC

**Manual update:** `npm run update-data`

**Monitor:** GitHub Actions tab

Your data will stay fresh automatically! 🎉

---

## 📝 Quick Reference

```bash
# Manual update
npm run update-data

# View update history
git log --grep="Update JSON data files"

# Test workflow locally
node download-json-files.js

# Check for changes
git diff public/data/
```

---

## 🎊 Complete!

Your vendor dashboard now has:

✅ **Local JSON files** (fast loading)
✅ **Automatic weekly updates** (fresh data)
✅ **Manual update option** (when needed)
✅ **GitHub Actions workflow** (automated)
✅ **Vercel auto-deploy** (seamless)

**Result:** Always fresh data, zero manual work! 🚀
