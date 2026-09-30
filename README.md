# Todo API

## What this project does

This is the backend (server) for a todo app. It stores data in a PostgreSQL database and lets a frontend app:

- **Register** a user account and **log in** with a username and password
- **Create, view, update and delete** todos. Each user sees only their own todos.
- **Filter** todos by complete or incomplete, **search** them by title, **sort** them, and load them **one page at a time**
- **Get stats**: how many todos a user has in total, done, and not done

Logging in returns a **token** (JWT). The frontend sends this token with every todo request so the server knows who is asking.

The server runs on `http://localhost:3000`. Start it with `npm run dev`.

## What each file does

### `src/`: the application code

| File | What it does |
|---|---|
| `index.ts` | **Starting point.** Creates the Express app, allows requests from the frontend (CORS), runs database migrations, then starts the server on port 3000. |
| `routes.ts` | **All the endpoints.** `/register`, `/login`, `/health`, and the `/todos` routes. Each one runs SQL queries and sends back JSON. |
| `middleware.ts` | Code that runs **before** a route. `authMiddleware` checks the login token and sets `req.userId`. `validate` checks the request body with Zod. `errorHandler` catches unexpected errors and returns a 500. |
| `schemas.ts` | **Rules for incoming data** (Zod). For example, a title can't be empty and must be 255 characters or fewer, and a password needs at least 6 characters. |
| `pg.ts` | **Connects to PostgreSQL** using the settings in `.env`. Provides the `query()` helper that runs SQL and returns rows. |
| `migrate.ts` | **Sets up the database tables.** On startup it runs any `.sql` files in `migrations/` that haven't run yet. |
| `config.ts` | Holds the **secret key** used to sign and check login tokens. |
| `types.ts` | TypeScript types (`User`, `Todo`) and the definition that makes `req.userId` available on requests. |
| `test-db.ts` | A small script to **check the database connection**. It prints all users. Run it with `npx tsx src/test-db.ts`. |
| `db.ts` | **Old, no longer used.** Saved todos and users to JSON files before the project moved to PostgreSQL. |

### `migrations/`: database changes

| File | What it does |
|---|---|
| `001_create_tables.sql` | Creates the `users` and `todos` tables and their indexes. |
| `002-add-todo-priority.sql` | Adds a `priority` column to `todos`. |

### Other files

| File | What it does |
|---|---|
| `.env` | Database settings (user, password, host, port, database name). **Keep this private.** |
| `package.json` | Lists the libraries the project uses and the `npm run dev` / `npm start` commands. |
| `tsconfig.json` | TypeScript settings. |
| `todos.json`, `users.json` | **Old data** from before PostgreSQL, used by `db.ts`. The app doesn't read them any more. |
