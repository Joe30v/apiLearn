import "dotenv/config";
import { Pool } from "pg";

const logger = require("./logger");

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

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (duration > 500) {
            logger.warn("Slow query", {
                query: text.substring(0, 100), // First 100 chars
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }

        return result.rows;
    } catch (error) {
        logger.error("Query error", {
            query: text.substring(0, 100),
            error: (error as Error).message
        });
        throw error;
    }
}
