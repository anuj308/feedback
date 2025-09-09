import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// Middleware that optionally verifies JWT but doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    // If no token, continue without setting user
    if (!token) {
      req.user = null;
      return next();
    }

    // If token exists, try to verify it
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      
      if (user) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Invalid token, but continue without user
      console.warn("Invalid token in optional auth:", error.message);
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error("Error in optional auth middleware:", error);
    req.user = null;
    next();
  }
};
