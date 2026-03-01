import type { IncomingMessage } from "node:http";
import { env } from "./env.js";

export function getAllowedOrigin(): string {
  try {
    const url = new URL(env.FRONTEND_URL);
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** Allowed for local dev: reflect request origin so any localhost port works. */
function isLocalhostOrigin(origin: string | undefined): boolean {
  if (!origin || typeof origin !== "string") return false;
  try {
    const u = new URL(origin);
    return (u.hostname === "localhost" || u.hostname === "127.0.0.1") && u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Origin to use for CORS: request origin if localhost (for local dev), else FRONTEND_URL origin. */
export function getCorsOrigin(req: IncomingMessage): string {
  const origin = req.headers.origin;
  if (isLocalhostOrigin(origin)) return origin as string;
  return getAllowedOrigin();
}

export function withCors(headers: Record<string, string>, req?: IncomingMessage): Record<string, string> {
  const origin = req ? getCorsOrigin(req) : getAllowedOrigin();
  return {
    ...headers,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
