import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }, 'Server is healthy'));
});

// Ready check endpoint (for Kubernetes/Docker)
router.get('/ready', (req, res) => {
  // Add any additional readiness checks here (database, external services, etc.)
  res.status(200).json(new ApiResponse(200, {
    status: 'READY',
    timestamp: new Date().toISOString(),
  }, 'Server is ready'));
});

export default router;
