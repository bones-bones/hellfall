import { env } from "./lib/env.js";
import { verifySessionToken } from "./lib/jwt.js";
import { withCors } from "./lib/cors.js";
import { getUserAsGuildMember } from "./lib/discord.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) { return null };
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const meHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ "Content-Type": "application/json" });
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end();
    return;
  }

  const token = getCookie(req, env.COOKIE_NAME);
  if (!token) {
    console.log("No token");
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
  console.log(payload);

  let guild: { nick: string | null; roles: string[]; joined_at: string | null } | null = null;
  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token;
  if (guildId && discordAccessToken) {
    guild = await getUserAsGuildMember(discordAccessToken, guildId);
  }
  console.log(guild);

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      user: {
        id: payload.sub,
        username: payload.username,
        avatar: payload.avatar
      },
      guild: guild ?? undefined,
    })
  );
}
