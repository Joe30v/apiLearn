import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { pool } from "./pg";

// SQL files live in todo-api/migrations and run in filename order (001_, 002_, ...)
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

export async function runMigrations() {
    // Remembers which files already ran, so each migration runs exactly once
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            ran_at TIMESTAMPTZ DEFAULT now()
        )
    `);

    const done = await pool.query("SELECT filename FROM schema_migrations");
    const alreadyRan = new Set(done.rows.map(row => row.filename));

    const files = readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith(".sql"))
        .sort();

    for (const file of files) {
        if (alreadyRan.has(file)) continue;

        const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");

        // Transaction: if any statement in the file fails, none of it is applied
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
            await client.query("COMMIT");
            console.log(`Ran migration: ${file}`);
        } catch (error) {
            await client.query("ROLLBACK");
            console.error(`Migration failed: ${file}`);
            throw error;
        } finally {
            client.release();
        }
    }
}
