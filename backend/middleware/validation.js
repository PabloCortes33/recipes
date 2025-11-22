/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs
 */

/**
 * Validates recipe generation request
 */
const validateRecipeGeneration = (req, res, next) => {
  const { prompt, mode } = req.body;
  const errors = [];

  // Validate prompt
  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  } else if (prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  } else if (prompt.length > 5000) {
    errors.push('Prompt must be less than 5000 characters');
  }

  // Validate mode
  if (mode && mode !== 'create' && mode !== 'store') {
    errors.push('Mode must be either "create" or "store"');
  }

  // Sanitize prompt (remove potential XSS)
  if (prompt) {
    req.body.prompt = prompt.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Validates commit request
 */
const validateCommit = (req, res, next) => {
  const { commitMessage } = req.body;
  const errors = [];

  if (commitMessage && typeof commitMessage !== 'string') {
    errors.push('Commit message must be a string');
  } else if (commitMessage && commitMessage.length > 200) {
    errors.push('Commit message must be less than 200 characters');
  }

  // Sanitize commit message
  if (commitMessage) {
    req.body.commitMessage = commitMessage.trim().replace(/[<>]/g, '');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Validates recipe path to prevent path traversal
 */
const validateRecipePath = (req, res, next) => {
  const pathParam = req.params.path || req.params[0];
  
  if (!pathParam) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  // Check for path traversal attempts
  if (pathParam.includes('..') || pathParam.includes('//')) {
    return res.status(403).json({ error: 'Invalid path' });
  }

  // Check for null bytes
  if (pathParam.includes('\0')) {
    return res.status(403).json({ error: 'Invalid path' });
  }

  next();
};

module.exports = {
  validateRecipeGeneration,
  validateCommit,
  validateRecipePath
};

