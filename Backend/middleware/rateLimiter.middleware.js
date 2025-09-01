import rateLimit from 'express-rate-limit';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Authentication rate limiting - more restrictive
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    statusCode: 429
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Google OAuth specific rate limiting
export const googleAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 Google auth attempts per windowMs
  message: {
    error: 'Too many Google authentication attempts, please try again later.',
    statusCode: 429
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});
