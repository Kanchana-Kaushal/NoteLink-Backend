import express from "express";
import { connString, PORT } from "./config/env.config.js";
import { error, log } from "console";
import mongoose from "mongoose";
import errorHandler from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import notesRouter from "./routes/notes.route.js";
import commnetsRouter from "./routes/comments.route.js";
import adminRouter from "./routes/admin.route.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();

//Middleware
app.use(authenticate);
app.use(express.json());

//Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/notes", notesRouter);
app.use("/api/comments", commnetsRouter);

//Not Found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Resouce not found",
    });
});

//Error Handler
app.use(errorHandler);

app.listen(PORT, async () => {
    log("App is listening on PORT", +PORT);

    try {
        mongoose.connect(connString);
        log("Database connected successfully");
    } catch (err) {
        error(err);
    }
});
