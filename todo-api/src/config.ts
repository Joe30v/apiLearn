// Signing key for JWTs. Set JWT_SECRET in the environment before deploying —
// the fallback is only here so local development works out of the box.
export const SECRET_KEY =
    process.env.JWT_SECRET ?? "dev-only-secret-change-me";
