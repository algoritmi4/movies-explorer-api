const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: 'Too many requests created from this IP, please try again after 10 min',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
