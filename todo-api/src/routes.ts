import { Router } from "express";
import { ZodError } from "zod";

import {
    getTodos,
    setTodos,
    saveTodos,
    type Todo
} from "./db";

import {
    CreateTodoSchema,
    UpdateTodoSchema
} from "./schemas";

const router = Router();

router.get("/health", async (req, res) => {
    res.json({ status: "OK" });
});

router.get("/todos", async (req, res) => {
    res.json(getTodos());
});

router.post("/todos", async (req, res) => {
    try {
        const body = CreateTodoSchema.parse(req.body);
        const todos = getTodos();

        const nextId =
            Math.max(...todos.map(t => t.id), 0) + 1;

        const newTodo: Todo = {
            id: nextId,
            title: body.title,
            completed: false
        };

        todos.push(newTodo);

        await saveTodos();

        res.status(201).json(newTodo);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: error.issues
            });
        }

        throw error;
    }
});

router.patch("/todos/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "id must be a number"
        });
    }

    const todos = getTodos();
    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({
            error: "todo not found"
        });
    }

    try {
        const body = UpdateTodoSchema.parse(req.body);

        todo.completed = body.completed;

        await saveTodos();

        res.json(todo);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: error.issues
            });
        }

        throw error;
    }
});

router.delete("/todos/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "id must be a number"
        });
    }

    const todos = getTodos();
    const originalLength = todos.length;

    const remainingTodos = todos.filter(t => t.id !== id);

    if (remainingTodos.length === originalLength) {
        return res.status(404).json({
            error: "todo not found"
        });
    }

    setTodos(remainingTodos);

    await saveTodos();

    res.status(204).send();
});

export default router;