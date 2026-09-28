const rateLimit = require('express-rate-limit');

// Rate limiter for AI generation routes (max 15 requests per 15 minutes per IP)
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests from this IP. Please try again after 15 minutes.' },
});

module.exports = { aiRateLimiter };
