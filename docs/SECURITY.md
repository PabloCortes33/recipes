# 🔒 Security Guide

## Important: Never Commit Secrets!

Your secrets (API keys, passwords, tokens) should **NEVER** be committed to git.

## ✅ What's Protected

The `.gitignore` files ensure these are never committed:

```
.env                  # All .env files
backend/.env          # Backend environment variables
node_modules/         # Dependencies
*.log                 # Log files
.DS_Store             # macOS system files
```

## 🔑 How to Handle Secrets

### For Local Development

1. **Copy the example file:**
   ```bash
   cd backend
   cp ENV_EXAMPLE.txt .env
   ```

2. **Add your real secrets to `.env`:**
   ```bash
   # Edit .env (this file is gitignored)
   nano .env
   
   # Add your real values:
   AUTH_PASSWORD=your-actual-password
   ANTHROPIC_API_KEY=sk-ant-api03-your-real-key
   GITHUB_TOKEN=ghp_your-real-token
   ```

3. **Never commit `.env`:**
   ```bash
   # This will be ignored automatically by .gitignore
   git status  # .env should NOT appear
   ```

### For Railway Deployment

Railway uses **Environment Variables** (not files):

1. Go to Railway dashboard → Your project → Variables
2. Click "New Variable"
3. Add each secret:
   - `AUTH_PASSWORD` = your strong password
   - `ANTHROPIC_API_KEY` = your API key
   - `GITHUB_TOKEN` = your GitHub token
   - `REPO_PATH` = `/app/repo`

**These are stored securely on Railway's servers and never exposed in your code.**

## 🛡️ Best Practices

### API Keys

**Anthropic API Key:**
- ✅ Store in Railway environment variables
- ✅ Store locally in `.env` (gitignored)
- ❌ NEVER commit to git
- ❌ NEVER share publicly
- ❌ NEVER hardcode in source files

**GitHub Token:**
- ✅ Create with minimal permissions (only `repo` scope)
- ✅ Store in Railway environment variables
- ✅ Store locally in `.env` (gitignored)
- ❌ NEVER commit to git
- ⚠️  Consider using Deploy Keys instead for Railway (more secure)

### Passwords

**AUTH_PASSWORD:**
- ✅ Use a strong, unique password
- ✅ Store in Railway environment variables
- ✅ Store locally in `.env`
- ❌ Don't use simple passwords like "password123"
- ⚠️  This is basic auth, sufficient for personal use only

## 🔍 Verify Your Setup

Run this check before committing:

```bash
# Should NOT show .env files
git status

# Should show .env is ignored
git check-ignore backend/.env
# Output should be: backend/.env

# Check what would be committed
git add .
git status
# Make sure no .env files appear!
```

## 🚨 If You Accidentally Commit Secrets

If you accidentally commit API keys or passwords:

1. **Revoke them immediately:**
   - Anthropic: console.anthropic.com → Revoke API key → Create new one
   - GitHub: Settings → Tokens → Delete token → Create new one

2. **Remove from git history:**
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner
   # Better yet, if caught early:
   git reset HEAD~1  # Undo last commit
   # Then recommit without secrets
   ```

3. **Update with new secrets:**
   - Add new keys to Railway variables
   - Add new keys to local `.env`

4. **Force push (⚠️ use carefully):**
   ```bash
   git push --force origin main
   ```

## ✅ Security Checklist

Before deploying:

- [ ] `.env` file exists locally and contains real secrets
- [ ] `.env` is in `.gitignore`
- [ ] `ENV_EXAMPLE.txt` only has placeholder values
- [ ] No secrets in source code files
- [ ] Railway environment variables configured
- [ ] GitHub token has minimal permissions
- [ ] Strong AUTH_PASSWORD chosen
- [ ] Verified with `git status` that no secrets will be committed

## 📚 Where Secrets Are Used

### Local Development
```
backend/.env → Loaded by dotenv → Used by server.js
```

### Railway Production
```
Railway Environment Variables → Injected as process.env → Used by server.js
```

### Never
```
Git repository → ❌ NO SECRETS EVER
GitHub (public/private) → ❌ NO SECRETS EVER
```

## 🎯 Remember

- **Example files** (`ENV_EXAMPLE.txt`) = Safe to commit, only placeholders
- **Real env files** (`.env`) = NEVER commit, contains real secrets
- **Railway variables** = Secure, managed by Railway, never in code
- **Git history** = Permanent, cannot easily remove secrets once pushed

**Keep your secrets secret!** 🔐

