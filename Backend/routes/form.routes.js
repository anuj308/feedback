import express from "express";
import {
  createForm,
  deleteForm,
  updateForm,
  getAllFormByOwnerId,
  getForm,
  renameForm,
  toogleResponses,
  getFormAnalytics,
  getFormResponses,
  updateFormSettings,
} from "../controllers/form.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();


router.route("/create").post(verifyJWT, createForm)
router
  .route("/f/:formId")
  .get(verifyJWT, getForm)
  .delete(verifyJWT, deleteForm)
  .patch(verifyJWT, renameForm)
  .post(verifyJWT, updateForm);

router.route("/o").get(verifyJWT,getAllFormByOwnerId)

router.route("/admin/:formId").get(verifyJWT,toogleResponses)

// New analytics routes
router.route("/analytics/:formId").get(verifyJWT, getFormAnalytics)
router.route("/responses/:formId").get(verifyJWT, getFormResponses)
router.route("/settings/:formId").patch(verifyJWT, updateFormSettings)


export default router;
