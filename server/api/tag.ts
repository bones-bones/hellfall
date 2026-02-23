import { env } from "./lib/env.js";
import { verifySessionToken } from "./lib/jwt.js";
import { withCors } from "./lib/cors.js";
import { getUserAsGuildMember } from "./lib/discord.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const tagHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
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
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return;
  }

  const roleId = env.DISCORD_TAG_ROLE_ID;
  if (!roleId) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: "role_not_configured" }));
    return;
  }

  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token;
  if (!guildId || !discordAccessToken) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return;
  }

  const guild = await getUserAsGuildMember(discordAccessToken, guildId);
  if (!guild) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: "not_in_guild" }));
    return;
  }

  const hasRole = guild.roles.includes(roleId);
  if (!hasRole) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: "missing_role" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
