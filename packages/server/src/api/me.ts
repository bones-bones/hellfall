import { env } from './lib/env.ts';
import { verifySessionToken } from './lib/jwt.ts';
import { withCors } from './lib/cors.ts';
import { getUserAsGuildMember } from './lib/discord/discord.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) {
    return null;
  }
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const meHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const token = getCookie(req, env.COOKIE_NAME);
  if (!token) {
    console.log('No token');
    res.statusCode = 200;
    res.end(JSON.stringify({ user: null }));
    return;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    res.statusCode = 200;
    res.end(JSON.stringify({ user: null }));
    return;
  }

  let guild: { nick: string | null; roles: string[] } | null = null;
  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token;
  if (guildId && discordAccessToken) {
    const gm = await getUserAsGuildMember(discordAccessToken, guildId);
    if (gm.kind === 'member') {
      guild = { nick: gm.nick, roles: gm.roles };
    }
  }
  console.log(guild);

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      user: {
        id: payload.sub,
        username: payload.username,
        avatar: payload.avatar,
      },
      guild: guild ?? undefined,
    })
  );
};
