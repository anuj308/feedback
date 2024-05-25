import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getAllResponsesByFormId, storeForm } from "../controllers/store.controller.js";

const router = express.Router();

router.route("/").post(verifyJWT, storeForm)
router.route("/:formId").get(verifyJWT,getAllResponsesByFormId)

export default router;
