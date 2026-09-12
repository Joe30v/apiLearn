import express from "express";

import routes from "./routes";
import { loadTodos } from "./db";
import { errorHandler } from "./middleware";

const app = express();

app.use(express.json());

app.use(routes);

app.use(errorHandler);

async function main() {
    await loadTodos();

    app.listen(3000, () => {
        console.log(
            "Server running on http://localhost:3000"
        );
    });
}

main();