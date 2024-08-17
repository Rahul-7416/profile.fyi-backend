import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
} from "../controllers/user.controllers.js";

const router = Router();

// register
router.route("/register").post(registerUser);

// login
router.route("/login").post(loginUser);

// secured routes

// refresh accessToken
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

// logout 
router.route("/logout").post(verifyJWT, logoutUser);

export default router;