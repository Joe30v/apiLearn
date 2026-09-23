import { Router } from "express";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
    getTodos,
    setTodos,
    saveTodos,
    getUsers,
    saveUsers
} from "./db";

import type { Todo, User } from "./types";

import {
    CreateTodoSchema,
    UpdateTodoSchema,
    RegisterSchema,
    LoginSchema
} from "./schemas";

import { SECRET_KEY } from "./config";
import { authMiddleware } from "./middleware";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const body = RegisterSchema.parse(req.body);
        const users = getUsers();

        const existingUser = users.find(
            user => user.username === body.username
        );

        if (existingUser) {
            return res.status(409).json({
                error: "Username already taken"
            });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: body.username,
            password: hashedPassword
        };

        users.push(newUser);

        await saveUsers();

        res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }

        res.status(500).json({
            error: " Registration failed"
        });
    }
});

router.post("/login", async (req, res) => {
  try {
    const body = LoginSchema.parse(req.body);

    // Find user
    const users = getUsers();
    const user = users.find(u => u.username === body.username);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify password
    const isCorrect = await bcrypt.compare(body.password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({ token, userId: user.id });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/health", async (req, res) => {
    res.json({ status: "OK" });
});

router.get("/todos", authMiddleware, (req, res) => {
    const usersTodos = getTodos().filter(
        todo => todo.userId === req.userId
    );
    res.json(usersTodos);
});

router.post("/todos", authMiddleware, async (req, res) => {
  try {
    const body = CreateTodoSchema.parse(req.body);
    const todos = getTodos();

    const newTodo: Todo = {
      id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
      userId: req.userId!,  // Use the authenticated userId
      title: body.title,
      completed: false
    };

    todos.push(newTodo);
    await saveTodos();

    res.status(201).json(newTodo);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Failed to create todo" });
  }
});

router.patch("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const todo = getTodos().find(t => t.id === id);

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    if (todo.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });  // Not your todo
    }

    const body = UpdateTodoSchema.parse(req.body);
    todo.completed = body.completed;
    await saveTodos();

    res.json(todo);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Failed to update todo" });
  }
});

router.delete("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    if (todo.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });  // Not your todo
    }

    setTodos(todos.filter(t => t.id !== id));
    await saveTodos();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
