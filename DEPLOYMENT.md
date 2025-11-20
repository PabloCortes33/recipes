# Deployment Guide - React Frontend + API Backend

This guide covers deploying the refactored React frontend with API-only backend.

## Architecture

- **Backend**: Express API server (port 3000)
- **Frontend**: React app built with Vite (port 5173)
- **Process Manager**: PM2 for both services

## Prerequisites

- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- Git repository cloned
- Environment variables configured

## Setup Steps

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend-react
npm install
```

### 2. Build Frontend

```bash
cd frontend-react
npm run build
```

This creates a `dist/` folder with the production build.

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3000
REPO_PATH=/home/compute/recipes
GITHUB_TOKEN=ghp_your_token
GITHUB_REPO=origin
CLAUDE_PATH=/home/pablo/.nvm/versions/node/v20.19.5/bin/claude
```

**Frontend** (`frontend-react/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Start with PM2

```bash
# From project root
pm2 start ecosystem.config.js

# Or start individually:
pm2 start backend/server.js --name recipes-backend
cd frontend-react && pm2 start npm --name recipes-frontend -- run preview
```

### 5. Configure Nginx (Optional - for production)

If you want to serve both on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs recipes-backend

# Restart backend
pm2 restart recipes-backend

# Stop backend
pm2 stop recipes-backend

# Delete backend
pm2 delete recipes-backend

# Save PM2 configuration
pm2 save
pm2 startup  # Generate startup script
```

**Note**: Frontend is served via nginx as static files (no PM2 process needed).

## Development Workflow

### Local Development

1. **Backend**: `cd backend && npm start` (or `npm run dev` with nodemon)
2. **Frontend**: `cd frontend-react && npm run dev`

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

### Production Deployment

1. **Build frontend**: 
   ```bash
   cd frontend-react
   npm run build
   ```
   This creates `frontend-react/dist/` with static files.

2. **Start backend with PM2**: 
   ```bash
   pm2 start backend/server.js --name recipes-backend
   ```

3. **Configure nginx** to serve React app (see `NGINX_CONFIG.md`)

4. **Access**:
   - Frontend: `http://your-domain.com` (served by nginx)
   - Backend API: `http://your-domain.com/api` (proxied to port 3000)

## Troubleshooting

### Frontend can't connect to backend

- Check `VITE_API_URL` is set correctly
- Verify backend is running on port 3000
- Check CORS settings in backend (should allow all origins in dev)

### PM2 processes not starting

- Check Node.js version: `node --version` (needs 18+)
- Check logs: `pm2 logs`
- Verify paths in `ecosystem.config.js` are correct

### Build fails

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Review build errors in console

## Updating

```bash
# Pull latest code
git pull origin main

# Rebuild frontend
cd frontend-react
npm run build

# Restart PM2
pm2 restart all
```

