import { exchangeCodeForToken, getDiscordUser, getUserAsGuildMember } from '../lib/discord/discord.ts';
import { env } from '../lib/env.ts';
import { createSessionToken } from '../lib/jwt.ts';
import { withCors } from '../lib/cors.ts';
import type { HandlerRequest, HandlerResponse } from '../lib/types.ts';

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) {
    return null;
  }
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const callbackHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const code = typeof req.query?.code === 'string' ? req.query.code : null;
  const state = typeof req.query?.state === 'string' ? req.query.state : null;
  const savedState = getCookie(req, 'discord_oauth_state');

  if (!code || !state || state !== savedState) {
    Object.entries(withCors({}, req)).forEach(([header, value]) => res.setHeader(header, value));
    res.writeHead(302, { Location: `${env.AUTH_SERVER_URL}/api/discord/done?auth=error` });
    res.end();
    return;
  }

  try {
    const redirectUri = `${env.AUTH_SERVER_URL}/api/discord/callback`;
    const token = await exchangeCodeForToken(
      code,
      redirectUri,
      env.DISCORD_CLIENT_ID,
      env.DISCORD_CLIENT_SECRET
    );
    const user = await getDiscordUser(token.access_token);

    let guildRoles: string[] | undefined;
    let guildNick: string | null | undefined;
    let rolesFetchedAt: number | undefined;
    const guildId = env.DISCORD_GUILD_ID;
    if (guildId) {
      const gm = await getUserAsGuildMember(token.access_token, guildId);
      if (gm.kind === 'member') {
        guildRoles = gm.roles;
        guildNick = gm.nick;
        rolesFetchedAt = Math.floor(Date.now() / 1000);
      }
    }

    const sessionToken = await createSessionToken({
      sub: user.id,
      username: user.username,
      avatar: user.avatar,
      email: user.email ?? null,
      discord_access_token: token.access_token,
      guild_roles: guildRoles,
      guild_nick: guildNick,
      roles_fetched_at: rolesFetchedAt,
    });

    const isProd = env.AUTH_SERVER_URL.startsWith('https');
    const cookieParts = [
      `${env.COOKIE_NAME}=${sessionToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=604800', // 7 days
      ...(isProd ? ['Secure'] : []),
    ];
    if (env.COOKIE_DOMAIN) cookieParts.push(`Domain=${env.COOKIE_DOMAIN}`);
    const cookie = cookieParts.join('; ');

    res.setHeader('Set-Cookie', [`discord_oauth_state=; Path=/; HttpOnly; Max-Age=0`, cookie]);
    Object.entries(withCors({}, req)).forEach(([header, value]) => res.setHeader(header, value));
    // Redirect to same origin first so the browser stores the cookie (then /done redirects to frontend)
    const doneUrl = `${env.AUTH_SERVER_URL}/api/discord/done?auth=ok`;
    res.writeHead(302, { Location: doneUrl });
    res.end();
  } catch (err) {
    console.error('discord/callback', err);
    Object.entries(withCors({}, req)).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(302, { Location: `${env.AUTH_SERVER_URL}/api/discord/done?auth=error` });
    res.end();
  }
};
