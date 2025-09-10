import { Router } from "express";
import {
    checkAdmin,
    login,
    register,
    requestOTP,
    resetPassword,
} from "../controllers/auth.controller.js";
import { verifyOTP, verifyUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", verifyOTP, register);

authRouter.post("/login", login);

authRouter.get("/check-admin", verifyUser, checkAdmin);

authRouter.get("/request-otp/:email", requestOTP);

authRouter.post("/reset-password", verifyOTP, resetPassword);

export default authRouter;
