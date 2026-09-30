import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
});

export async function query(text: string, params: unknown[] = []) {
    const result = await pool.query(text, params);
    return result.rows;
}
