import { z } from "zod";

export const CreateTodoSchema = z.object({
    title: z.string().min(1, "title must not be empty"),
});

export const UpdateTodoSchema = z.object({
    completed: z.boolean(),
});