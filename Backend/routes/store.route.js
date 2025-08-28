import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  deleteResponses,
  getAllResponsesByFormId,
  storeForm,
} from "../controllers/store.controller.js";

const router = express.Router();

router.route("/").post(verifyJWT, storeForm);
router
  .route("/f/:formId")
  .get(verifyJWT, getAllResponsesByFormId)
  
router.route("/s/:storeId").delete(verifyJWT, deleteResponses);

export default router;
