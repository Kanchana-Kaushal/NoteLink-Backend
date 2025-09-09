import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
    {
        course: { type: String, required: true, minLength: 2, maxLength: 100 },

        title: { type: String, minLength: 2, maxLength: 100, required: true },

        subTitle: { type: String, minLength: 2, maxLength: 150 },

        url: { type: String, required: true, trim: true },

        description: { type: String, maxLength: 1000 },

        metaData: {
            university: { type: String },

            downloads: { type: Number, min: 0, default: 0 },

            upvotes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
        },

        userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },

        hidden: { type: Boolean, default: false, required: true },
    },
    { timestamps: true }
);

const Notes = mongoose.model("Notes", notesSchema);
export default Notes;
