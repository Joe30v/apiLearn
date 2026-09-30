import express from "express";
import cors from "cors";

import routes from "./routes";
import { runMigrations } from "./migrate";
import { errorHandler } from "./middleware";

const app = express();

// CORS must run before the routes so every response (including preflight OPTIONS) gets the headers
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(routes);

app.use(errorHandler);

async function main() {
    // Bring the database schema up to date before accepting requests
    await runMigrations();

    app.listen(3000, () => {
        console.log(
            "Server running on http://localhost:3000"
        );
    });
}

main().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
