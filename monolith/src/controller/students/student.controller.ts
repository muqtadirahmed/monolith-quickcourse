import { Request, Response } from "express";
import { userSchema } from "../../utils/zod/students/validate";
import { getMongoDBInstance } from "../../config/mongo";
import { username } from 'username';
export const studentBenefit = async (req: Request, res: Response) => {
    const parseResult = userSchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(400).json({
            error: "Validation failed",
            details: parseResult.error.errors

        });
        return
    }

    const { name, id, uid, email, place, yearOfBirth, profileUrl } = parseResult.data;

    try {
        const db = await getMongoDBInstance();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ uid });

        if (existingUser) {
            res.status(409).json({
                message: "A user with this UID already exists.",
                uid
            });
            return
        }
        const user = await username()

        const newUser = {
            name,
            id,
            uid,
            email,
            place,
            username: user,
            yearOfBirth,
            profileUrl,
            studentBenefit: true,
            studentBenefitVerified: false,
            createdAt: new Date()
        };

        await usersCollection.insertOne(newUser);

        res.status(201).json({
            message: "User created successfully",
            toast: "Email has been send to your account"
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
