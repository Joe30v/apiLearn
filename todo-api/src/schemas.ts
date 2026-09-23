import { z } from "zod";

export const CreateTodoSchema = z.object({
    title: z.string().min(1, "title must not be empty"),
});

export const UpdateTodoSchema = z.object({
    completed: z.boolean(),
});

export const RegisterSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6),
});

export const LoginSchema = z.object({
    username: z.string(),
    password: z.string(),
});
