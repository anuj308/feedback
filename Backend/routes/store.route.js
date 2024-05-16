import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { storeForm } from "../controllers/store.controller.js";

const router = express.Router();

router.route("/").post(verifyJWT, storeForm);

export default router;
