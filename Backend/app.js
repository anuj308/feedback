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
      ? [process.env.CORS_ORIGIN, `https://www.${process.env.CORS_ORIGIN?.replace('https://', '')}`]
      : process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })
);

console.log(process.env.CORS_ORIGIN)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("uploads"));
app.use(cookieParser());

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

export { app };
