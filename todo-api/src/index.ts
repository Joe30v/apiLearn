import app from "./app";
import { runMigrations } from "./migrate";

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
