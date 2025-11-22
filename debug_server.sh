#!/bin/bash
# Run this script on your server to debug the blank page issue

echo "=== Checking React Build ==="
cd /home/compute/recipes
ls -la frontend-react/dist/ 2>&1 | head -20

echo -e "\n=== Checking if index.html exists ==="
ls -la frontend-react/dist/index.html 2>&1

echo -e "\n=== Checking nginx config ==="
sudo nginx -t

echo -e "\n=== Checking nginx root path ==="
sudo grep -A 5 "location /" /etc/nginx/sites-enabled/* 2>/dev/null || sudo grep -A 5 "location /" /etc/nginx/conf.d/* 2>/dev/null || sudo grep -A 5 "location /" /etc/nginx/nginx.conf

echo -e "\n=== Checking nginx error logs (last 20 lines) ==="
sudo tail -20 /var/log/nginx/error.log

echo -e "\n=== Checking nginx access logs (last 10 lines) ==="
sudo tail -10 /var/log/nginx/access.log

echo -e "\n=== Checking if backend is running ==="
curl -s http://localhost:3000/api/health || echo "Backend not responding"

echo -e "\n=== Checking file permissions ==="
ls -la frontend-react/dist/ | head -5

echo -e "\n=== Checking if React build needs to be created ==="
if [ ! -d "frontend-react/dist" ]; then
    echo "❌ frontend-react/dist does not exist!"
    echo "Run: cd frontend-react && npm install && npm run build"
fi

