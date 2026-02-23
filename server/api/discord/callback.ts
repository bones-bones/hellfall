import { exchangeCodeForToken, getDiscordUser } from "../lib/discord.js";
import { env } from "../lib/env.js";
import { createSessionToken } from "../lib/jwt.js";
import { withCors } from "../lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "../lib/types.js";

function getCookie(req: HandlerRequest, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) { return null };
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const callbackHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end();
    return;
  }

  const code = typeof (req.query?.code) === "string" ? req.query.code : null;
  const state = typeof (req.query?.state) === "string" ? req.query.state : null;
  const savedState = getCookie(req, "discord_oauth_state");

  if (!code || !state || state !== savedState) {
    Object.entries(withCors({})).forEach(([header, value]) => res.setHeader(header, value));
    res.writeHead(302, { Location: `${env.FRONTEND_URL}?auth=error` });
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
    const sessionToken = await createSessionToken({
      sub: user.id,
      username: user.username,
      avatar: user.avatar,
      email: user.email ?? null,
      discord_access_token: token.access_token,
    });

    const isProd = env.AUTH_SERVER_URL.startsWith("https");
    const cookie = [
      `${env.COOKIE_NAME}=${sessionToken}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=604800", // 7 days
      ...(isProd ? ["Secure"] : []),
    ].join("; ");

    res.setHeader("Set-Cookie", [
      `discord_oauth_state=; Path=/; HttpOnly; Max-Age=0`,
      cookie,
    ]);
    Object.entries(withCors({})).forEach(([header, value]) => res.setHeader(header, value));
    res.writeHead(302, { Location: `${env.FRONTEND_URL}?auth=ok` });
    res.end();
  } catch (err) {
    console.error("discord/callback", err);
    Object.entries(withCors({})).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(302, { Location: `${env.FRONTEND_URL}?auth=error` });
    res.end();
  }
}
