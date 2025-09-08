import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { deletNote, uploadNote } from "../controllers/notes.controller.js";

const notesRouter = Router();

notesRouter.post("/upload", verifyUser, uploadNote);

notesRouter.delete("/delete/:noteId", verifyUser, deletNote);

export default notesRouter;
