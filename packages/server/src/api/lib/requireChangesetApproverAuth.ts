import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { getSession, resolveGuildRoles } from './session.ts';
import { CATALOG_SYNC_ROLE, hasChangesetApproverRole } from '../discord/constants.ts';

export type ChangesetApproverAuthUser = {
  userId: string;
  username: string;
  discord_access_token: string;
};

/** Verifies session and admin or catalog-sync role for accept/reject changesets. */
export async function requireChangesetApproverAuth(
  req: HandlerRequest,
  res: HandlerResponse,
  failSilently?: boolean
): Promise<ChangesetApproverAuthUser | null> {
  const payload = await getSession(req);
  if (!payload) {
    if (!failSilently) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    }
    return null;
  }

  if (!payload.discord_access_token) {
    if (!failSilently) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    }
    return null;
  }

  const guild = await resolveGuildRoles(payload, res);
  if (guild.kind === 'oauth_invalid') {
    if (!failSilently) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, reason: 'discord_oauth_expired' }));
    }
    return null;
  }
  if (guild.kind === 'not_member') {
    if (!failSilently) {
      res.statusCode = 403;
      res.end(JSON.stringify({ ok: false, reason: 'not_in_guild' }));
    }
    return null;
  }

  const syncRoleId = env.DISCORD_CATALOG_SYNC_ROLE_ID ?? CATALOG_SYNC_ROLE;
  if (!hasChangesetApproverRole(guild.roles, env.DISCORD_ADMIN_ROLE_ID, syncRoleId)) {
    if (!failSilently) {
      res.statusCode = 403;
      res.end(JSON.stringify({ ok: false, reason: 'missing_admin_role' }));
    }
    return null;
  }

  const username = guild.nick || payload.username || payload.sub;

  return {
    userId: payload.sub,
    username,
    discord_access_token: payload.discord_access_token,
  };
}
