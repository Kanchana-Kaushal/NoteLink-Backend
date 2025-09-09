import { Router } from "express";
import {
    follow,
    getUserInfo,
    unfollow,
    updateProfile,
} from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/user/profile/:userId", verifyUser, getUserInfo);

userRouter.put("/user/update", verifyUser, updateProfile);

userRouter.post("/user/follow/:followingUserId", verifyUser, follow);

userRouter.post("/user/unfollow/:unfollowUserId", verifyUser, unfollow);

export default userRouter;
