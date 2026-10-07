import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

import app from "../app";
import { pool } from "../pg";
import { runMigrations } from "../migrate";

// Unique per run so re-running the tests never hits "Username already taken"
const username = `test${Date.now()}`.slice(0, 20);
const password = "password123";
let token: string;

beforeAll(async () => {
    await runMigrations();
});

afterAll(async () => {
    await pool.query("DELETE FROM users WHERE username = $1", [username]);
    await pool.end();
});

describe("API Tests", () => {
    test("GET /health should return status OK", async () => {
        const response = await request(app).get("/health");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "OK" });
    });

    test("POST /register should create user", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username, password });
        expect(response.statusCode).toBe(201);
        expect(response.body.userId).toBeDefined();
    });

    test("POST /register should reject duplicate username", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username, password });
        expect(response.statusCode).toBe(409);
    });

    test("POST /login should return a token", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username, password });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
        token = response.body.token;
    });

    test("POST /login should reject wrong password", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username, password: "wrongpass1" });
        expect(response.statusCode).toBe(401);
    });

    test("GET /todos without token should return 401", async () => {
        const response = await request(app).get("/todos");
        expect(response.statusCode).toBe(401);
    });

    test("POST /todos should create a todo", async () => {
        const response = await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Write tests" });
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe("Write tests");
        expect(response.body.completed).toBe(false);
    });

    test("POST /todos should reject empty title", async () => {
        const response = await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "   " });
        expect(response.statusCode).toBe(400);
    });
});
