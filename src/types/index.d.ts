import "express";
import { Types } from "mongoose";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: string;
            fName: string;
            email: string;
            role: string;
        };
    }
}
