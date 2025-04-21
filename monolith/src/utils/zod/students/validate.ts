import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(1),
    id: z.string().min(1),
    uid: z.string().regex(/^[a-zA-Z0-9_-]{6,}$/),
    email: z.string().email(),
    place: z.string().min(1),
    yearOfBirth: z.number().int().gte(1900).lte(new Date().getFullYear()),
    profileUrl: z.string().url()
});

export const signinSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  });

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});
