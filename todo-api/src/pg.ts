import "dotenv/config";
import { Pool } from "pg";

// DATABASE_URL (e.g. Neon) wins when set; otherwise fall back to the local DB_* settings
export const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
    });

 export async function query(text: string, params: unknown[] = []) {
    const start = Date.now();
    const result = await pool.query(text, params);

    const duration = Date.now() - start;
    if (duration > 1000) {
        console.warn(`[SLOW] Query took ${duration}ms: ${text}`);
    }

    return result.rows;
}
