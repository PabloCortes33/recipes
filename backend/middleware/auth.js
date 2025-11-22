/**
 * Authentication Middleware
 * Simple password-based authentication for admin routes
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.PASSWORD;

/**
 * Middleware to authenticate admin requests
 * Expects Authorization header: Bearer <password>
 */
const authenticate = (req, res, next) => {
  // Skip auth for health check and public recipe endpoints
  if (req.path === '/api/health' || 
      req.path.startsWith('/api/recipes/manifest') ||
      req.path.startsWith('/api/recipes/file/')) {
    return next();
  }

  if (!ADMIN_PASSWORD) {
    console.warn('⚠️  WARNING: ADMIN_PASSWORD not set. Admin routes are unprotected!');
    return res.status(500).json({ 
      error: 'Server configuration error: Authentication not configured' 
    });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide Authorization header: Bearer <password>' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ 
      error: 'Invalid credentials',
      message: 'Authentication failed' 
    });
  }

  next();
};

module.exports = { authenticate };

