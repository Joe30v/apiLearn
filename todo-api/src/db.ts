import { readFile, writeFile } from "node:fs/promises";

import type { User, Todo } from "./types";

let users: User[] = [];
let todos: Todo[] = [];

export function getUsers(): User[] {
    return users;
}

export function setUsers(newUsers: User[]) {
    users = newUsers;
}

export async function loadUsers() {
    try {
        const fileContents = await readFile("users.json", "utf-8");
        users = JSON.parse(fileContents);
        console.log(`Loaded ${users.length} users from disk`);
    } catch (error) {
        console.log("Starting with empty users (file not found)");
        users = [];
    }
}

export async function saveUsers() {
    try {
        await writeFile(
            "users.json",
            JSON.stringify(users, null, 2)
        );
    } catch (error) {
        console.error("Failed to save users:", error);
        throw error;
    }
}

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
