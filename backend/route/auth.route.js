import express from "express"
import { signupRoute, loginRoute } from "../controllers/auth.controller.js";

const router = express.Router()

router.post("/signup", signupRoute);
router.post("/login", loginRoute);

export default router
