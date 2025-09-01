import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

// Security middleware
app.use(generalLimiter); // Apply general rate limiting to all routes

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://feedback-red-seven.vercel.app',
          process.env.CORS_ORIGIN,
          `https://www.${process.env.CORS_ORIGIN?.replace('https://', '')}`
        ].filter(Boolean)
      : process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

console.log(process.env.CORS_ORIGIN)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("uploads"));
app.use(cookieParser(process.env.SESSION_SECRET || 'fallback-cookie-secret'));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// import routes
import userRouter from "./routes/user.route.js";
import formRouter from "./routes/form.routes.js";
import storeRouter from "./routes/store.route.js";
import healthRouter from "./routes/health.routes.js";

// routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/form", formRouter);
app.use("/api/v1/store", storeRouter);
app.use("/api/v1", healthRouter); // Health check routes

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

export { app };
