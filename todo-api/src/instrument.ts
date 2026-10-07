import * as Sentry from "@sentry/node";
import "dotenv/config";

Sentry.init({
    dsn: process.env.SENTRY_DSN, // Get from Sentry dashboard
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
});
