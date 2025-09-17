import e, { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import HttpError from "../utils/HttpError.js";
import argon2, { argon2id } from "argon2";
import { generateToken, Payload } from "../utils/jwt.util.js";
import nodemailer from "nodemailer";
import { appPassword, myGmail } from "../config/env.config.js";
import OTP from "../models/otp.model.js";

interface RegisterBody {
    fName: string;
    lName: string;
    email: string;
    avatar?: string;
    password: string;
    university?: string;
    degree?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

export const register = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
    next: NextFunction
) => {
    const { fName, lName, email, password, university, degree } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) throw new HttpError("User already exists", 409);

        const hashedPassword = await argon2.hash(password, { type: argon2id });

        const user = new User({
            fName: fName,
            lName: lName,
            email: email,
            password: hashedPassword,
            university: university,
            degree: degree,
        });

        const savedUser = await user.save();

        const payload = {
            userId: user._id.toString(),
            university: savedUser.university,
            email: savedUser.email,
            role: savedUser.role,
        };

        const token = generateToken(payload);

        res.json({
            success: true,
            message: "User created successfully",
            user: {
                userId: savedUser._id,
                fName: savedUser.fName,
                lName: savedUser.lName,
                avatar: savedUser.avatar,
                email: savedUser.email,
                university: savedUser.university,
                degree: savedUser.degree,
                role: savedUser.role,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new HttpError("User does not exists", 404);
        }

        if (user.banned === true) {
            throw new HttpError("User is banned from the platform", 403);
        }

        const isPasswordCorrect = await argon2.verify(user.password, password);

        if (!isPasswordCorrect) {
            throw new HttpError("Password does not match", 401);
        }

        const payload = {
            userId: user._id.toString(),
            university: user.university,
            email: user.email,
            role: user.role,
        };

        const token = generateToken(payload);

        res.json({
            success: true,
            message: "User logged in successfully",
            user: {
                userId: user._id,
                fName: user.fName,
                lName: user.lName,
                avatar: user.avatar,
                email: user.email,
                university: user.university,
                degree: user.degree,
                role: user.role,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};

export const checkAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user?.userId);

        if (!user) throw new HttpError("User not found", 404);

        res.status(200).json({
            success: true,
            admin: user.role === "admin", // assuming you have isAdmin field in User schema
        });
    } catch (err) {
        next(err);
    }
};

export const requestOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const email = req.params.email;
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: myGmail,
            pass: appPassword,
        },
    });

    try {
        if (!email) throw new HttpError("Email is required", 400);

        await OTP.deleteMany({ email });

        const hashedOTP = await argon2.hash(randomNumber.toString(), {
            type: argon2id,
        });

        const code = await OTP.create({
            email,
            code: hashedOTP,
        });

        const message = {
            from: myGmail,
            sender: "Notelink",
            to: code.email,
            subject: `Your Verification Code`,
            text: `Your verification code is ${randomNumber}`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #333;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #555;">
            Hello,
        </p>
        <p style="font-size: 16px; color: #555;">
            Use the following verification code to complete your action:
        </p>
        <p style="text-align: center; font-size: 28px; font-weight: bold; color: #1a73e8; margin: 20px 0;">
            ${randomNumber}
        </p>
        <p style="font-size: 14px; color: #999;">
            This code will expire in 10 minutes. If you did not request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; 2025 NoteLink. All rights reserved.
        </p>
    </div>
    `,
        };

        await transporter.sendMail(message);

        res.status(250).json({
            success: true,
            message: "Verification code sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) throw new HttpError("User not found", 404);

        const hashedPassword = await argon2.hash(newPassword, {
            type: argon2id,
        });

        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (err) {
        next(err);
    }
};
