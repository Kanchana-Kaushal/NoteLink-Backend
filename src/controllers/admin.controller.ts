import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import HttpError from "../utils/HttpError.js";
import Reports from "../models/reports.model.js";

export const setUserBanStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId, banned } = req.body as { userId: string; banned: boolean };

    try {
        const user = await User.findById(userId);
        if (!user) throw new HttpError("User not found", 404);

        if (user.banned === banned) {
            throw new HttpError(
                `User is already ${banned ? "banned" : "unbanned"}`,
                400
            );
        }

        user.banned = banned;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.fName} ${user.lName} is now ${
                banned ? "banned" : "unbanned"
            }.`,
            user: { _id: user._id, banned: user.banned },
        });
    } catch (err) {
        next(err);
    }
};

export const resolveReport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { reportId } = req.params;
    const { status } = req.body; // expected: "resolved" or "rejected"

    try {
        if (!["resolved", "rejected"].includes(status)) {
            throw new HttpError(
                "Invalid status. Must be 'resolved' or 'rejected'",
                400
            );
        }

        const report = await Reports.findById(reportId);
        if (!report) throw new HttpError("Report not found", 404);

        report.status = status;
        await report.save();

        res.json({
            success: true,
            message: `Report status updated to '${status}'`,
            report,
        });
    } catch (err) {
        next(err);
    }
};
