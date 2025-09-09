import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  deleteResponses,
  getAllResponsesByFormId,
  storeForm,
  getResponseAnalytics,
} from "../controllers/store.controller.js";

const router = express.Router();

router.route("/").post(storeForm); // Remove auth - handle in controller
router
  .route("/f/:formId")
  .get(verifyJWT, getAllResponsesByFormId)
  
router.route("/s/:storeId").delete(verifyJWT, deleteResponses);

// New analytics route
router.route("/analytics/:formId").get(verifyJWT, getResponseAnalytics);

export default router;
