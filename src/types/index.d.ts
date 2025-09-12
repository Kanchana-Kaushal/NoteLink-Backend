import "express";
import { Types } from "mongoose";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: string;
            university: string | null | undefined;
            email: string;
            role: string;
        };
    }
}
