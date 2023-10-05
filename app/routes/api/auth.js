import express from "express"
import { handleLogin,handleLogout,handleRefreshToken } from "../../controllers/auth/authController.js"
import { handleNewUser } from "../../controllers/auth/registerController.js";

export const router = express.Router();

router.post("/login",handleLogin);
router.post("/register",handleNewUser);
router.post("/logout",handleLogout);
router.post("/refreshtoken",handleRefreshToken);

