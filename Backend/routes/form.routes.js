import express from "express";
import {
  createForm,
  deleteForm,
  updateForm,
  getAllFormByOwnerId,
  getForm,
  getFormForEdit,
  renameForm,
  toogleResponses,
  getFormAnalytics,
  getFormResponses,
  updateFormSettings,
  deleteAllResponses,
  publishForm,
} from "../controllers/form.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();


router.route("/create").post(verifyJWT, createForm)
router
  .route("/f/:formId")
  .get(getForm) // Public form viewing (for form submissions)
  .delete(verifyJWT, deleteForm)
  .patch(verifyJWT, renameForm)
  .post(verifyJWT, updateForm);

// New route for getting form for editing (owner only, can access unpublished forms)
router.route("/edit/:formId").get(verifyJWT, getFormForEdit);

router.route("/o").get(verifyJWT,getAllFormByOwnerId)

router.route("/admin/:formId").patch(verifyJWT,toogleResponses)

// New analytics routes
router.route("/analytics/:formId").get(verifyJWT, getFormAnalytics)
router.route("/responses/:formId").get(verifyJWT, getFormResponses)
router.route("/responses/:formId").delete(verifyJWT, deleteAllResponses)
router.route("/settings/:formId").patch(verifyJWT, updateFormSettings)
router.route("/publish/:formId").patch(verifyJWT, publishForm)


export default router;
