import { z } from "zod";

// trim() first so "   " counts as empty; max 255 matches the VARCHAR(255) column
const TodoTitle = z.string({ error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be 255 characters or less");

export const CreateTodoSchema = z.object({
    title: TodoTitle,
});

// Both fields optional, but the request must change at least one of them
export const UpdateTodoSchema = z.object({
    title: TodoTitle.optional(),
    completed: z.boolean().optional(),
}).refine(
    data => data.title !== undefined || data.completed !== undefined,
    "Provide title or completed"
);

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

export const RegisterSchema = z.object({
    username: z.string({ error: "Username is required" })
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be 20 characters or less"),
    password: z.string({ error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, "Password must contain at least one letter and one number"),
});

export const LoginSchema = z.object({
    username: z.string({ error: "Username is required" }),
    password: z.string({ error: "Password is required" }),
});
