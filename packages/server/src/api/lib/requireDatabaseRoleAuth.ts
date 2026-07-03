import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { getSession, resolveGuildRoles } from './session.ts';
import { DATABASE_CONTRIBUTOR } from '../discord/constants.ts';

export type TagAuthUser = {
  userId: string;
  username: string;
  discord_access_token: string;
};

/** Verifies session and DATABASE_CONTRIBUTOR role. Returns user or sends error and returns null. */
export const requireDatabaseRoleAuth = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<TagAuthUser | null> => {
  const sessionPayload = await getSession(req);
  if (!sessionPayload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return null;
  }

  const roleId = DATABASE_CONTRIBUTOR;
  if (!roleId) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'role_not_configured' }));
    return null;
  }

  if (!sessionPayload.discord_access_token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return null;
  }

  const guild = await resolveGuildRoles(sessionPayload, res);
  if (guild.kind === 'oauth_invalid') {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'discord_oauth_expired' }));
    return null;
  }
  if (guild.kind === 'not_member') {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'not_in_guild' }));
    return null;
  }

  const candidateRoleId = env.DISCORD_TAG_ROLE_ID ?? roleId;
  if (!guild.roles.includes(candidateRoleId)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'missing_role' }));
    return null;
  }

  const username = guild.nick || sessionPayload.username || sessionPayload.sub;

  return {
    userId: sessionPayload.sub,
    username,
    discord_access_token: sessionPayload.discord_access_token,
  };
}
