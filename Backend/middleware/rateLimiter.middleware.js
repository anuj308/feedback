import rateLimit from 'express-rate-limit';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Industry standard: ~33 requests per minute
  message: {
    error: 'Too many requests from this IP, please try again in a few minutes.',
    statusCode: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for form viewing (but not creation/editing)
    return req.method === 'GET' && req.path.includes('/form/f/');
  }
});

// Authentication rate limiting - more restrictive
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased from 5 to 10 auth attempts per windowMs
  message: {
    error: 'Too many login attempts. Please wait 15 minutes before trying again.',
    statusCode: 429
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Google OAuth specific rate limiting
export const googleAuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes (increased window)
  max: 15, // Industry standard: 15 attempts per 10 minutes
  message: {
    error: 'Too many Google sign-in attempts. Please wait 10 minutes before trying again.',
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
    error: 'Too many password reset attempts. Please wait 1 hour before trying again.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Form submission rate limiting (separate from general API)
export const formSubmissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Allow 10 form submissions per 5 minutes per IP
  message: {
    error: 'Too many form submissions. Please wait 5 minutes before submitting again.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});
