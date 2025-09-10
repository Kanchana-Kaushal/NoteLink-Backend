import { Request, Response, NextFunction } from "express";
import Notes from "../models/note.model.js";
import HttpError from "../utils/HttpError.js";
import Comments from "../models/comments.model.js";
import { Payload } from "../utils/jwt.util.js";
import mongoose from "mongoose";

export const saveComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { noteId, parentCommentId, message } = req.body;
    const userId = req.user?.userId;

    try {
        const note = await Notes.findById(noteId);
        if (!note) throw new HttpError("Note not found", 404);

        const newComment = await Comments.create({
            noteId,
            parentCommentId: parentCommentId || null,
            userId,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Comment saved successfully",
            comment: newComment,
        });
    } catch (err) {
        next(err);
    }
};

export const likeComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;
    const { commentId } = req.params;

    try {
        const comment = await Comments.findById(commentId);
        if (!comment) throw new HttpError("Comment not found", 404);

        // Already liked?
        if (comment.likes.some((id) => id.equals(tokenUser.userId))) {
            throw new HttpError("You already liked this comment", 400);
        }

        comment.likes.push(new mongoose.Types.ObjectId(tokenUser.userId));
        await comment.save();

        res.json({
            success: true,
            message: "Comment liked successfully",
            likesCount: comment.likes.length,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;

    try {
        const comment = await Comments.findById(commentId);
        if (!comment) throw new HttpError("Comment not found", 404);

        if (comment.userId.toString() !== userId) {
            throw new HttpError("You can only delete your own comments", 403);
        }

        await comment.deleteOne();

        res.json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const hideComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;
    const { commentId } = req.params;

    try {
        const comment = await Comments.findById(commentId).populate("noteId");
        if (!comment) throw new HttpError("Comment not found", 404);

        // Check permissions
        const isCommentOwner = comment.userId.toString() === tokenUser.userId;
        const isNoteOwner =
            (comment.noteId as any).userId.toString() === tokenUser.userId;
        const isAdmin = tokenUser.role === "admin";

        if (!isCommentOwner && !isNoteOwner && !isAdmin) {
            throw new HttpError(
                "You are not allowed to hide this comment",
                403
            );
        }

        comment.hidden = true;
        await comment.save();

        res.json({
            success: true,
            message: "Comment hidden successfully",
        });
    } catch (err) {
        next(err);
    }
};
