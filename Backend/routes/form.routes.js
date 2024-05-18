import express from "express";
import { createForm, deleteForm, getAllForm, getForm, renameForm } from "../controllers/form.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getAllForm)
router.route("/create").post(verifyJWT, createForm)
router.route("/f/:formId").get(verifyJWT,getForm).delete(verifyJWT,deleteForm).patch(verifyJWT,renameForm)

export default router;
