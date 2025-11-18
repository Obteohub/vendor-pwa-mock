# Automated JSON Data Updates

## Overview

Your JSON data files are now automatically updated weekly via GitHub Actions. No manual intervention needed!

---

## 🤖 How It Works

### Automatic Updates (Weekly)

**Schedule:** Every Sunday at 2 AM UTC

**Process:**
1. GitHub Actions runs `download-json-files.js`
2. Downloads fresh data from shopwice.com
3. Checks if data has changed
4. If changed: Commits and pushes to main branch
5. Vercel auto-deploys with new data

**Result:** Your app always has fresh data, updated weekly!

---

## 📅 Update Schedule

```
Sunday 2 AM UTC = Saturday 9 PM EST / Saturday 6 PM PST
```

**Why Sunday?**
- Low traffic time
- Fresh data for the week ahead
- Minimal disruption

---

## 🔧 Manual Updates

### Option 1: Run Locally

```bash
npm run update-data
```

Then commit and push:
```bash
git add public/data/
git commit -m "Update JSON data files"
git push origin main
```

### Option 2: Trigger GitHub Action

1. Go to: https://github.com/YOUR_USERNAME/vendor-pwa-mock/actions
2. Click "Update JSON Data Files"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

GitHub will download, commit, and push automatically!

---

## 📊 What Gets Updated

| File | Source | Updates |
|------|--------|---------|
| categories.json | shopwice.com | New categories, name changes |
| brands.json | shopwice.com | New brands, updates |
| attributes.json | shopwice.com | New attributes, terms |
| locations.json | shopwice.com | New locations |

---

## 🔍 Monitoring Updates

### Check Last Update

View commit history:
```bash
git log --oneline --grep="Update JSON data files"
```

### Check GitHub Actions

1. Go to: https://github.com/YOUR_USERNAME/vendor-pwa-mock/actions
2. See "Update JSON Data Files" workflow
3. View run history and logs

### Check Vercel Deployments

1. Go to: https://vercel.com/your-project/deployments
2. Look for deployments with message: "Update JSON data files"
3. Each update triggers a new deployment

---

## 🚨 Troubleshooting

### Update Failed

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click failed workflow
3. View error logs

**Common issues:**
- shopwice.com is down → Will retry next week
- Network timeout → Will retry next week
- No changes detected → Normal, no commit made

### Force Update

If automatic update fails, run manually:

```bash
npm run update-data
git add public/data/
git commit -m "Manual data update"
git push origin main
```

---

## ⚙️ Configuration

### Change Update Frequency

Edit `.github/workflows/update-json-data.yml`:

```yaml
# Daily at 2 AM
schedule:
  - cron: '0 2 * * *'

# Twice weekly (Sunday and Wednesday)
schedule:
  - cron: '0 2 * * 0,3'

# Monthly (1st of month)
schedule:
  - cron: '0 2 1 * *'
```

### Change Update Time

```yaml
# 2 AM UTC
- cron: '0 2 * * 0'

# 6 AM UTC
- cron: '0 6 * * 0'

# 10 PM UTC
- cron: '0 22 * * 0'
```

---

## 📝 Workflow File

Location: `.github/workflows/update-json-data.yml`

**What it does:**
1. ✅ Checks out repository
2. ✅ Sets up Node.js
3. ✅ Runs download script
4. ✅ Checks for changes
5. ✅ Commits if changed
6. ✅ Pushes to main
7. ✅ Triggers Vercel deployment

---

## 🔐 Security

### GitHub Token

Uses built-in `GITHUB_TOKEN`:
- ✅ Automatically provided by GitHub
- ✅ Limited to repository scope
- ✅ No manual setup needed
- ✅ Expires after workflow

### Permissions

Workflow can:
- ✅ Read repository
- ✅ Write to repository
- ✅ Commit changes
- ✅ Push to main branch

Cannot:
- ❌ Access secrets
- ❌ Modify workflow files
- ❌ Delete branches
- ❌ Change settings

---

## 📈 Benefits

### Automatic
- ✅ No manual work needed
- ✅ Runs on schedule
- ✅ Always up-to-date

### Reliable
- ✅ Retries on failure
- ✅ Logs all activity
- ✅ Email notifications (optional)

### Efficient
- ✅ Only commits if changed
- ✅ Minimal deployments
- ✅ No wasted resources

---

## 🎯 Best Practices

### 1. Monitor First Week

Check that updates run successfully:
- View GitHub Actions logs
- Verify commits are made
- Check Vercel deployments

### 2. Set Up Notifications

Get notified of failures:
1. Go to: https://github.com/YOUR_USERNAME/vendor-pwa-mock/settings/notifications
2. Enable "Actions" notifications
3. Choose email or Slack

### 3. Review Changes

Periodically review what changed:
```bash
git log --oneline --grep="Update JSON data files" -10
git show <commit-hash>
```

### 4. Test After Updates

After automatic update:
1. Visit your app
2. Clear IndexedDB
3. Sync data
4. Verify new categories/brands appear

---

## 📊 Update History

Track updates over time:

```bash
# Count updates
git log --oneline --grep="Update JSON data files" | wc -l

# Show last 5 updates
git log --oneline --grep="Update JSON data files" -5

# Show changes in last update
git show HEAD:public/data/categories.json | jq '.length'
```

---

## 🔄 Rollback

If an update causes issues:

```bash
# Find last good commit
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## 💡 Tips

### Disable Automatic Updates

Comment out the schedule in `.github/workflows/update-json-data.yml`:

```yaml
on:
  # schedule:
  #   - cron: '0 2 * * 0'
  
  # Keep manual trigger
  workflow_dispatch:
```

### Update Before Deploy

Add to your deploy workflow:

```yaml
- name: Update data before deploy
  run: npm run update-data
```

### Notify Team

Add Slack notification:

```yaml
- name: Notify Slack
  if: steps.check_changes.outputs.changed == 'true'
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "JSON data files updated automatically"
      }
```

---

## ✅ Setup Complete!

Your JSON data files will now update automatically every Sunday at 2 AM UTC.

**What happens:**
1. 🤖 GitHub Actions downloads fresh data
2. 📝 Commits changes (if any)
3. 🚀 Vercel deploys automatically
4. ✅ Your app has fresh data!

**No manual work needed!** 🎉

---

## 📞 Support

If you need help:

1. Check GitHub Actions logs
2. Review this guide
3. Run manual update to test
4. Check shopwice.com is accessible

Everything is automated and will keep your data fresh! 🚀
