module.exports = {
  apps: [
    {
      name: 'recipes-backend',
      script: './backend/server.js',
      cwd: '/home/compute/recipes',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/pablo/.pm2/logs/recipes-backend-error.log',
      out_file: '/home/pablo/.pm2/logs/recipes-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    // Frontend is served via nginx (static files from frontend-react/dist)
    // No need to run preview server in production
    // Build command: cd frontend-react && npm run build
  ],
};

