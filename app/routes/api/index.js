import express from "express"
import { router as authRoute } from "./auth.js";
export const router = express.Router();

router.use("/auth",authRoute);
