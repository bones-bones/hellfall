import { timingSafeEqual } from 'node:crypto';
import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { getSession, resolveGuildRoles } from './session.ts';
import { CATALOG_SYNC_ROLE } from '../discord/constants.ts';

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

/**
 * Bearer `CATALOG_SYNC_API_KEY` (deploy/CI), Discord admin session,
 * or Discord catalog-sync role session.
 */
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

  const payload = await getSession(req);
  if (!payload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return false;
  }

  if (!payload.discord_access_token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return false;
  }

  const guild = await resolveGuildRoles(payload, res);
  if (guild.kind === 'oauth_invalid') {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'discord_oauth_expired' }));
    return false;
  }
  if (guild.kind === 'not_member') {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'not_in_guild' }));
    return false;
  }

  const syncRoleId = env.DISCORD_CATALOG_SYNC_ROLE_ID ?? CATALOG_SYNC_ROLE;
  const isAdmin =
    Boolean(env.DISCORD_ADMIN_ROLE_ID) && guild.roles.includes(env.DISCORD_ADMIN_ROLE_ID);
  const canSync = guild.roles.includes(syncRoleId);
  if (!isAdmin && !canSync) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'missing_catalog_sync_role' }));
    return false;
  }

  return true;
}
