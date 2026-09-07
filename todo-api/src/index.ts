
import express from "express";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const app = express();

app.get("/health", (req, res) => {
    console.log(req.method, req.path);
    res.json({ status: "OK" });
});

app.get("/todos", (req, res) => {
    const todos: Todo[] = [
        { id: 1, title: "Learn TypeScript", completed: false },
        { id: 2, title: "Build a REST API", completed: false },
        { id: 3, title: "Write unit tests", completed: false }
    ];

    console.log(req.method, req.path);
    res.json(todos);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

