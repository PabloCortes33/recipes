# React Migration Complete ✅

All frontend functionality has been migrated to React. The old HTML files have been removed.

## What Changed

### ✅ Migrated to React
- **Recipe Generator** (`/admin`) - Create and store recipes
- **Jobs Dashboard** (`/jobs`) - Manage recipe jobs
- **Recipe Browser** (`/browse`) - Browse recipe collection
- **Recipe Viewer** (`/recipe/:path`) - View individual recipes
- **Recipe Ideas** - Brainstorming section

### ✅ Backend Changes
- Removed static file serving (`express.static`)
- Added CORS support for React frontend
- Added API endpoints:
  - `GET /api/recipes/manifest` - Get recipe structure
  - `GET /api/recipes/file/:path` - Get individual recipe file
- Backend is now API-only

### ✅ Deleted Files
- `backend/public/index.html` (old admin UI)
- `backend/public/jobs.html` (old jobs dashboard)
- `backend/public/` directory (empty, removed)

## Nginx Configuration Update Required

**⚠️ IMPORTANT**: Your nginx configuration needs to be updated to serve the React app instead of the old HTML files.

### Current Setup (Old)
Nginx was likely serving `backend/public/index.html` directly.

### New Setup Required
Nginx should:
1. Serve React build from `frontend-react/dist/`
2. Proxy `/api/*` requests to backend (port 3000)
3. Handle React Router (serve `index.html` for all routes)

See `NGINX_CONFIG.md` for the complete nginx configuration.

### Quick Nginx Update

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React app
    root /home/compute/recipes/frontend-react/dist;
    index index.html;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Deployment Steps

1. **Build React app**:
   ```bash
   cd frontend-react
   npm run build
   ```

2. **Update nginx config** (see `NGINX_CONFIG.md`)

3. **Restart services**:
   ```bash
   # Restart backend (if needed)
   pm2 restart recipes-backend
   
   # Reload nginx
   sudo systemctl reload nginx
   ```

4. **Test**:
   - Visit your domain - should see React app
   - Test `/browse` - recipe browser
   - Test `/admin` - recipe generator
   - Test `/jobs` - jobs dashboard

## Routes

- `/` or `/browse` - Recipe Browser (default/public view)
- `/admin` - Recipe Generator (admin interface)
- `/jobs` - Jobs Dashboard
- `/recipe/:path` - Individual recipe viewer
- `/api/*` - Backend API (proxied to port 3000)

## Development

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend-react
npm run dev
```

Frontend dev server runs on `http://localhost:5173` and proxies `/api` to backend.

## Production

Both services run via PM2:
- `recipes-backend` - API server (port 3000)
- `recipes-frontend` - React preview server (port 5173) OR serve static files via nginx

**Recommended**: Serve React build via nginx (see `NGINX_CONFIG.md`) instead of running preview server.

