# 🏗️ System Architecture

## Overview

The Recipes Collection is a hybrid system combining:
1. **Static PWA** (viewing recipes)
2. **Server Application** (generating recipes with AI)
3. **GitHub** (source of truth, version control, sync)

## Components

### 1. Static PWA (GitHub Pages)

**Location**: Root directory
**Hosting**: GitHub Pages (free)
**Purpose**: Recipe viewing and browsing

**Features**:
- Mobile-responsive recipe browser
- Dynamic serving size adjustment
- Recipe ideas brainstorming (localStorage)
- AI refactoring helper (clipboard)
- Offline support (service worker)
- PWA installable on home screen

**Technology**:
- Vanilla JavaScript
- Marked.js for markdown rendering
- Service Worker for offline
- No backend needed

**URL**: `https://yourusername.github.io/recipes`

### 2. Server Application (Railway)

**Location**: `/server` directory
**Hosting**: Railway.app (free tier)
**Purpose**: AI-powered recipe generation and management

**Features**:
- Web UI for recipe generation
- Claude API integration for AI
- Automated research phase
- Bilingual generation (English + Spanish)
- Git operations (pull, commit, push)
- Simple password authentication

**Technology**:
- Node.js + Express
- Anthropic SDK (Claude API)
- simple-git (git operations)
- Persistent volume for repository

**URL**: `https://your-app.railway.app`

### 3. GitHub Repository

**Purpose**: Source of truth and synchronization hub

**Role**:
- Stores all recipe markdown files
- Version control history
- Syncs between server and local computer
- Triggers GitHub Pages deployment

## Data Flow

### Viewing Recipes (PWA)

```
User visits GitHub Pages URL
   ↓
Static HTML loads
   ↓
JavaScript fetches markdown files
   ↓
Renders recipes with Marked.js
   ↓
User can adjust servings, view recipes
```

### Generating Recipes (Server)

```
User visits Server URL → Enters password
   ↓
Enters recipe idea + optional research query
   ↓
Server calls Claude API for research (if requested)
   ↓
Server calls Claude API for recipe generation
   ↓
Claude generates English + Spanish markdown
   ↓
User reviews and approves
   ↓
Server saves to files
   ↓
Server runs generate_manifest.js
   ↓
Server commits to git
   ↓
User clicks "Push"
   ↓
Server pushes to GitHub
   ↓
GitHub Pages auto-updates (1-2 min)
   ↓
New recipes live on PWA!
```

### Syncing to Local Computer

```
Server generates and pushes recipes
   ↓
User on local computer: git pull
   ↓
Local copy updated
   ↓
Can edit locally
   ↓
git push origin main
   ↓
Server can pull changes
```

## Workflow Scenarios

### Scenario 1: Generate Recipe from Phone

1. Open server URL on phone browser
2. Authenticate
3. Enter recipe idea
4. AI generates recipes
5. Review on phone
6. Save & push
7. View on PWA immediately
8. Pull to local computer later

### Scenario 2: Edit Recipe Locally

1. Edit markdown file on computer
2. Run `node generate_manifest.js`
3. `git commit` and `git push`
4. GitHub Pages auto-updates
5. Server can pull to stay in sync

### Scenario 3: Brainstorm on Phone, Develop on Server

1. Open PWA on phone
2. Click "Recipe Ideas"
3. Jot down ideas throughout the day
4. Later, open server URL
5. Copy ideas from PWA
6. Paste into server generation prompt
7. AI develops full recipe
8. Push to GitHub

## Architecture Decisions

### Why Static PWA?

- **Free hosting** (GitHub Pages)
- **Fast** (no server processing)
- **Offline support** (service worker)
- **Simple deployment** (just push to GitHub)
- **Great for viewing** (read-only operations)

### Why Separate Server?

- **AI requires backend** (API keys, long-running processes)
- **Git operations** (commit, push need server)
- **Research integration** (multi-step AI workflow)
- **Flexibility** (can run complex workflows)

### Why Not Serverless Functions?

- Execution time limits (10-60 seconds)
- No persistent git repository
- More complex for multi-step workflows
- Server approach is simpler for this use case

### Why Railway Over Other Hosts?

- **Generous free tier** ($5/month credit)
- **Persistent volumes** (needed for git repo)
- **Always-on** (no cold starts)
- **Simple setup** (GitHub integration)
- **Perfect for personal projects**

## Security Model

### Static PWA

- No secrets (all client-side)
- No authentication needed
- Read-only access to public recipes

### Server Application

- **Simple auth**: Password in Authorization header
- **API keys**: Stored as environment variables
- **GitHub token**: Minimal permissions (repo only)
- **Personal use**: Single user assumed

**Not production-grade**, but appropriate for personal project!

## Deployment Checklist

### Static PWA

- [x] Enable GitHub Pages
- [x] Set branch to `main`
- [x] URL: `https://yourusername.github.io/recipes`

### Server Application

- [ ] Create Railway account
- [ ] Deploy from GitHub
- [ ] Set environment variables
- [ ] Add persistent volume (1GB)
- [ ] Clone repo into volume
- [ ] Configure git credentials
- [ ] Access server URL

### Syncing

- [ ] Test push from server to GitHub
- [ ] Test pull on local computer
- [ ] Test push from local to GitHub
- [ ] Test pull on server

## Cost Breakdown

| Component | Service | Cost |
|-----------|---------|------|
| Static PWA | GitHub Pages | Free |
| Server | Railway | ~$2-3/month (fits in $5 credit) |
| Volume | Railway | ~$0.25/month (1GB) |
| AI API | Anthropic | ~$0.05-0.10 per recipe |
| Domain (optional) | Any registrar | ~$10-15/year |

**Total monthly**: ~$0 (within free tiers) + AI usage

## Future Enhancements

Possible additions:
- [ ] Add recipe search functionality
- [ ] Image generation for recipes (DALL-E)
- [ ] Nutritional information calculation
- [ ] Recipe scaling for larger groups
- [ ] Print-friendly recipe cards
- [ ] Recipe ratings and notes
- [ ] Multi-user support with proper auth
- [ ] Recipe import from URLs
- [ ] Meal planning features

## Conclusion

This architecture provides:
- ✅ Free (or near-free) hosting
- ✅ AI-powered generation
- ✅ Mobile-first experience
- ✅ Offline support
- ✅ Simple deployment
- ✅ Version control
- ✅ Sync across devices

Perfect for a personal recipe collection with modern AI capabilities!

