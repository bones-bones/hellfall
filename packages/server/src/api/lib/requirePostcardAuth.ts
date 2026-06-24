import { timingSafeEqual } from 'node:crypto';
import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';

function bearerToken(req: HandlerRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

function tokensMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return timingSafeEqual(a, b);
}

/** Verifies `Authorization: Bearer <MORK_POSTCARD_API_KEY>`. */
export function requirePostcardAuth(req: HandlerRequest, res: HandlerResponse): boolean {
  const expected = env.MORK_POSTCARD_API_KEY;
  if (!expected) {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, reason: 'postcard_not_configured' }));
    return false;
  }

  const token = bearerToken(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'missing_bearer' }));
    return false;
  }

  if (!tokensMatch(expected, token)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_bearer' }));
    return false;
  }

  return true;
}
