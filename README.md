# 🍳 Recipes Collection

A dynamic recipe browser that displays your markdown recipes in an organized, easy-to-navigate web interface. Works as a Progressive Web App (PWA) on mobile devices!

## Features

- 📱 **Mobile-First Design** - Fully responsive, optimized for iPhone and all devices
- 📁 **Collapsible Folders** - Organized by language (English/Spanish) and category
- 📖 **Markdown Viewer** - Read recipes directly in the browser with beautiful formatting
- ⚖️ **Dynamic Serving Adjustment** - Automatically scale ingredient quantities for any serving size
- 🔄 **Easy Updates** - Just run one script to regenerate everything
- ⚡ **Progressive Web App** - Install on your home screen like a native app
- 🚀 **Offline Support** - Access your recipes even without internet (after first visit)

## How to Use

### Adding New Recipes

1. Add your markdown files to the appropriate folder:
   - `english/recipes/` or `spanish/recipes/`
   - `english/methods/` or `spanish/methods/`
   - etc.

2. Regenerate the index:
   ```bash
   node generate_manifest.js
   ```

3. Commit and push:
   ```bash
   git add index.html
   git commit -m "Add new recipes"
   git push origin main
   ```

### Viewing Locally

To test your recipes locally, you need a web server (due to browser security restrictions):

```bash
./start_server.sh
```

Then open http://localhost:8000 in your browser.

### Deploy to GitHub Pages (Recommended)

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Under "Source", select your `main` branch
4. Click Save
5. Your site will be available at `https://yourusername.github.io/recipes`

**On iPhone:** Visit the site in Safari, tap the Share button, then "Add to Home Screen". Your recipe app will work like a native app with offline support!

### Dynamic Serving Adjustment

The recipe viewer automatically detects serving sizes and provides +/- buttons to scale all ingredient quantities:

**Supported formats:**
- Whole numbers: `2 cups` → `4 cups`
- Fractions: `½ teaspoon` → `1 teaspoon`
- Mixed numbers: `2 ½ cups` → `5 cups`
- Decimals: `1.5 tablespoons` → `3 tablespoons`
- Ranges: `2-3 cloves` → `4-6 cloves` (uses midpoint)

**How it works:**
1. Add `Yields: X servings` or `Serves: X` to your recipe
2. Start ingredient lines with quantities
3. The adjuster appears automatically when you view the recipe
4. Click +/- to scale all ingredients proportionally

No special markup needed - just write your recipes naturally!

## Project Structure

```
recipes/
├── english/             # English recipes
│   ├── bakery/
│   ├── methods/
│   ├── recipes/
│   ├── sauces/
│   └── spices/
├── spanish/             # Spanish recipes
│   ├── bakery/
│   ├── methods/
│   ├── recipes/
│   ├── sauces/
│   └── spices/
├── index.html           # Generated recipe browser (PWA)
├── manifest.json        # PWA manifest (generated)
├── service-worker.js    # Offline support (generated)
├── icon.svg             # App icon (generated)
├── generate_manifest.js # Script to regenerate all files
└── start_server.sh      # Local development server
```

## Technologies

- **Vanilla JavaScript** - No frameworks, fast and simple
- [Marked.js](https://marked.js.org/) - Markdown parsing
- **Progressive Web App (PWA)** - Installable, offline-capable
- **Service Workers** - Caching and offline support
- **Responsive CSS** - Mobile-first design with media queries
- **GitHub Pages** - Free hosting with custom domain support

No build tools required - just run the generator script and push to GitHub!

