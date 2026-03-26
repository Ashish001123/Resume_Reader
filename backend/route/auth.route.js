import express from "express"
import { signupRoute } from "../controllers/auth.controller.js";

const router = express.Router()

router.get("/signup", signupRoute);

export default router
