import jwt from "jsonwebtoken";
import { secret } from "../config/env.config.js";

export interface Payload {
    userId: string;
    university: string | null | undefined;
    email: string;
    role: string;
}

export const generateToken = (payload: Payload): string => {
    const timeToLive = payload.role === "admin" ? "3h" : "7d";

    return jwt.sign(payload, secret, { expiresIn: timeToLive });
};
