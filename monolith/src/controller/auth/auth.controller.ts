import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { V3 } from "paseto"
import { getMongoDBInstance } from "../../config/mongo";
import { signinSchema, signupSchema } from "../../utils/zod/students/validate";
const SALT_ROUNDS = 10;
const secretKey = Buffer.from("your-32-byte-secret-key-123456789012", "utf-8");


export const signup = async (req: Request, res: Response) => {
    try {
        console.log("hello")
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation error",
                errors: parsed.error.flatten().fieldErrors,
            });
            return
        }

        const { name, email, password } = parsed.data;
        const db = await getMongoDBInstance();
        const publicCollection = db.collection("public");
        const privateCollection = db.collection("private");
        const existingUser = await privateCollection.findOne({ email });

        if (existingUser) {
            res.status(409).json({ message: "User already exists" });
            return
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const uuid = uuidv4();
        await publicCollection.insertOne({ name, email, createdAt: new Date(), uid: uuid, verified: false });
        await privateCollection.insertOne({ email, password: hashedPassword, uid: uuid, createdAt: new Date() });

        res.status(201).json({
            message: "User created successfully",
        });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Internal Server Error" });

    }
}


export const signin = async (req: Request, res: Response) => {
    try {
        const parsed = signinSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation error",
                errors: parsed.error.flatten().fieldErrors,

            });
            return
        }

        const { email, password } = parsed.data;

        const db = await getMongoDBInstance();
        if (!db) {
            res.status(500).json({ message: "DB connection failed" });
            return
        }

        const privateCollection = db.collection("private");
        const user = await privateCollection.findOne({ email });

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return
        }

        const token = await V3.encrypt(
            {
                uid: user.uid,
                email: user.email,
                issuedAt: new Date().toISOString()
            },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
        });
        return

    } catch (err) {
        console.error("Signin Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return
    }
};