import { randomBytes } from "node:crypto";
import { buildAuthorizeUrl } from "../lib/discord.js";
import { env } from "../lib/env.js";
import { withCors, getAllowedOrigin } from "../lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "../lib/types.js";

function randomState(): string {
  return randomBytes(24).toString("base64url");
}

export const loginHandler = (req: HandlerRequest, res: HandlerResponse): void => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", getAllowedOrigin());
    res.setHeader("Access-Control-Allow-Credentials", "true");
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

  try {
    const state = randomState();
    const redirectUri = `${env.AUTH_SERVER_URL}/api/discord/callback`;
    const url = buildAuthorizeUrl({ clientId: env.DISCORD_CLIENT_ID, redirectUri, state, scope: ["identify", "guilds.members.read", "guilds"] });

    res.setHeader("Set-Cookie", `discord_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
    Object.entries(withCors({})).forEach(([header, value]) => res.setHeader(header, value));
    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    console.error("discord/login", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Login failed" }));
  }
}
