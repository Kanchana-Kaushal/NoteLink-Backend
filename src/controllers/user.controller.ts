import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import HttpError from "../utils/HttpError.js";
import { Payload } from "../utils/jwt.util.js";

export const getUserInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.params.userId;
    const user = req.user as Payload;

    try {
        const userData = await User.findById(userId).select(
            userId === user.userId ? "-password -__v" : "-password -__v -email"
        );

        if (!userData) {
            throw new HttpError("User not found", 404);
        }

        res.json({
            success: true,
            message: "User fetched successfully",
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};
