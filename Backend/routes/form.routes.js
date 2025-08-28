import express from "express";
import {
  createForm,
  deleteForm,
  updateForm,
  getAllFormByOwnerId,
  getForm,
  renameForm,
  toogleResponses,
} from "../controllers/form.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();


router.route("/create").post(verifyJWT, createForm)
router
  .route("/f/:formId")
  .get(verifyJWT, getForm)
  .delete(verifyJWT, deleteForm)
  .patch(verifyJWT, renameForm)
  .post(verifyJWT, updateForm);

router.route("/o/:ownerId").get(verifyJWT,getAllFormByOwnerId)

router.route("/admin/:formId").get(verifyJWT,toogleResponses)


export default router;
