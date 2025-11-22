/**
 * Rate Limiting Middleware
 * Prevents API abuse with configurable limits
 */

// In-memory store for rate limiting (use Redis in production)
const requestStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.resetTime > 0) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware factory
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests default
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    // Skip rate limiting for health checks
    if (req.path === '/api/health') {
      return next();
    }

    // Get client identifier (IP address)
    const clientId = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     'unknown';

    const key = `${clientId}:${req.path}`;
    const now = Date.now();
    
    let record = requestStore.get(key);
    
    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      requestStore.set(key, record);
      return next();
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter
      });
    }

    next();
  };
};

// Pre-configured rate limiters
const rateLimiters = {
  // Strict limit for admin endpoints
  admin: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes
    message: 'Too many admin requests. Please slow down.'
  }),
  
  // Moderate limit for recipe generation
  recipeGeneration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 recipe generations per hour
    message: 'Too many recipe generation requests. Please wait before generating more recipes.'
  }),
  
  // Lenient limit for public endpoints
  public: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: 'Too many requests. Please try again later.'
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters
};

