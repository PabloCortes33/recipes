# Nginx Configuration for React Frontend

Since everything is now in React, your nginx should serve the React app and proxy API requests to the backend.

## Production Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React app (built static files)
    root /home/compute/recipes/frontend-react/dist;
    index index.html;

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve recipe files directly (for backward compatibility if needed)
    location /recipes {
        alias /home/compute/recipes/recipes;
        default_type text/markdown;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SSL Configuration (HTTPS)

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Same configuration as above
    root /home/compute/recipes/frontend-react/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Important Notes

1. **React Router**: The `try_files $uri $uri/ /index.html;` directive ensures React Router works correctly for all routes.

2. **API Proxy**: All `/api/*` requests are proxied to the backend running on port 3000.

3. **Build Path**: Make sure to build the React app before deploying:
   ```bash
   cd frontend-react
   npm run build
   ```

4. **Static Files**: The React build output is in `frontend-react/dist/` - this is what nginx serves.

5. **Backend**: The backend runs separately on port 3000 (via PM2) and only handles API requests.

## Testing

After updating nginx config:

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Or restart
sudo systemctl restart nginx
```

## Routes

- `/` or `/admin` - Recipe Generator (admin interface)
- `/browse` - Recipe Browser (public recipe collection)
- `/recipe/:path` - Individual recipe viewer
- `/jobs` - Jobs Dashboard
- `/api/*` - Backend API (proxied to port 3000)
