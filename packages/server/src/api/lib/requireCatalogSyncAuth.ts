import { timingSafeEqual } from 'node:crypto';
import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { requireAdminAuth } from './requireAdminAuth.ts';

function bearerToken(req: HandlerRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

function tokensMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Bearer `CATALOG_SYNC_API_KEY` (deploy/CI) or Discord admin session. */
export async function requireCatalogSyncAuth(
  req: HandlerRequest,
  res: HandlerResponse
): Promise<boolean> {
  const expected = env.CATALOG_SYNC_API_KEY;
  if (expected) {
    const token = bearerToken(req);
    if (token) {
      if (!tokensMatch(expected, token)) {
        res.statusCode = 403;
        res.end(JSON.stringify({ ok: false, reason: 'invalid_bearer' }));
        return false;
      }
      return true;
    }
  }

  const admin = await requireAdminAuth(req, res);
  return admin !== null;
}
