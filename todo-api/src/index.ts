import express from "express";

import routes from "./routes";
import { loadTodos, loadUsers } from "./db";
import { errorHandler } from "./middleware";

const app = express();

app.use(express.json());

app.use(routes);

app.use(errorHandler);

async function main() {
    await loadTodos();
    await loadUsers();

    app.listen(3000, () => {
        console.log(
            "Server running on http://localhost:3000"
        );
    });
}

main();