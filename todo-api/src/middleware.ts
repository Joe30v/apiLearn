import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

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