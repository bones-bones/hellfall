import { env } from './lib/env.ts';
import { withCors } from './lib/cors.ts';
import { getSession, resolveGuildRoles } from './lib/session.ts';
import { DATABASE_CONTRIBUTOR } from './discord/constants.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

export const meHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const payload = await getSession(req);
  if (!payload) {
    res.statusCode = 200;
    res.end(JSON.stringify({ user: null }));
    return;
  }

  let guild: { nick: string | null; roles: string[] } | null = null;
  const result = await resolveGuildRoles(payload, res);
  if (result.kind === 'ok') {
    guild = { nick: result.nick, roles: result.roles };
  }

  const contributorRoleId = env.DISCORD_TAG_ROLE_ID ?? DATABASE_CONTRIBUTOR;
  const isContributor = guild?.roles.includes(contributorRoleId) ?? false;
  const isAdmin = guild?.roles.includes(env.DISCORD_ADMIN_ROLE_ID) ?? false;

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      user: {
        id: payload.sub,
        username: guild?.nick || payload.username,
        avatar: payload.avatar,
        isContributor,
        isAdmin,
      },
      guild: guild ?? undefined,
    })
  );
};
