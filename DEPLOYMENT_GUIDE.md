# GitHub Pages Deployment Guide

## Quick Setup (5 minutes)

### Option 1: Deploy from Branch (Easiest)

1. **Go to your repository on GitHub**:
   - Visit: https://github.com/Snobben/yield-curve-visualization

2. **Go to Settings → Pages**:
   - Click on "Settings" tab
   - Scroll down to "Pages" in the left sidebar

3. **Configure Source**:
   - Under "Build and deployment"
   - Source: Select **"Deploy from a branch"**
   - Branch: Select **"claude/review-and-plan-upgrades-u0ES8"**
   - Folder: Select **"/ (root)"**
   - Click **"Save"**

4. **Wait for deployment** (1-2 minutes):
   - GitHub will build and deploy your site
   - A green message will show: "Your site is live at..."

5. **Visit your site**:
   - URL will be: `https://snobben.github.io/yield-curve-visualization/`

### Option 2: Create Main Branch and Deploy (Recommended for Production)

1. **Merge via GitHub Pull Request**:
   - Go to: https://github.com/Snobben/yield-curve-visualization
   - Click "Pull requests" → "New pull request"
   - Base: `main` (create if needed) ← Compare: `claude/review-and-plan-upgrades-u0ES8`
   - Click "Create pull request"
   - Review changes
   - Click "Merge pull request"

2. **Configure GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / (root)
   - Click Save

3. **Your site will be live at**:
   - `https://snobben.github.io/yield-curve-visualization/`

---

## Alternative: GitHub Actions (Advanced)

If you want automatic deployments on every push:

1. **Create workflow file**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v2
```

2. **Configure GitHub Pages**:
   - Settings → Pages
   - Source: GitHub Actions

---

## Troubleshooting

### Site not loading after deployment?

**Check these:**

1. **Wait a few minutes** - GitHub Pages can take 1-5 minutes to build

2. **Check deployment status**:
   - Go to "Actions" tab in your repo
   - Look for green checkmark or red X

3. **Hard refresh your browser**:
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5` or `Cmd + Shift + R`

4. **Check GitHub Pages settings**:
   - Settings → Pages
   - Should show: "Your site is live at [URL]"

### Files not found (404 errors)?

**Check relative paths:**
- All file references in `index.html` are already relative
- CSV file: `treasuries_cleaned.csv` ✓
- JS files: `data-service.js`, `app.js`, etc. ✓
- CSS: `styles.css` ✓

These should all work fine!

### CORS issues with Treasury API?

The Treasury API might have CORS restrictions. If you see errors in the console when loading live data:

**Workaround:**
- Use the local CSV data option instead
- Or add a proxy server (more advanced)

---

## What Gets Deployed?

All files in your repository:
- ✓ `index.html` - Main page
- ✓ `styles.css` - Styling
- ✓ `app.js` - Application controller
- ✓ `data-service.js` - Data fetching
- ✓ `yield-curve-visualization.js` - D3 visualization
- ✓ `treasuries_cleaned.csv` - Local data
- ✓ `README.md` - Documentation

**Not deployed:**
- `.git/` folder (hidden)
- `UPGRADE_PLANS.md` (documentation only)
- `IMPLEMENTATION_SUMMARY.md` (documentation only)

---

## Updating Your Live Site

After making changes:

1. **Push changes** to your branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **GitHub Pages auto-updates** (if using main branch)
   - Takes 1-5 minutes
   - Check Actions tab for progress

3. **Or manually re-deploy**:
   - Go to Settings → Pages
   - Click "Save" again to trigger rebuild

---

## Custom Domain (Optional)

Want to use your own domain like `yields.example.com`?

1. **Buy a domain** (Namecheap, Google Domains, etc.)

2. **Add to GitHub Pages**:
   - Settings → Pages
   - Custom domain: Enter your domain
   - Click Save

3. **Configure DNS** at your domain registrar:
   ```
   Type: CNAME
   Name: yields (or www)
   Value: snobben.github.io
   ```

4. **Enable HTTPS** (recommended):
   - Check "Enforce HTTPS" in GitHub Pages settings

---

## Testing Locally Before Deployment

Always test locally first:

```bash
# Start local server
python -m http.server 8000

# Visit
http://localhost:8000
```

If it works locally, it will work on GitHub Pages!

---

## Next Steps After Deployment

1. **Share your visualization**:
   - Add the live URL to your repository description
   - Share on social media
   - Add to your portfolio

2. **Monitor usage** (optional):
   - Add Google Analytics
   - Track visitor stats

3. **Keep improving**:
   - Check UPGRADE_PLANS.md for ideas
   - Add new features
   - Fix bugs as users report them

---

## Support

Having issues? Check:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Community Forum](https://github.community/)
- Repository Issues tab

---

**Ready to deploy?** Start with Option 1 above - it's the quickest way to get your visualization online!
