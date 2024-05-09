import express from "express"
import { createForm } from "../controllers/form.controller.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = express.Router();


router.route("/").post(verifyJWT,createForm);


export default router