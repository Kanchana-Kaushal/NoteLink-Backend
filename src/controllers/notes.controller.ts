import { NextFunction, Request, Response } from "express";
import { Payload } from "../utils/jwt.util.js";
import HttpError from "../utils/HttpError.js";
import User from "../models/user.model.js";
import Notes from "../models/note.model.js";
import mongoose from "mongoose";

export const uploadNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { course, title, subTitle, url, description, university } = req.body;

    const tokenInfo = req.user as Payload;

    try {
        const user = await User.findById(tokenInfo.userId);

        if (!user) throw new HttpError("User does not exists", 401);

        const note = new Notes({
            course,
            title,
            subTitle,
            url,
            description,
            metaData: { university: university },
            userId: tokenInfo.userId,
        });

        const savedNote = await note.save();
        user.notes.push(savedNote._id);
        await user.save();

        res.json({
            success: true,
            message: "Note uploaded successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const deletNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const noteId = req.params.noteId;
    const tokenUser = req.user as Payload;

    try {
        const note = await Notes.findOne({
            _id: noteId,
            userId: tokenUser.userId,
        });

        if (!note) throw new HttpError("Cannot find the note", 404);

        const deleted = await Notes.findByIdAndDelete(noteId);

        const user = await User.findById(deleted?.userId);

        if (!user) throw new HttpError("Cannot find the user", 404);

        user.notes = user.notes.filter((note) => !note.equals(noteId));
        await user.save();

        res.json({
            success: true,
            message: "Note deleted successfully",
            deleted,
        });
    } catch (err) {
        next(err);
    }
};

export const updateNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const noteId = req.params.noteId;
    const user = req.user as Payload;
    const updateFields = req.body;

    const course = updateFields.course;
    const title = updateFields.title;
    const subTitle = updateFields.subtitile;
    const url = updateFields.url;
    const description = updateFields.description;
    const university = updateFields.university;

    try {
        const note = await Notes.findOne({ _id: noteId, userId: user.userId });

        if (!note) throw new HttpError("Cannot find note", 404);

        const updatedNote = await Notes.findByIdAndUpdate(
            noteId,
            {
                course,
                title,
                subTitle,
                url,
                description,
                metaData: { university },
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Note updated successfully",
            note: updatedNote,
        });
    } catch (err) {
        next(err);
    }
};

export const upvoteNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const noteId = new mongoose.Types.ObjectId(req.params.noteId);

    try {
        const note = await Notes.findById(noteId);

        if (!note) throw new HttpError("Note not found", 404);

        // Ensure metaData is initialized
        note.metaData = note.metaData ?? {
            downloads: 0,
            saves: [],
            upvotes: [],
        };

        // If already upvoted
        if (note.metaData.upvotes.some((id) => id.equals(userId))) {
            throw new HttpError("You already upvoted this note", 400);
        }

        note.metaData.upvotes.push(userId);
        await note.save();

        res.status(200).json({
            success: true,
            message: "Note upvoted successfully",
            upvotesCount: note.metaData.upvotes.length,
            upvotes: note.metaData.upvotes,
        });
    } catch (err) {
        next(err);
    }
};

export const removeUpvote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const noteId = new mongoose.Types.ObjectId(req.params.noteId);

    try {
        const note = await Notes.findById(noteId);

        if (!note) throw new HttpError("Note not found", 404);

        note.metaData = note.metaData ?? {
            downloads: 0,
            saves: [],
            upvotes: [],
        };

        // If not upvoted
        if (!note.metaData.upvotes.some((id) => id.equals(userId))) {
            throw new HttpError("You have not upvoted this note", 400);
        }

        note.metaData.upvotes = note.metaData.upvotes.filter(
            (id) => !id.equals(userId)
        );
        await note.save();

        res.status(200).json({
            success: true,
            message: "Upvote removed successfully",
            upvotesCount: note.metaData.upvotes.length,
            upvotes: note.metaData.upvotes,
        });
    } catch (err) {
        next(err);
    }
};
