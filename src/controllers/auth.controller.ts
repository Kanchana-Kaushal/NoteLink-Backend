import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import HttpError from "../utils/HttpError.js";
import argon2, { argon2id } from "argon2";
import { generateToken } from "../utils/jwt.util.js";

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
    const { fName, lName, email, avatar, password, university, degree } =
        req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) throw new HttpError("User already exists", 409);

        const hashedPassword = await argon2.hash(password, { type: argon2id });

        const user = new User({
            fName: fName,
            lName: lName,
            email: email,
            avatar: avatar,
            password: hashedPassword,
            university: university,
            degree: degree,
        });

        const savedUser = await user.save();

        const payload = {
            userId: user._id.toString(),
            fName: savedUser.fName,
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

        const isPasswordCorrect = argon2.verify(user.password, password);

        if (!isPasswordCorrect) {
            throw new HttpError("Password does not match", 401);
        }

        const payload = {
            userId: user._id.toString(),
            fName: user.fName,
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
