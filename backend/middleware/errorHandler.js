/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'EACCES' || err.code === 'EPERM') {
    statusCode = 403;
    message = 'Permission denied';
  }

  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.details,
      stack: err.stack 
    })
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler
};

