import { readFile, writeFile } from "node:fs/promises";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

let todos: Todo[] = [];

export function getTodos(): Todo[] {
    return todos;
}

export function setTodos(newTodos: Todo[]) {
    todos = newTodos;
}

export async function loadTodos() {
    try {
        const fileContents = await readFile("todos.json", "utf-8");
        todos = JSON.parse(fileContents);
        console.log(`Loaded ${todos.length} todos from disk`);
    } catch (error) {
        console.log("Starting with empty todos (file not found)");
        todos = [];
    }
}

export async function saveTodos() {
    try {
        await writeFile(
            "todos.json",
            JSON.stringify(todos, null, 2)
        );
    } catch (error) {
        console.error("Failed to save todos:", error);
        throw error;
    }
}