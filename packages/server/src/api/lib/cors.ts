import type { IncomingMessage } from 'node:http';
import { env } from './env.ts';

const HARDCODED_CORS_ORIGINS = new Set<string>([
  'https://hellfall.skeleton.club',
  'https://api.skeleton.club',
]);

export function getAllowedOrigin(): string {
  try {
    const url = new URL(env.FRONTEND_URL);
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

/** Allowed for local dev: reflect request origin so any localhost port works. */
function isLocalhostOrigin(origin: string | undefined): boolean {
  if (!origin || typeof origin !== 'string') return false;
  try {
    const u = new URL(origin);
    return (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.protocol === 'http:';
  } catch {
    return false;
  }
}

function isConfiguredAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (origin === getAllowedOrigin()) return true;
  return HARDCODED_CORS_ORIGINS.has(origin);
}

/** Origin to use for CORS: localhost (dev), or request origin if on the allowlist, else FRONTEND_URL origin. */
export function getCorsOrigin(req: IncomingMessage): string {
  const origin = req.headers.origin;
  if (isLocalhostOrigin(origin)) return origin as string;
  if (origin && isConfiguredAllowedOrigin(origin)) return origin;
  return getAllowedOrigin();
}

export function withCors(
  headers: Record<string, string>,
  req?: IncomingMessage
): Record<string, string> {
  const origin = req ? getCorsOrigin(req) : getAllowedOrigin();
  return {
    ...headers,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
