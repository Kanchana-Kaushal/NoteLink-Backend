import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import HttpError from "../utils/HttpError.js";
import { Payload } from "../utils/jwt.util.js";
import mongoose from "mongoose";

export const getUserInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.params.userId;
    const user = req.user as Payload;

    try {
        const userData = await User.findById(userId)
            .select(
                userId === user.userId
                    ? "-password -__v"
                    : "-password -__v -email"
            )
            .populate("notes");

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

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;

    try {
        const user = await User.findById(tokenUser.userId);

        if (!user) throw new HttpError("Cannot find the user", 404);

        const fName = req.body.fName;
        const lName = req.body.lName;
        const avatar = req.body.avatar;
        const university = req.body.university;
        const degree = req.body.degree;
        const bio = req.body.bio;

        const updatedUser = await User.findByIdAndUpdate(
            tokenUser.userId,
            {
                fName,
                lName,
                avatar,
                university,
                degree,
                bio,
            },
            { runValidators: true, new: true }
        ).select("-password -__v");

        res.json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        next(err);
    }
};

export const follow = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;
    const followingUserId = new mongoose.Types.ObjectId(
        req.params.followingUserId
    );

    try {
        if (tokenUser.userId === followingUserId.toString())
            throw new HttpError("You cannot follow yourself", 400);

        const userToFollow = await User.findById(followingUserId);

        if (!userToFollow) throw new HttpError("User to follow not found", 404);

        const currentUser = await User.findById(tokenUser.userId);

        if (!currentUser) throw new HttpError("User not found", 404);

        // Check if already following
        if (currentUser.following.includes(followingUserId)) {
            throw new HttpError("You are already following this user", 400);
        }

        // Update both users
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({
            success: true,
            message: `You are now following ${userToFollow.fName} ${userToFollow.lName}`,
            data: {
                following: currentUser.following,
                followers: userToFollow.followers,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const unfollow = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tokenUser = req.user as Payload;
    const unfollowUserId = new mongoose.Types.ObjectId(
        req.params.unfollowUserId
    );

    try {
        if (tokenUser.userId === unfollowUserId.toString()) {
            throw new HttpError("You cannot unfollow yourself", 400);
        }

        const userToUnfollow = await User.findById(unfollowUserId);
        if (!userToUnfollow)
            throw new HttpError("User to unfollow not found", 404);

        const currentUser = await User.findById(tokenUser.userId);
        if (!currentUser) throw new HttpError("User not found", 404);

        // Check if not following
        if (!currentUser.following.includes(unfollowUserId)) {
            throw new HttpError("You are not following this user", 400);
        }

        // Remove from both sides
        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== unfollowUserId.toString()
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            (id) => id.toString() !== currentUser._id.toString()
        );

        await currentUser.save();
        await userToUnfollow.save();

        res.status(200).json({
            success: true,
            message: `You have unfollowed ${userToUnfollow.fName} ${userToUnfollow.lName}`,
            data: {
                following: currentUser.following,
                followers: userToUnfollow.followers,
            },
        });
    } catch (err) {
        next(err);
    }
};
