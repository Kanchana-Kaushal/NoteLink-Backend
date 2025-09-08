import { NextFunction, Request, Response } from "express";
import { Payload } from "../utils/jwt.util.js";
import HttpError from "../utils/HttpError.js";
import User from "../models/user.model.js";
import Notes from "../models/note.model.js";

interface NoteBody {
    course: string;
    title: string;
    subTitle: string | undefined | null;
    url: string;
    description: string | undefined | null;
    university?: string | undefined | null;
    userId: string;
}

export const uploadNote = async (
    req: Request<{}, {}, NoteBody>,
    res: Response,
    next: NextFunction
) => {
    const { course, title, subTitle, url, description, university } = req.body;

    const tokenInfo = req.user as Payload;

    try {
        const user = await User.findById(tokenInfo.userId);

        if (!user) {
            throw new HttpError("User does not exists", 401);
        }

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
    const tokenUser = req.user;

    try {
        const note = await Notes.findById(noteId);

        if (!note) {
            throw new HttpError("Cannot find the note", 404);
        }

        if (!note.userId.equals(tokenUser?.userId)) {
            throw new HttpError("Cannot delete someone else's notes", 401);
        }

        const deleted = await Notes.findByIdAndDelete(noteId);

        const user = await User.findById(deleted?.userId);

        if (!user) {
            throw new HttpError("Cannot find the user", 404);
        }

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
