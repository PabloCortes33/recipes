# ⚡ Quick Start Guide

Get your AI recipe server running in 5 minutes!

## Option 1: Test Locally First (Recommended)

### 1. Get API Keys

**Anthropic API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Create an API key
4. Copy it (starts with `sk-ant-api03-`)

**GitHub Personal Access Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it `repo` scope only
4. Copy the token (starts with `ghp_`)

### 2. Install and Configure

```bash
cd /Users/pablocortes/Desktop/recipes/backend

# Run the setup script (creates .env and helps you configure it)
./setup.sh

# Or do it manually:
# cp ENV_EXAMPLE.txt .env
# nano .env  # Edit with your real API keys
```

**⚠️ IMPORTANT**: 
- The `.env` file is gitignored and will NEVER be committed
- `ENV_EXAMPLE.txt` only has placeholders (safe to commit)
- NEVER put real secrets in `ENV_EXAMPLE.txt`

### 3. Start the Server

```bash
npm start
```

### 4. Test It

Open http://localhost:3000

1. Enter your password (from AUTH_PASSWORD)
2. Try generating a recipe:
   - Research: "Italian carbonara traditional techniques"
   - Prompt: "Create an authentic carbonara recipe"
3. Review the generated recipes
4. Click "Save & Commit"
5. Click "Push to GitHub"
6. Check your GitHub repo!

## Option 2: Deploy to Railway (Production)

### 1. Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `recipes` repository
4. Railway auto-detects Node.js

### 3. Configure

1. Go to Variables tab
2. Add these environment variables:

```
AUTH_PASSWORD=your-secure-password
ANTHROPIC_API_KEY=sk-ant-api03-your-key
GITHUB_TOKEN=ghp_your-token
GITHUB_REPO=origin
REPO_PATH=/app/repo
```

3. Go to Settings → Root Directory → Set to `backend`

### 4. Add Persistent Volume

1. Click "Volumes"
2. Click "New Volume"
3. Mount path: `/app/repo`
4. Size: 2-3 GB
5. Click "Add"

### 5. Initialize Repository

After first deployment, you need to clone your repo into the volume.

**Method 1: Using Railway CLI**

```bash
railway link  # Link to your project
railway shell

# Inside the container:
cd /app/repo
git clone https://github.com/PabloCortes33/recipes.git .
git config user.email "your-email@example.com"
git config user.name "Your Name"
exit
```

**Method 2: Add init script** (automatic)

Create `backend/init.sh`:

```bash
#!/bin/bash
if [ ! -d "/app/repo/.git" ]; then
    cd /app/repo
    git clone https://github.com/PabloCortes33/recipes.git .
    git config user.email "your-email@example.com"
    git config user.name "Your Name"
fi
```

Update `package.json`:

```json
{
  "scripts": {
    "start": "./init.sh && node server.js"
  }
}
```

### 6. Access Your Server

Railway will give you a URL like: `https://recipes-production-xxxxx.up.railway.app`

Open it, authenticate, and start generating recipes!

## Complete Workflow Example

### From Anywhere (Phone, Tablet, Any Computer):

```
1. Visit server URL → Authenticate
2. Research: "French omelette techniques"
3. Prompt: "Create a classic French omelette recipe with cheese"
4. Click Generate → Wait 30-60 seconds
5. Review English and Spanish versions
6. Click "Save & Commit"
7. Click "Push to GitHub"
8. Done! ✅
```

### View on PWA:

```
1. Visit https://yourusername.github.io/recipes
2. Wait 1-2 minutes for GitHub Pages to rebuild
3. Navigate to Recipes folder
4. Your new recipe appears!
5. Install PWA on phone for offline access
```

### Sync to Local Computer:

```bash
cd /Users/pablocortes/Desktop/recipes
git pull origin main
# Your new recipe is now local!
```

## Troubleshooting

**"Unauthorized" error:**
- Check AUTH_PASSWORD in Railway environment variables
- Make sure you're entering the correct password

**"Failed to generate recipe":**
- Check ANTHROPIC_API_KEY is correct
- Verify you have API credits
- Check Railway logs for detailed errors

**"Failed to push to GitHub":**
- Verify GITHUB_TOKEN has `repo` permissions
- Check that git repository is initialized in volume
- Make sure git user.email and user.name are configured

**Recipe not appearing on GitHub:**
- Check Railway logs for errors
- Verify git push succeeded
- Check GitHub repository for new commits

## Tips

- **Save API costs**: Be specific in your prompts
- **Test locally first**: Debug issues before deploying
- **Monitor usage**: Check Railway dashboard for resource usage
- **Keep it simple**: This is a personal project, don't over-engineer!

## Next Steps

1. ✅ Test locally to make sure everything works
2. ✅ Deploy to Railway
3. ✅ Generate your first recipe from the web UI
4. ✅ Install the PWA on your phone
5. ✅ Enjoy your AI-powered recipe system!

🍳 Happy cooking!

