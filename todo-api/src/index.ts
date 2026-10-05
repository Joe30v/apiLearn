import express from "express";

import routes from "./routes";
import { runMigrations } from "./migrate";
import { errorHandler } from "./middleware";

const app = express();
const cors= require("cors");

// CORS must run before the routes so every response (including preflight OPTIONS) gets the headers
app.use(cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(routes);

app.use(errorHandler);

async function main() {
    // Bring the database schema up to date before accepting requests
    await runMigrations();

    const port = Number(process.env.PORT) || 3000;

    app.listen(port, () => {
        console.log(
            `Server running on http://localhost:${port}`
        );
    });
}

main().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
