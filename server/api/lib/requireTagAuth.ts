import type { HandlerRequest, HandlerResponse } from "./types.js";
import { env } from "./env.js";
import { verifySessionToken } from "./jwt.js";
import { getUserAsGuildMember } from "./discord.js";
import { DATABASE_CONTRIBUTOR } from "../discord/constants.js";

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Verifies session and DATABASE_CONTRIBUTOR role. Returns payload or sends error and returns null. */
export async function requireTagAuth(
  req: HandlerRequest,
  res: HandlerResponse
): Promise<{ sub: string; discord_access_token: string } | null> {
  const token = getCookie(req, env.COOKIE_NAME);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return null;
  }

  const roleId = DATABASE_CONTRIBUTOR;
  if (!roleId) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: "role_not_configured" }));
    return null;
  }

  const guildId = env.DISCORD_GUILD_ID;
  const discordAccessToken = payload.discord_access_token as string | undefined;
  if (!guildId || !discordAccessToken) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: "invalid_session" }));
    return null;
  }

  const guild = await getUserAsGuildMember(discordAccessToken, guildId);
  if (!guild) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: "not_in_guild" }));
    return null;
  }

  if (!guild.roles.includes(roleId)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false, reason: "missing_role" }));
    return null;
  }

  return { sub: payload.sub as string, discord_access_token: discordAccessToken };
}
