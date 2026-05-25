import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import { verifySessionToken } from './jwt.ts';
import { getUserAsGuildMember } from './discord/discord.ts';

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export type AdminAuthUser = {
  userId: string;
  username: string;
  discord_access_token: string;
};

/** Verifies session and DISCORD_ADMIN_ROLE_ID. Returns user or sends error and returns null. */
export async function requireAdminAuth(
  req: HandlerRequest,
  res: HandlerResponse
): Promise<AdminAuthUser | null> {
  const token = getCookie(req, env.COOKIE_NAME);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return null;
  }

  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token;
  if (!guildId || !discordAccessToken) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_session' }));
    return null;
  }

  const guild = await getUserAsGuildMember(discordAccessToken, guildId);
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

  if (!guild.roles.includes(env.DISCORD_ADMIN_ROLE_ID)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: 'missing_admin_role' }));
    return null;
  }

  const username =
    guild.kind === 'member' && guild.nick ? guild.nick : payload.username || payload.sub;

  return {
    userId: payload.sub,
    username,
    discord_access_token: discordAccessToken,
  };
}
