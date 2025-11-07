# 🍳 Recipes Collection - Project Context

## Overview

This is a comprehensive AI-powered recipe management system with a clean, organized architecture.

## Directory Structure

```
recipes/
├── recipes/           # All recipe markdown files
│   ├── english/       # English recipes
│   │   ├── bakery/
│   │   ├── methods/
│   │   ├── recipes/
│   │   ├── sauces/
│   │   └── spices/
│   └── spanish/       # Spanish recipes
│       ├── bakery/
│       ├── methods/
│       ├── recipes/
│       ├── sauces/
│       └── spices/
│
├── frontend/          # Static PWA for viewing recipes
│   ├── index.html             # Generated recipe browser
│   ├── generate_manifest.js   # Script to regenerate HTML
│   ├── manifest.json          # PWA manifest (generated)
│   ├── service-worker.js      # Offline support (generated)
│   ├── icon.svg               # App icon (generated)
│   └── start_server.sh        # Local dev server script
│
├── backend/           # Server application for AI generation
│   ├── server.js              # Express server
│   ├── package.json           # Dependencies
│   ├── public/                # Web UI for generation
│   │   └── index.html
│   ├── railway.json           # Railway config
│   └── README.md              # Server docs
│
├── docs/              # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── DEPLOYMENT.md          # GitHub Pages deployment
│   ├── BACKEND_DEPLOYMENT.md  # Railway deployment
│   └── QUICKSTART.md          # Quick start guide
│
├── .claude/           # AI agents for local development
│   └── agents/
│       └── gemini-research-expert.md
│
└── README.md          # Main documentation
```

## Recipe File Structure

All recipes follow this markdown format:

```markdown
# Recipe Name

Brief description of the recipe.

**Yields:** X servings  
**Prep time:** X minutes  
**Cook time:** X minutes

## Ingredients:

- Group 1:
  - quantity ingredient (description)
  - quantity ingredient

- Group 2:
  - quantity ingredient

## Instructions:

1. **Step Name:** Detailed instructions...
2. **Step Name:** More instructions...

## Notes:

Optional tips and variations.
```

## Key Principles

1. **Bilingual**: Every recipe exists in both English (`recipes/english/`) and Spanish (`recipes/spanish/`)
2. **Organized**: Recipes are categorized by type (recipes, methods, sauces, bakery, spices)
3. **Markdown-based**: All recipes are simple `.md` files
4. **AI-enhanced**: Can generate recipes using Claude API via backend
5. **Version controlled**: All changes tracked in git
6. **Mobile-first**: Optimized for phone use

## Workflows

### Local Development (Current Terminal Workflow)

```bash
# Navigate to recipes directory
cd /Users/pablocortes/Desktop/recipes

# Use Claude with agents
claude --dangerously-skip-permissions-check

# Example prompt:
# "use @gemini-research-expert to research Italian carbonara, 
#  then create a bilingual recipe following the format in recipes/"

# Regenerate frontend
cd frontend
node generate_manifest.js

# Commit and push
git add .
git commit -m "Add new recipe"
git push origin main
```

### Web-Based Generation (via Backend Server)

1. Visit backend URL
2. Authenticate
3. Enter recipe idea
4. AI researches and generates both versions
5. Save & push to GitHub
6. Available on frontend immediately

### Viewing Recipes

- **Production**: https://yourusername.github.io/recipes
- **Local**: `cd frontend && ./start_server.sh`

## Components

### Frontend (Static PWA)
- **Purpose**: View recipes, adjust servings, brainstorm ideas
- **Technology**: Vanilla JS, no build process
- **Hosting**: GitHub Pages (free)
- **Features**: Offline support, installable, responsive

### Backend (Node.js Server)
- **Purpose**: Generate recipes with AI, manage git
- **Technology**: Express, Anthropic SDK, simple-git
- **Hosting**: Railway.app (~$2-3/month)
- **Features**: AI integration, git automation, web UI

### Recipes (Data)
- **Format**: Markdown files
- **Organization**: Language → Category → Recipe
- **Source of Truth**: GitHub repository
- **Synced**: Between server, local machine, and GitHub Pages

## Adding New Recipes

### Automated (via Backend)
1. Open backend web UI
2. Enter prompt
3. AI generates
4. Review → Save → Push

### Manual
1. Create `.md` in `recipes/english/recipes/`
2. Create Spanish version in `recipes/spanish/recipes/`
3. Run `cd frontend && node generate_manifest.js`
4. Push to git

### Local with AI Agents
1. Use Claude CLI with `.claude/agents/`
2. Generate recipes
3. Save to `recipes/`
4. Regenerate and push

## Important Files

- `frontend/generate_manifest.js` - Regenerates index.html from recipe files
- `backend/server.js` - Main server application
- `docs/ARCHITECTURE.md` - Complete system design
- `docs/QUICKSTART.md` - Quick setup guide
- `.claude/agents/` - AI agents for local development

## Git Workflow

```
Local Computer ←→ GitHub ←→ Server
     ↓                ↓         ↓
  Edit files    Version     Generate
  manually      control     with AI
```

All three stay in sync via git push/pull.

## Usage Context

This project combines:
- Traditional markdown-based recipe storage
- Modern PWA frontend for mobile use
- AI-powered generation and improvement
- Simple git-based workflow
- Free/cheap hosting

Perfect for personal recipe collection with AI assistance!
