# 🚂 Railway Environment Variables Setup Guide

Step-by-step guide with screenshots for setting up your secrets in Railway.

## Step 1: Deploy Your Project

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** (sign in with GitHub)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **"PabloCortes33/recipes"**
6. Click **"Deploy Now"**

Railway will start building your project.

## Step 2: Access Variables Settings

Once your project is deployed:

1. In the Railway dashboard, you'll see your project
2. Click on your **service** (it might be called "recipes" or "web")
3. Look for the **"Variables"** tab at the top
4. Click **"Variables"**

You should see a screen like:

```
┌─────────────────────────────────────┐
│  Overview  Metrics  Variables  ...  │
└─────────────────────────────────────┘
```

## Step 3: Add Environment Variables

Click **"New Variable"** button for each secret:

### Variable 1: AUTH_PASSWORD

```
┌─────────────────────────────────┐
│ Variable Name                   │
│ AUTH_PASSWORD                   │
│                                 │
│ Variable Value                  │
│ [your-strong-password-123]      │
│                                 │
│         [Add Variable]          │
└─────────────────────────────────┘
```

**Example value**: `MySecurePassword2024!`

### Variable 2: ANTHROPIC_API_KEY

Get your key first:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-api03-`)

Then in Railway:

```
┌─────────────────────────────────┐
│ Variable Name                   │
│ ANTHROPIC_API_KEY               │
│                                 │
│ Variable Value                  │
│ sk-ant-api03-xxxxxxxxxxxxx      │
│                                 │
│         [Add Variable]          │
└─────────────────────────────────┘
```

**Paste your actual API key**

### Variable 3: GITHUB_TOKEN

Get your token first:
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "Railway Recipe Server"
4. Check **only** the `repo` scope:
   ```
   ☑ repo
     ☑ repo:status
     ☑ repo_deployment
     ☑ public_repo
     ☑ repo:invite
     ☑ security_events
   ```
5. Click **"Generate token"** at bottom
6. Copy the token (starts with `ghp_`)

Then in Railway:

```
┌─────────────────────────────────┐
│ Variable Name                   │
│ GITHUB_TOKEN                    │
│                                 │
│ Variable Value                  │
│ ghp_xxxxxxxxxxxxxxxxxx          │
│                                 │
│         [Add Variable]          │
└─────────────────────────────────┘
```

**Paste your actual GitHub token**

### Variable 4: GITHUB_REPO

```
┌─────────────────────────────────┐
│ Variable Name                   │
│ GITHUB_REPO                     │
│                                 │
│ Variable Value                  │
│ origin                          │
│                                 │
│         [Add Variable]          │
└─────────────────────────────────┘
```

Use: `origin`

### Variable 5: REPO_PATH

```
┌─────────────────────────────────┐
│ Variable Name                   │
│ REPO_PATH                       │
│                                 │
│ Variable Value                  │
│ /app/repo                       │
│                                 │
│         [Add Variable]          │
└─────────────────────────────────┘
```

Use: `/app/repo`

## Step 4: Verify Variables

After adding all variables, you should see them listed:

```
┌──────────────────────────────────────────┐
│ Variables (5)                            │
├──────────────────────────────────────────┤
│ PORT              (Provided by Railway)  │
│ AUTH_PASSWORD     ••••••••               │
│ ANTHROPIC_API_KEY ••••••••               │
│ GITHUB_TOKEN      ••••••••               │
│ GITHUB_REPO       origin                 │
│ REPO_PATH         /app/repo              │
└──────────────────────────────────────────┘
```

✅ The dots (••••) mean the values are hidden (secure!)

## Step 5: Add Persistent Volume

1. In your service, click the **"Volumes"** tab
2. Click **"New Volume"** button
3. Fill in:
   ```
   Mount Path: /app/repo
   Size: 2 GB
   ```
4. Click **"Add Volume"**

Railway will restart your service with the volume attached.

## Step 6: Initialize Git Repository

After the service restarts with the volume:

### Option A: Using Railway Shell (Easy)

1. In Railway dashboard, click the **"Settings"** tab
2. Scroll down to **"Service Settings"**
3. Look for **"Custom Start Command"** (optional to verify)
4. Go back to **"Deployments"** tab
5. Click the **three dots (•••)** on the latest deployment
6. Select **"View Logs"**
7. At the top right, click **"Shell"** button

This opens a terminal in your container:

```bash
# You're now inside the Railway container!

# Navigate to the volume
cd /app/repo

# Clone your repository
git clone https://github.com/PabloCortes33/recipes.git .

# Configure git
git config user.email "your-email@example.com"
git config user.name "Pablo Cortes"

# Verify
ls -la
# You should see: backend/ frontend/ recipes/ docs/ etc.

# Exit
exit
```

### Option B: Using Railway CLI (Advanced)

```bash
# On your local computer
npm install -g @railway/cli
railway login
railway link  # Select your project

# Open shell
railway shell

# Then same commands as Option A
cd /app/repo
git clone https://github.com/PabloCortes33/recipes.git .
git config user.email "your-email@example.com"
git config user.name "Pablo Cortes"
```

## Step 7: Restart Service

After initializing the git repository:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or make a small change and push to trigger new deployment

## Step 8: Get Your URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://your-app-production-xxxx.up.railway.app`

## Step 9: Test It!

1. Open your Railway URL in a browser
2. Enter your `AUTH_PASSWORD` (the one you set in variables)
3. Try generating a recipe!

## 🎯 Quick Reference: All Variables

| Variable | Where to Get It | Example Value |
|----------|----------------|---------------|
| `AUTH_PASSWORD` | Choose your own | `MyStrongPass2024!` |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | `sk-ant-api03-...` |
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) | `ghp_...` |
| `GITHUB_REPO` | Always use | `origin` |
| `REPO_PATH` | Always use | `/app/repo` |

## 🔧 Troubleshooting

### "Can't find variables"

- Make sure you're in the **service** (not the project level)
- Click on your service name first, then Variables tab

### "Variables not applying"

- After adding variables, Railway should auto-redeploy
- If not, manually trigger a redeploy from Deployments tab

### "Can't access shell"

- Make sure your service is deployed and running
- Check that the deployment succeeded (green checkmark)
- Try the Railway CLI method instead

### "Git clone fails in shell"

- Verify GITHUB_TOKEN has `repo` permissions
- Make sure you're using a classic token (not fine-grained)
- Try cloning via HTTPS with token in URL:
  ```bash
  git clone https://YOUR_TOKEN@github.com/PabloCortes33/recipes.git .
  ```

## 📸 Visual Guide Summary

**Navigate to Variables:**
```
Railway Dashboard 
  → Projects 
    → Your Project 
      → Service (click on it)
        → Variables Tab (top)
          → New Variable Button
```

**Each variable needs:**
1. Variable Name (exact match from list above)
2. Variable Value (your actual secret)
3. Click "Add Variable"

**After adding all 5 variables:**
- Service will auto-redeploy
- Variables are injected into your app
- Secrets are secure (never in code)

## ✅ Security Verified

✅ Real secrets only in Railway dashboard (encrypted)
✅ Real secrets only in local `.env` (gitignored)
✅ Example file only has placeholders
✅ `.gitignore` prevents accidental commits
✅ No secrets in git history
✅ No secrets in public code

Your API keys are safe! 🔐

## 🆘 Need Help?

If you're stuck:
1. Check Railway docs: [docs.railway.app](https://docs.railway.app)
2. Railway Discord: Very responsive community
3. Or just ask me! I can help troubleshoot.

Ready to deploy! 🚀

