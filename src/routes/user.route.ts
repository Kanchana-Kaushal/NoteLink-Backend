import { Router } from "express";
import {
    changeEmail,
    follow,
    getAllUsers,
    getUserInfo,
    submitReport,
    unfollow,
    updateProfile,
} from "../controllers/user.controller.js";
import {
    verifyAdmin,
    verifyOTP,
    verifyUser,
} from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/user/profile/:userId", verifyUser, getUserInfo);

userRouter.get("/", verifyAdmin, getAllUsers);

userRouter.put("/user/update", verifyUser, updateProfile);

userRouter.post("/user/follow/:followingUserId", verifyUser, follow);

userRouter.post("/user/unfollow/:unfollowUserId", verifyUser, unfollow);

userRouter.post("/user/report-note", verifyUser, submitReport);

userRouter.put("/user/change-email", verifyUser, verifyOTP, changeEmail);

export default userRouter;
