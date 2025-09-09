import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
    deletNote,
    removeUpvote,
    updateNote,
    uploadNote,
    upvoteNote,
} from "../controllers/notes.controller.js";

const notesRouter = Router();

notesRouter.post("/upload", verifyUser, uploadNote);

notesRouter.delete("/delete/:noteId", verifyUser, deletNote);

notesRouter.put("/update/:noteId", verifyUser, updateNote);

notesRouter.post("/upvote/:noteId", verifyUser, upvoteNote);

notesRouter.post("/remove-upvote/:noteId", verifyUser, removeUpvote);

export default notesRouter;
