import * as jose from "jose";
import { env } from "./env.js";

export interface SessionPayload {
  sub: string; // Discord user id
  username: string;
  avatar: string | null;
  email?: string | null;
  discord_access_token?: string; // OAuth token for Discord API calls (e.g. guild info)
  iat?: number;
  exp?: number;
  iss?: string;
}

const ALG = "HS256";

export async function createSessionToken(payload: Omit<SessionPayload, "iat" | "exp" | "iss">): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const claims: Record<string, unknown> = {
    sub: payload.sub,
    username: payload.username,
    avatar: payload.avatar,
    email: payload.email,
  };
  if (payload.discord_access_token) claims.discord_access_token = payload.discord_access_token;
  return new jose.SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuer(env.JWT_ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
    });
    return {
      sub: payload.sub as string,
      username: (payload.username as string) ?? "",
      avatar: (payload.avatar as string | null) ?? null,
      email: (payload.email as string | null) ?? null,
      discord_access_token: payload.discord_access_token as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
      iss: payload.iss as string,
    };
  } catch {
    return null;
  }
}
