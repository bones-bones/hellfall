import type { HandlerRequest, HandlerResponse } from './types.ts';
import { env } from './env.ts';
import {
  DEFAULT_DEV_SESSION,
  type SessionPayload,
  createSessionToken,
  verifySessionToken,
} from './jwt.ts';
import { getUserAsGuildMember } from './discord/discord.ts';

const ROLES_MAX_AGE_S = 24 * 60 * 60; // 24 hours

export function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setSessionCookie(res: HandlerResponse, sessionToken: string): void {
  const isProd = env.AUTH_SERVER_URL.startsWith('https');
  const parts = [
    `${env.COOKIE_NAME}=${sessionToken}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
    ...(isProd ? ['Secure'] : []),
  ];
  if (env.COOKIE_DOMAIN) parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}

type GuildRolesResult =
  | { kind: 'ok'; roles: string[]; nick: string | null }
  | { kind: 'oauth_invalid' }
  | { kind: 'not_member' };

/**
 * Returns guild roles from the JWT cache if fresh (<24h), otherwise re-fetches
 * from Discord and reissues the session cookie with updated roles.
 */
export async function resolveGuildRoles(
  payload: SessionPayload,
  res: HandlerResponse
): Promise<GuildRolesResult> {
  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token;

  if (!guildId || !discordAccessToken) {
    return { kind: 'not_member' };
  }

  if (
    payload.guild_roles &&
    payload.roles_fetched_at &&
    Math.floor(Date.now() / 1000) - payload.roles_fetched_at < ROLES_MAX_AGE_S
  ) {
    return {
      kind: 'ok',
      roles: payload.guild_roles,
      nick: payload.guild_nick ?? null,
    };
  }

  const guild = await getUserAsGuildMember(discordAccessToken, guildId);
  if (guild.kind === 'oauth_invalid') return { kind: 'oauth_invalid' };
  if (guild.kind === 'not_member') return { kind: 'not_member' };

  const now = Math.floor(Date.now() / 1000);
  const newToken = await createSessionToken({
    sub: payload.sub,
    username: payload.username,
    avatar: payload.avatar,
    email: payload.email,
    discord_access_token: discordAccessToken,
    guild_roles: guild.roles,
    guild_nick: guild.nick,
    roles_fetched_at: now,
  });
  setSessionCookie(res, newToken);

  return { kind: 'ok', roles: guild.roles, nick: guild.nick };
}

/** Parse + verify the session cookie. Returns null if missing/invalid. */
export async function getSession(req: HandlerRequest): Promise<SessionPayload | null> {
  if (env.AUTH_SERVER_URL == 'http://localhost:3003') {
    return DEFAULT_DEV_SESSION;
  }

  const token = getCookie(req, env.COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token);
}
