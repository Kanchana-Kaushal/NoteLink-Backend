import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
    deletNote,
    downloadNote,
    removeUpvote,
    searchNotes,
    updateNote,
    uploadNote,
    upvoteNote,
} from "../controllers/notes.controller.js";
import { saveNote, unsaveNote } from "../controllers/user.controller.js";

const notesRouter = Router();

notesRouter.post("/upload", verifyUser, uploadNote);

notesRouter.delete("/delete/:noteId", verifyUser, deletNote);

notesRouter.put("/update/:noteId", verifyUser, updateNote);

notesRouter.post("/upvote/:noteId", verifyUser, upvoteNote);

notesRouter.post("/remove-upvote/:noteId", verifyUser, removeUpvote);

notesRouter.post("/save/:noteId", verifyUser, saveNote);

notesRouter.post("/unsave/:noteId", verifyUser, unsaveNote);

notesRouter.get("/download/:noteId", verifyUser, downloadNote); //rate-limter required. 1h cooldown

notesRouter.get("/search", verifyUser, searchNotes); // GET /api/notes/search?query=sdLC&sortBy=downloads&sortOrder=desc&page=2&limit=10

export default notesRouter;
