import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserSettings,
  googleAuth,
  getGoogleAuthUrl,
  initiateGoogleAuth,
  handleGoogleCallback,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authLimiter, googleAuthLimiter } from "../middleware/rateLimiter.middleware.js";
import multer from "multer";

const router = Router();

router.route("/register").post(authLimiter, upload.single("avatar"), registerUser);

router.route("/login").post(authLimiter, loginUser);

// Google OAuth routes - Server-side flow
router.route("/auth/google").get(initiateGoogleAuth);
router.route("/auth/google/callback").get(handleGoogleCallback);

// Legacy routes (keep for backward compatibility)
router.route("/google/auth-url").get(getGoogleAuthUrl);
router.route("/google/auth").post(googleAuthLimiter, googleAuth);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-settings").put(verifyJWT, updateUserSettings);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// router
//   .route("/cover-image")
//   .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
// router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;
