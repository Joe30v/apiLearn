import express from "express";

import routes from "./routes";
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

// Exported without listen() so tests can drive it with supertest
export default app;
