# VPS Auto-Deploy Setup

This guide will set up automatic deployment to your VPS when you push to the `main` branch.

## Step 1: Generate SSH Key (On Your Local Machine)

```bash
# Generate a new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_vps

# This creates two files:
# ~/.ssh/github_actions_vps (private key - for GitHub)
# ~/.ssh/github_actions_vps.pub (public key - for VPS)
```

## Step 2: Add Public Key to VPS

```bash
# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/github_actions_vps.pub pablo@YOUR_VPS_IP

# Or manually:
cat ~/.ssh/github_actions_vps.pub | ssh pablo@YOUR_VPS_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

## Step 3: Test SSH Connection

```bash
# Test that the key works
ssh -i ~/.ssh/github_actions_vps pablo@YOUR_VPS_IP "echo 'Connection successful!'"
```

## Step 4: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

### VPS_HOST
- Name: `VPS_HOST`
- Value: Your VPS IP address (e.g., `123.45.67.89`)

### VPS_USER
- Name: `VPS_USER`
- Value: `pablo`

### SSH_PRIVATE_KEY
- Name: `SSH_PRIVATE_KEY`
- Value: The **entire contents** of `~/.ssh/github_actions_vps` (private key)

To get the private key contents:
```bash
cat ~/.ssh/github_actions_vps
```

Copy everything including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...everything in between...
-----END OPENSSH PRIVATE KEY-----
```

## Step 5: Verify Deployment Setup on VPS

Make sure these are set up on your VPS:

```bash
# SSH into your VPS
ssh pablo@YOUR_VPS_IP

# 1. Check repo exists
cd /home/compute/recipes
git status

# 2. Check backend dependencies installed
cd backend
npm install

# 3. Check PM2 is running
pm2 status

# 4. If backend not running, start it:
pm2 start server.js --name recipes-backend
pm2 save

# 5. Set up PM2 to auto-start on reboot
pm2 startup
# Run the command it outputs (sudo env PATH=...)
```

## Step 6: Test the Workflow

### Option A: Push a change
```bash
# On your local machine
cd /Users/pablocortes/Desktop/recipes
echo "# Test deploy" >> README.md
git add .
git commit -m "Test auto-deploy"
git push origin main
```

### Option B: Manual trigger
1. Go to GitHub repo → **Actions** tab
2. Click **Deploy to VPS** workflow
3. Click **Run workflow** → **Run workflow**

## Step 7: Monitor Deployment

1. Go to your repo's **Actions** tab on GitHub
2. Click on the latest workflow run
3. Watch the deployment logs in real-time

If successful, you'll see:
```
🚀 Starting deployment...
📥 Pulling latest changes...
📦 Installing backend dependencies...
🔄 Restarting backend service...
✅ Deployment complete!
```

## Troubleshooting

### "Permission denied (publickey)"
- Make sure you copied the public key to the VPS correctly
- Check `/home/pablo/.ssh/authorized_keys` on VPS
- Verify permissions: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`

### "pm2: command not found"
```bash
# On VPS
sudo npm install -g pm2
```

### "git pull failed"
```bash
# On VPS, check git status
cd /home/compute/recipes
git status
# If there are conflicts, resolve them first
```

### Workflow fails but SSH works manually
- Check that the VPS_USER secret is exactly `pablo`
- Verify the path `/home/compute/recipes` exists on VPS
- Check PM2 is installed globally: `pm2 --version`

## Security Notes

- ✅ The private key is stored securely in GitHub Secrets (encrypted)
- ✅ The key is only used for deployment (limited scope)
- ✅ Never commit the private key to the repository
- ⚠️ Anyone with push access to `main` can trigger deployment

## What Happens on Each Push

1. You push to `main` branch
2. GitHub Actions triggers automatically
3. Connects to your VPS via SSH
4. Pulls latest code from GitHub
5. Installs/updates dependencies
6. Restarts backend with PM2
7. Frontend files are automatically served (static files)

**Total time:** ~30-60 seconds from push to live

## Manual Deployment (Backup Method)

If GitHub Actions is down, you can always deploy manually:

```bash
ssh pablo@YOUR_VPS_IP
cd /home/compute/recipes
git pull origin main
cd backend
npm install --production
pm2 restart recipes-backend
```

