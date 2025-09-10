import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    code: { type: String, required: true },

    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid"],
        unique: false,
        trim: true,
        lowercase: true,
    },

    createdAt: { type: Date, default: Date.now, expires: 600 },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
