import express from "express";
import * as Sentry from "@sentry/node";
import routes from "./routes";
import { errorHandler } from "./middleware";

const logger = require ('./logger');
const app = express();
const cors= require("cors");

app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      // Slow request (> 1 second)
      logger.warn('Slow endpoint', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        status: res.statusCode
      });
    }
    
    // Log all requests
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
});

// CORS must run before the routes so every response (including preflight OPTIONS) gets the headers
app.use(cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(routes);

Sentry.setupExpressErrorHandler(app); // Must be after all routes and middleware

app.use(errorHandler);

// Exported without listen() so tests can drive it with supertest
export default app;
