import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { getSession, resolveGuildRoles } from './session.ts';
import { JUDGE_ROLE } from '../discord/constants.ts';

export type JudgeAuthUser = {
  userId: string;
  username: string;
  discord_access_token: string;
};

/** Verifies session and judge Discord role. Returns user or sends error and returns null. */
export async function requireJudgeAuth(
  req: HandlerRequest,
  res: HandlerResponse,
  failSilently?: boolean
): Promise<JudgeAuthUser | null> {
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

  const judgeRoleId = env.DISCORD_JUDGE_ROLE_ID ?? JUDGE_ROLE;
  if (!guild.roles.includes(judgeRoleId)) {
    if (!failSilently) {
      res.statusCode = 403;
      res.end(JSON.stringify({ ok: false, reason: 'missing_judge_role' }));
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
