import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { getSession, resolveGuildRoles } from './session.ts';
import { DATABASE_CONTRIBUTOR } from '../discord/constants.ts';

export type ReviewerAuthUser = {
  userId: string;
  username: string;
  discord_access_token: string;
};

/** Verifies session and admin or DATABASE_CONTRIBUTOR role for viewing changesets. */
export async function requireReviewerAuth(
  req: HandlerRequest,
  res: HandlerResponse,
  failSilently?: boolean
): Promise<ReviewerAuthUser | null> {
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

  const contributorRoleId = env.DISCORD_TAG_ROLE_ID ?? DATABASE_CONTRIBUTOR;
  const isContributor = guild.roles.includes(contributorRoleId);
  const isAdmin = guild.roles.includes(env.DISCORD_ADMIN_ROLE_ID);
  if (!isContributor && !isAdmin) {
    if (!failSilently) {
      res.statusCode = 403;
      res.end(JSON.stringify({ ok: false, reason: 'missing_role' }));
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
