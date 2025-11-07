# 🍳 Recipes Collection

A complete AI-powered recipe management system with both a static PWA for viewing recipes and a server application for AI-powered generation and management.

## Two Components

1. **Static PWA** (GitHub Pages) - View recipes, adjust servings, brainstorm ideas
2. **Server App** (Railway) - Generate recipes with AI, manage git workflow

## Features

- 📱 **Mobile-First Design** - Fully responsive, optimized for iPhone and all devices
- 📁 **Collapsible Folders** - Organized by language (English/Spanish) and category
- 📖 **Markdown Viewer** - Read recipes directly in the browser with beautiful formatting
- ⚖️ **Dynamic Serving Adjustment** - Automatically scale ingredient quantities for any serving size
- 💡 **Recipe Ideas Brainstorming** - Jot down ideas on your phone, auto-saves locally, copy to paste into Claude/AI
- 🤖 **AI-Powered Refactoring** - One-click to copy recipe + prompt to Claude for improvements
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

### Recipe Ideas Brainstorming

Keep track of recipe ideas while you're on the go:

**Features:**
- 💾 **Auto-saves** - Your ideas are saved to your device as you type
- 📋 **One-tap copy** - Copy all ideas to paste into Claude or your AI assistant
- 🗑️ **Easy to clear** - Start fresh when needed
- 📱 **Mobile-friendly** - Perfect for jotting down ideas on your phone

**Workflow:**
1. On your phone: Click "💡 Recipe Ideas" button
2. Write down recipe ideas as they come to you
3. Ideas save automatically to your device
4. Later on your computer: Click "💡 Recipe Ideas"
5. Click "📋 Copy All" to copy everything
6. Paste into Claude or your local AI tool to develop the recipe
7. Add the finished recipe to your markdown files!

This is perfect for capturing inspiration while cooking, at the grocery store, or eating at restaurants!

### AI-Powered Recipe Refactoring

Improve your recipes with Claude's help using the simple clipboard workflow:

**How it works:**
1. Open any recipe in the viewer
2. Click "🤖 Refactor with AI" button
3. The recipe markdown + a detailed prompt copies to your clipboard
4. Paste into Claude (or your local AI tool)
5. Claude suggests improvements while maintaining your recipe's format
6. Copy the improved version
7. Update your local `.md` file
8. Run `node generate_manifest.js` and push!

**What Claude will improve:**
- Clarity of instructions
- Cooking techniques and tips
- Measurement accuracy
- Flow and organization
- Grammar and typos

**No API keys needed!** This uses the simple clipboard approach - you're in full control of what changes to accept.

### Server-Based AI Generation (NEW!)

For a more integrated experience, you can deploy the server application that fully automates the workflow:

**Features:**
- 🌐 **Web Interface** - Generate recipes from anywhere
- 🤖 **Full AI Integration** - Automated research and generation
- 🔄 **Git Automation** - Auto-commit and push to GitHub
- 🌍 **Bilingual** - Generates both English and Spanish versions automatically
- 📱 **Mobile-Friendly** - Use from your phone

**Quick Start:**
```bash
cd server
npm install
# Configure .env with your API keys
npm start
```

**Deploy to Railway:**
See `server/DEPLOYMENT.md` for complete deployment guide.

**Workflow:**
1. Open server web UI (e.g., `https://your-app.railway.app`)
2. Enter optional research query (e.g., "Italian carbonara techniques")
3. Enter recipe generation prompt
4. AI researches, generates English + Spanish recipes
5. Review and click "Save & Commit"
6. Click "Push to GitHub"
7. Recipes automatically available on GitHub Pages
8. Pull to your local machine with `git pull`

This server acts as your "recipe generation computer in the cloud" - you can generate recipes from anywhere and they sync via GitHub!

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
├── server/              # Server application (NEW!)
│   ├── server.js        # Main server
│   ├── package.json     # Dependencies
│   ├── public/          # Web UI
│   ├── DEPLOYMENT.md    # Railway deployment guide
│   └── README.md        # Server documentation
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

