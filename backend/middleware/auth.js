/**
 * Authentication Middleware
 * JWT-based authentication for admin routes
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT secret - should be in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'numves-secret-key-change-in-production-2024';
const JWT_EXPIRATION = '24h'; // Token expires in 24 hours

// Define users with hashed passwords
// Password hashes generated with bcrypt (cost factor: 10)
const USERS = {
  'pablo': '$2b$10$5ygU4xmKoh62x.Zgia3vAu6eZjHdf0uNWXCWbFhuZupxbNN5pAzLW', // 200305cortes
  'vale': '$2b$10$mRh75v0kM0gds7qb5goNnexdE9aTBcQNROtSm7asgr3tH2/gW4cqu',  // Nuves2025..
  'nico': '$2b$10$LylN5McEIBNeWPsuaR5ZsOeKhrv1ZQgv2vyJFhzjPcCdafjR.NuR.'   // elchoromaximo
};

/**
 * Login function - verifies credentials and generates JWT
 * @param {string} username 
 * @param {string} password 
 * @returns {object} { success: boolean, token?: string, username?: string, error?: string }
 */
const login = (username, password) => {
  // Normalize username to lowercase
  const normalizedUsername = username.toLowerCase();
  
  // Check if user exists
  const hashedPassword = USERS[normalizedUsername];
  
  if (!hashedPassword) {
    return { 
      success: false, 
      error: 'Invalid credentials' 
    };
  }

  // Verify password
  const isValid = bcrypt.compareSync(password, hashedPassword);
  
  if (!isValid) {
    return { 
      success: false, 
      error: 'Invalid credentials' 
    };
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      username: normalizedUsername,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  return {
    success: true,
    token,
    username: normalizedUsername
  };
};

/**
 * Middleware to authenticate admin requests
 * Expects Authorization header: Bearer <JWT>
 */
const authenticate = (req, res, next) => {
  // Skip auth for health check and public recipe endpoints
  if (req.path === '/api/health' || 
      req.path === '/api/login' ||
      req.path.startsWith('/api/recipes/manifest') ||
      req.path.startsWith('/api/recipes/file/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide Authorization header: Bearer <token>' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify JWT token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication failed. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
};

module.exports = { authenticate, login, JWT_SECRET, JWT_EXPIRATION };
