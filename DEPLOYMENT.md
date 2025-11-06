# 🚀 Deployment Guide

## Enable GitHub Pages (Free Hosting)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/PabloCortes33/recipes
2. Click on **Settings** (top right)
3. Scroll down and click on **Pages** (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Choose branch: **main** and folder: **/ (root)**
6. Click **Save**

Your site will be live at: **https://pablocortes33.github.io/recipes**

⏱️ *Initial deployment takes 2-5 minutes*

### Step 2: Install on Your iPhone

1. Open Safari on your iPhone
2. Visit: https://pablocortes33.github.io/recipes
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"**

🎉 Done! Your recipes app is now on your home screen and works offline!

## Features After Deployment

✅ **Responsive Design** - Optimized for iPhone and all devices
✅ **Offline Support** - Access recipes without internet (after first visit)
✅ **Fast Loading** - Cached for instant access
✅ **No Installation** - Works directly in browser
✅ **Home Screen App** - Looks and feels like a native app

## Custom Domain (Optional)

Want to use your own domain like `recipes.yourdomain.com`?

1. Go to GitHub Pages settings
2. Add your custom domain
3. Update your DNS settings to point to GitHub Pages
4. Enable "Enforce HTTPS"

See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Updating Your Recipes

Every time you push to GitHub, your site automatically updates:

```bash
# Add new recipes to your folders
# Then run:
node generate_manifest.js

# Commit and push
git add .
git commit -m "Add new recipes"
git push origin main
```

Your site will update automatically in 1-2 minutes!

## Troubleshooting

**Site not loading?**
- Wait 5 minutes after first deployment
- Check GitHub Actions tab for deployment status
- Clear browser cache and reload

**PWA not installing on iPhone?**
- Make sure you're using Safari (not Chrome)
- Site must be accessed via HTTPS (GitHub Pages uses HTTPS by default)
- Check that manifest.json is accessible: https://pablocortes33.github.io/recipes/manifest.json

**Recipes not updating?**
- Clear browser cache
- Uninstall and reinstall the PWA
- Check that you ran `node generate_manifest.js` before pushing

## Free Alternatives to GitHub Pages

All these work with your current setup (no changes needed):

1. **Vercel** - https://vercel.com
   - Connect your GitHub repo
   - Auto-deploys on every push
   - Faster than GitHub Pages

2. **Netlify** - https://netlify.com
   - Drag & drop deployment or Git integration
   - Great for beginners

3. **Cloudflare Pages** - https://pages.cloudflare.com
   - Unlimited bandwidth
   - Very fast global CDN

All offer free plans perfect for your recipe site!

