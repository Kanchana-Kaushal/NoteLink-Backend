import mongoose from "mongoose";

const reportsSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },

        noteId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Notes",
        },

        reason: {
            type: String,
            required: true,
            minLength: 8,
            maxLength: 1000,
        },

        status: {
            type: String,
            required: true,
            enum: ["pending", "resolved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Reports = mongoose.model("Reports", reportsSchema);
export default Reports;
