# 🚀 Railway Deployment Guide

This guide will help you deploy your AI-powered recipe server to Railway.app

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Anthropic API Key**: Get one from [console.anthropic.com](https://console.anthropic.com)
3. **GitHub Personal Access Token**: Create one at GitHub Settings → Developer settings → Personal access tokens

## Step 1: Prepare Your Repository

1. Make sure all your recipe files are committed to GitHub
2. Push the `server` directory to your repository:

```bash
cd /Users/pablocortes/Desktop/recipes
git add server/
git commit -m "Add server application"
git push origin main
```

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to [railway.app](https://railway.app) and click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `recipes` repository
4. Railway will auto-detect Node.js and deploy

### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd server
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables → Add these:

```
PORT=3000
AUTH_PASSWORD=your-secure-password
ANTHROPIC_API_KEY=sk-ant-api03-your-key
GITHUB_TOKEN=ghp_your-token
GITHUB_REPO=origin
REPO_PATH=/app/repo
```

**Important**: Set Root Directory to `backend` in Railway settings!

**Security Note**: Use a strong password for `AUTH_PASSWORD`!

## Step 4: Add Persistent Volume

1. In Railway dashboard, go to your service
2. Click "Volumes" → "New Volume"
3. Mount path: `/app/repo`
4. Size: 2-3 GB (includes all recipes + frontend + backend)
5. Click "Add Volume"

## Step 5: Initialize the Git Repository

After deployment, you need to clone your recipes repo into the volume:

### Using Railway CLI:

```bash
railway run bash

# Inside the container:
cd /app/repo
git clone https://github.com/PabloCortes33/recipes.git .
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### Or add an init script to `server.js`:

The server should automatically handle git operations, but you may need to manually clone once.

## Step 6: Access Your Application

1. Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)
2. Open it in your browser
3. Enter your `AUTH_PASSWORD`
4. Start generating recipes!

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (Railway sets automatically) |
| `AUTH_PASSWORD` | Yes | Password to access the web UI |
| `ANTHROPIC_API_KEY` | Yes | Your Claude API key |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token with `repo` scope |
| `GITHUB_REPO` | No | Git remote name (default: `origin`) |
| `REPO_PATH` | Yes | Path to recipes repository (use `/app/recipes` on Railway) |

## Workflow

### From Your Computer:

```bash
# 1. Make local changes
cd /Users/pablocortes/Desktop/recipes
# ... edit files ...

# 2. Commit and push
git add .
git commit -m "Update recipes"
git push origin main

# 3. Pull on server (via web UI or API)
# The server will sync automatically when you click "Pull from GitHub"
```

### From the Web App:

1. Open your Railway URL
2. Enter password
3. Enter research query (optional)
4. Enter recipe generation prompt
5. Click "Generate Recipe"
6. Review the generated recipes
7. Click "Save & Commit"
8. Click "Push to GitHub"
9. Done! Recipes are now on GitHub and your local can pull them

### From Your Local Computer to Get Server Changes:

```bash
cd /Users/pablocortes/Desktop/recipes
git pull origin main
```

## Troubleshooting

### Server won't start

- Check Railway logs
- Verify all environment variables are set
- Make sure the volume is mounted correctly

### Git operations fail

- Verify `GITHUB_TOKEN` has `repo` permissions
- Check that the git repository is cloned in `/app/recipes`
- Ensure git config (user.email, user.name) is set

### Recipe generation fails

- Verify `ANTHROPIC_API_KEY` is correct
- Check Railway logs for detailed error messages
- Make sure you have API credits in your Anthropic account

### Can't authenticate

- Double-check `AUTH_PASSWORD` environment variable
- Make sure there are no trailing spaces in the password

## Cost Estimate

**Railway Free Tier**: $5 credit/month
- Small web service: ~$2-3/month
- 1 GB volume: ~$0.25/month

**Total**: Should fit within free tier for personal use! 🎉

**Anthropic API**: Pay per use
- Typical recipe generation: ~$0.01-0.03 per recipe
- Research + generation: ~$0.05-0.10 per recipe

## Next Steps

Once deployed, you can:
1. ✅ Generate recipes from anywhere (phone, tablet, any computer)
2. ✅ Automatic git integration
3. ✅ Full AI research and generation workflow
4. ✅ Sync between server and your local machine via GitHub

Enjoy your AI-powered recipe management system! 🍳

