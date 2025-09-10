import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Notes",
        },

        parentCommentId: { type: mongoose.Schema.ObjectId, ref: "Comments" },

        userId: { type: mongoose.Schema.ObjectId, required: true },

        message: {
            type: String,
            minLength: 2,
            maxLength: 1000,
            required: true,
        },

        likes: [{ type: mongoose.Schema.ObjectId }],

        hidden: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Comments = mongoose.model("Comments", commentsSchema);
export default Comments;
