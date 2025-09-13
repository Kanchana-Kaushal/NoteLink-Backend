import { NextFunction, Request, Response } from "express";
import { Payload } from "../utils/jwt.util.js";
import HttpError from "../utils/HttpError.js";
import User from "../models/user.model.js";
import Notes from "../models/note.model.js";
import mongoose from "mongoose";
import Comments from "../models/comments.model.js";

export const uploadNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { course, title, subject, url, description, university } = req.body;

    const tokenInfo = req.user as Payload;

    try {
        const user = await User.findById(tokenInfo.userId);

        if (!user) throw new HttpError("User does not exists", 401);

        const note = new Notes({
            course,
            title,
            subject,
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

export const getNoteInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return next(new HttpError("Invalid note ID", 400));
    }

    try {
        const note = await Notes.findById(noteId)
            .populate({
                path: "userId",
                model: User,
                select: "_id fName lName avatar university degree",
            })
            .lean();

        if (!note || note.hidden) {
            throw new HttpError("Note not found", 404);
        }

        const comments = await Comments.find({ noteId, hidden: false })
            .populate({
                path: "userId",
                model: User,
                select: "_id fName lName avatar",
            })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            message: "Note info fetched successfully",
            note,
            comments,
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
    const url = updateFields.url;
    const description = updateFields.description;
    const university = updateFields.university;
    const subject = updateFields.subject;

    try {
        const note = await Notes.findOne({ _id: noteId, userId: user.userId });

        if (!note) throw new HttpError("Cannot find note", 404);

        const updatedNote = await Notes.findByIdAndUpdate(
            noteId,
            {
                course,
                title,
                subject,
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

        // ensure metaData exists
        note.metaData = note.metaData ?? { downloads: 0, upvotes: [] };

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

export const downloadNote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const noteId = new mongoose.Types.ObjectId(req.params.noteId);

    try {
        const note = await Notes.findById(noteId);
        if (!note) throw new HttpError("Note not found", 404);

        // ensure metaData exists
        note.metaData = note.metaData ?? { downloads: 0, upvotes: [] };

        // increment downloads
        note.metaData.downloads = (note.metaData.downloads ?? 0) + 1;
        await note.save();

        res.status(200).json({
            success: true,
            message: "Download recorded successfully",
            downloads: note.metaData.downloads,
            noteId: note._id,
            url: note.url,
        });
    } catch (err) {
        next(err);
    }
};

export const searchNotes = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { query, page = "1", limit = "10" } = req.query;
    const sortBy = (req.query.sortBy as string) || "relevance";
    const sortOrder = (req.query.sortOrder as string) || "desc";
    const university = (req.user as Payload)?.university || null;

    try {
        if (!query || typeof query !== "string" || query.length < 2) {
            throw new HttpError("A valid query required", 400);
        }

        const pageNum = Math.max(parseInt(page as string, 10), 1);
        const limitNum = Math.min(
            Math.max(parseInt(limit as string, 10), 1),
            20
        );

        const notes = await Notes.aggregate([
            // Stage 1: match search + visibility
            { $match: { $text: { $search: query }, hidden: false } },

            // Stage 2: add computed fields
            {
                $addFields: {
                    score: { $meta: "textScore" },
                    sameUni: {
                        $cond: [
                            { $eq: ["$metaData.university", university] },
                            1,
                            0,
                        ],
                    },
                    upvotesCount: {
                        $size: { $ifNull: ["$metaData.upvotes", []] },
                    },
                    downloadsCount: {
                        $ifNull: ["$metaData.downloads", 0],
                    },
                },
            },

            // Stage 3: ranking formula
            {
                $addFields: {
                    rank: {
                        $add: [
                            { $multiply: ["$score", 3] }, // text relevance
                            { $multiply: ["$sameUni", 2] }, // same uni boost
                            {
                                $cond: [
                                    { $gt: ["$downloadsCount", 0] },
                                    { $log: [10, "$downloadsCount"] },
                                    0,
                                ],
                            },
                            { $multiply: ["$upvotesCount", 0.5] }, // weighted upvotes
                        ],
                    },
                },
            },

            // Stage 4: sorting
            {
                $sort:
                    sortBy === "date"
                        ? { createdAt: sortOrder === "asc" ? 1 : -1 }
                        : sortBy === "downloads"
                        ? { downloadsCount: sortOrder === "asc" ? 1 : -1 }
                        : sortBy === "upvotes"
                        ? { upvotesCount: sortOrder === "asc" ? 1 : -1 }
                        : { rank: -1, createdAt: -1 }, // default = relevance
            },

            // Stage 5: join user details
            {
                $lookup: {
                    from: "users", // collection name in MongoDB
                    localField: "userId",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: "$author" },

            // Stage 6: pagination
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },

            // Stage 7: shape output
            {
                $project: {
                    course: 1,
                    title: 1,
                    subject: 1,
                    metaData: 1,
                    rank: 1,
                    createdAt: 1,
                    "author.fName": 1,
                    "author.lName": 1,
                    "author.avatar": 1,
                },
            },
        ]);

        res.json({
            success: true,
            message: "Notes fetched successfully",
            page: pageNum,
            limit: limitNum,
            count: notes.length,
            notes,
        });
    } catch (err) {
        next(err);
    }
};

export const loadHomePage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = 20;

    try {
        const user = await User.findById(tokenUser.userId);

        if (!user) throw new HttpError("User not found", 404);

        const courseRegex = buildCourseRegex(user.degree || "");

        // -------------------
        // Suggested Notes
        // -------------------
        let notes = await Notes.aggregate([
            {
                $match: {
                    hidden: false,
                    ...(courseRegex ? { course: { $regex: courseRegex } } : {}),
                },
            },
            {
                $addFields: {
                    downloadsCount: { $ifNull: ["$metaData.downloads", 0] },
                    upvotesCount: {
                        $size: { $ifNull: ["$metaData.upvotes", []] },
                    },
                    followBoost: {
                        $cond: [{ $in: ["$userId", user.following] }, 2, 0],
                    },
                    sameUniversityBoost: {
                        $cond: [
                            { $eq: ["$metaData.university", user.university] },
                            1,
                            0,
                        ],
                    },
                },
            },
            {
                $addFields: {
                    rank: {
                        $add: [
                            { $multiply: ["$downloadsCount", 0.1] },
                            { $multiply: ["$upvotesCount", 0.2] },
                            "$followBoost",
                            { $multiply: ["$sameUniversityBoost", 1] },
                        ],
                    },
                },
            },
            { $sort: { rank: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: "$author" },
            {
                $project: {
                    title: 1,
                    subject: 1,
                    createdAt: 1,
                    metaData: 1,
                    rank: 1,
                    author: {
                        _id: "$author._id",
                        fName: "$author.fName",
                        lName: "$author.lName",
                        avatar: "$author.avatar",
                    },
                },
            },
        ]);

        // -------------------
        // Fallback Notes (if <5)
        // -------------------
        if (notes.length < 5) {
            // Collect IDs of notes we already have
            const existingIds = notes.map((n) => n._id);

            // Get additional notes to fill up to 20
            const fallbackNotes = await Notes.aggregate([
                {
                    $match: {
                        hidden: false,
                        _id: { $nin: existingIds },
                    },
                },
                {
                    $addFields: {
                        downloadsCount: { $ifNull: ["$metaData.downloads", 0] },
                        upvotesCount: {
                            $size: { $ifNull: ["$metaData.upvotes", []] },
                        },
                        followBoost: {
                            $cond: [{ $in: ["$userId", user.following] }, 2, 0],
                        },
                        sameUniversityBoost: {
                            $cond: [
                                {
                                    $eq: [
                                        "$metaData.university",
                                        user.university,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        rank: {
                            $add: [
                                { $multiply: ["$downloadsCount", 0.1] },
                                { $multiply: ["$upvotesCount", 0.2] },
                                "$followBoost",
                                { $multiply: ["$sameUniversityBoost", 1] },
                            ],
                        },
                    },
                },
                { $sort: { sameUniversityBoost: -1, rank: -1, createdAt: -1 } }, // same university first
                { $limit: limit - notes.length },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "author",
                    },
                },
                { $unwind: "$author" },
                {
                    $project: {
                        title: 1,
                        subject: 1,
                        url: 1,
                        createdAt: 1,
                        metaData: 1,
                        rank: 1,
                        author: {
                            _id: "$author._id",
                            fName: "$author.fName",
                            lName: "$author.lName",
                            avatar: "$author.avatar",
                        },
                    },
                },
            ]);

            notes = [...notes, ...fallbackNotes];
        }

        // -------------------
        // Suggested Users
        // -------------------
        const suggestedUsers = await User.find({
            $and: [
                { _id: { $ne: user._id } },
                { _id: { $nin: user.following } },
            ],
            banned: false,
            active: true,
            $or: [
                { university: user.university },
                ...(courseRegex ? [{ degree: { $regex: courseRegex } }] : []),
            ],
            notes: { $exists: true, $not: { $size: 0 } },
        })
            .sort({ totalDownloads: -1 })
            .limit(15)
            .select("fName lName avatar university degree totalDownloads");

        res.json({
            success: true,
            page,
            limit,
            notesCount: notes.length,
            notes,
            suggestedUsers,
        });
    } catch (err) {
        next(err);
    }
};

function buildCourseRegex(course?: string): RegExp | undefined {
    if (!course) return undefined;

    // Expanded ignore words list (add more if needed later)
    const ignoreWords = [
        "bsc",
        "msc",
        "ba",
        "ma",
        "beng",
        "meng",
        "phd",
        "doctorate",
        "diploma",
        "certificate",
        "associate",
        "foundation",
        "degree",
        "bachelor",
        "master",
        "honours",
        "hons",
        "of",
        "in",
    ];

    const parts = course
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => !ignoreWords.includes(w));

    if (!parts.length) return undefined;

    // Create regex with word boundaries, flexible gaps allowed
    // e.g. ["software", "engineering"] => /\bsoftware.*engineering\b/i
    const pattern = "\\b" + parts.join(".*") + "\\b";

    return new RegExp(pattern, "i");
}
