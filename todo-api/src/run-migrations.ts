import { runMigrations } from "./migrate";
import { pool } from "./pg";

// Standalone entry point for `npm run migrate` — applies pending migrations, then exits
runMigrations()
    .then(() => console.log("Migrations up to date"))
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
