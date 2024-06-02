import express from "express"
import { router as authRoute } from "./auth.js";
import { router as messageRoute } from "./message.js";
import { router as userRoute } from "./user.js";
import { router as storyRoute } from "./story.js";
import { verifyToken } from "../../middleware/verifyJWT.js";
export const router = express.Router();

router.use("/auth",authRoute);
// Auth <Routes>
router.use(verifyToken)
router.use("/",messageRoute);
router.use("/users",userRoute);
router.use("/stories",storyRoute);


