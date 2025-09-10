import { Router } from "express";
import { checkAdmin, login, register } from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/check-admin", verifyUser, checkAdmin);

export default authRouter;
