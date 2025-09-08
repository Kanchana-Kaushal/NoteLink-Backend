import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        minLength: 2,
        maxLength: 50,
        required: [true, "Username is required"],
    },

    lName: { type: String, minLength: 2, maxLength: 50 },

    avatar: {
        type: String,
        required: true,
        trim: true,
        default:
            "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png",
    },

    email: {
        type: String,
        trim: true,
        unique: [true, "User already exists, Model"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid"],
        lowercase: true,
        required: true,
    },

    password: { type: String, required: true },

    university: { type: String, minLength: 4, MaxLength: 150 },

    degree: { type: String, minLength: 4, MaxLength: 150 },

    bio: { type: String, maxLength: 200 },

    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

    role: {
        type: String,
        required: true,
        enum: ["admin", "user"],
        default: "user",
    },

    notes: [{ type: mongoose.Schema.ObjectId, ref: "Notes" }],

    totalDownloads: { type: Number, required: true, default: 0, min: 0 },

    savedNotes: [{ type: mongoose.Schema.ObjectId, ref: "Notes" }],

    banned: { type: Boolean, required: true, default: false },

    active: { type: Boolean, required: true, default: true },
});

const User = mongoose.model("User", userSchema);
export default User;
