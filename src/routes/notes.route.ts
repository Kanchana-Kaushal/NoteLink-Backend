import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
    deletNote,
    updateNote,
    uploadNote,
} from "../controllers/notes.controller.js";

const notesRouter = Router();

notesRouter.post("/upload", verifyUser, uploadNote);

notesRouter.delete("/delete/:noteId", verifyUser, deletNote);

notesRouter.put("/update/:noteId", verifyUser, updateNote);

export default notesRouter;
