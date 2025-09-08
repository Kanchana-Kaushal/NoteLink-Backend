import { NextFunction, Request, Response } from "express";
import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";
import { secret } from "../config/env.config.js";
import { Payload } from "../utils/jwt.util.js";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bearer = req.headers.authorization;

    if (bearer) {
        const token = bearer.split(" ")[1];
        const payload = jwt.verify(token, secret) as Payload;

        if (payload) {
            req.user = payload;
            next();
        } else {
            throw new HttpError("Unauthenticated", 401);
        }
    } else {
        next();
    }
};

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            throw new HttpError("User unauthorized", 401);
        }

        next();
    } catch (err) {
        next(err);
    }
};

export const verifyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user || user.role != "admin") {
            throw new HttpError("User unauthorized", 401);
        }

        next();
    } catch (err) {
        next(err);
    }
};
