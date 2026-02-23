import { env } from "./env.js";

export function getAllowedOrigin(): string {
  try {
    const url = new URL(env.FRONTEND_URL);
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function withCors(headers: Record<string, string>): Record<string, string> {
  return {
    ...headers,
    "Access-Control-Allow-Origin": getAllowedOrigin(),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
