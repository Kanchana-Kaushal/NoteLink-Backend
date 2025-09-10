import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
    deleteComment,
    hideComment,
    likeComment,
    saveComment,
} from "../controllers/comments.controller.js";

const commentsRouter = Router();

commentsRouter.post("/add-comment", verifyUser, saveComment);

commentsRouter.post("/like/:commentId", verifyUser, likeComment);

commentsRouter.delete("/delete/:commentId", verifyUser, deleteComment);

commentsRouter.post("/hide/:commentId", verifyUser, hideComment);

export default commentsRouter;
