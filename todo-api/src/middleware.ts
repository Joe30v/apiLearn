import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

import { SECRET_KEY } from "./config";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing or malformed Authorization header"
        });
    }

    const token = authHeader.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, SECRET_KEY) as {
            userId: number;
            username: string;
        };

        req.userId = payload.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error("Uncaught error:", err);

    if(err instanceof ZodError) {
        return res.status(400).json({
            error: err.issues
        });
    }

    res.status(500).json({
        error: "Internal server error"
    });
}
