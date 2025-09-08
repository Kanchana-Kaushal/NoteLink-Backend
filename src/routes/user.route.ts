import { Router } from "express";
import { getUserInfo } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/user/profile/:userId", verifyUser, getUserInfo); // send notes too

export default userRouter;
