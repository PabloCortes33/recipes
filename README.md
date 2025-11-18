# 🍳 Recipes Collection

A complete AI-powered recipe management system with a clean, organized architecture.

## 📁 Directory Structure

```
recipes/
├── recipes/           # 📚 All recipe markdown files (English & Spanish)
│   ├── english/
│   └── spanish/
│
├── frontend/          # 🎨 Static PWA (GitHub Pages)
│   ├── index.html
│   ├── generate_manifest.js
│   └── ...
│
├── backend/           # ⚙️ Server + AI (Railway)
│   ├── server.js
│   ├── package.json
│   └── public/
│
├── docs/              # 📖 Documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── QUICKSTART.md
│
└── .claude/           # 🤖 AI agents for local development
    └── agents/
```

## 🚀 Quick Start

### View Recipes (No Setup)

Visit: **https://pablocortes33.github.io/recipes** (once deployed)

Or locally:
```bash
cd frontend
./start_server.sh
# Open http://localhost:8000
```

### Generate Recipes with AI

See `backend/README.md` and `docs/QUICKSTART.md`

## ✨ Features

### Static PWA (Frontend)
- 📱 Mobile-first responsive design
- 📁 Collapsible folder navigation
- 📖 Beautiful markdown rendering
- ⚖️ Dynamic serving size adjustment
- 💡 Recipe ideas brainstorming
- 🤖 AI refactoring helper
- ⚡ PWA installable on home screen
- 🚀 Offline support

### Server Application (Backend)
- 🌐 Web UI for recipe generation
- 🤖 Claude API integration
- 🔬 Automated research phase
- 🌍 Bilingual generation (English + Spanish)
- 🔄 Git automation (commit & push)
- 🔒 Simple password auth
- 📱 Mobile-friendly interface

## 🔄 Workflows

### 1. Generate New Recipe (From Anywhere)

```
Open backend URL → Authenticate
↓
Enter research query (optional)
↓
Enter recipe idea
↓
AI generates English + Spanish versions
↓
Review → Save & Commit → Push
↓
Live on GitHub Pages in 1-2 minutes!
```

### 2. Browse & Use Recipes (Phone/Tablet)

```
Visit frontend URL
↓
Browse folders → Click recipe
↓
Adjust servings as needed
↓
Cook! 🍳
```

### 3. Brainstorm Ideas (Mobile)

```
Click "💡 Recipe Ideas"
↓
Jot down ideas (auto-saves)
↓
Later: Copy All → Paste into AI
↓
Develop into full recipes
```

### 4. Sync with Local Computer

```
git pull origin main
# Edit recipes locally
git push origin main
# Server can pull to sync
```

## 📚 Documentation

- **`/docs/QUICKSTART.md`** - Get started in 5 minutes
- **`/docs/SECURITY.md`** - Security best practices (READ THIS!)
- **`/docs/ARCHITECTURE.md`** - Complete system design
- **`/docs/DEPLOYMENT.md`** - Deploy frontend to GitHub Pages
- **`/docs/BACKEND_DEPLOYMENT.md`** - Deploy backend to Railway
- **`/backend/README.md`** - Server API documentation

## 🔒 Security Note

**IMPORTANT**: This repository contains an `ENV_EXAMPLE.txt` file with placeholders only. 

- ✅ **Safe to commit**: `ENV_EXAMPLE.txt` (placeholders)
- ❌ **NEVER commit**: `.env` (real secrets)
- 🔐 **For Railway**: Use environment variables in dashboard
- 📖 **Read**: `docs/SECURITY.md` for complete security guide

Your secrets are protected by `.gitignore` - just don't manually add `.env` to git!

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript
- Marked.js (markdown rendering)
- Service Workers (offline support)

**Backend:**
- Node.js + Express
- Anthropic SDK (Claude API)
- simple-git (git operations)

**Hosting:**
- Frontend: GitHub Pages (free)
- Backend: Railway.app ($0-3/month)
- Sync: GitHub (version control)

## 💰 Cost

- **Frontend hosting**: FREE (GitHub Pages)
- **Backend hosting**: ~$2-3/month (Railway free tier)
- **AI generation**: ~$0.05-0.10 per recipe (Anthropic API)

**Total**: Basically free for personal use!

## 🎯 Adding New Recipes

### Method 1: Via Server (Automated)
1. Use backend web UI
2. AI generates recipes
3. Auto-commits and pushes

### Method 2: Manual
1. Create `.md` file in `recipes/english/recipes/`
2. Create Spanish version in `recipes/spanish/recipes/`
3. Run `cd frontend && node generate_manifest.js`
4. Commit and push

### Method 3: Local with AI
1. Use Claude CLI with agents in `.claude/`
2. Generate recipes locally
3. Save to `recipes/` folder
4. Regenerate and push

## 🌟 Key Benefits

- ✅ Clean, organized structure
- ✅ Separation of concerns (frontend/backend/data)
- ✅ AI-powered generation
- ✅ Works offline (PWA)
- ✅ Mobile-optimized
- ✅ Free (or nearly free) hosting
- ✅ Version control
- ✅ Sync across devices

## 📖 Learn More

Read the full architecture guide: `docs/ARCHITECTURE.md`

Happy cooking! 🍳
# Test deploy
