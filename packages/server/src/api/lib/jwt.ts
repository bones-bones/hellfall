import * as jose from 'jose';
import { env } from './env.ts';
import { DATABASE_CONTRIBUTOR } from '../discord/constants.ts';

export interface SessionPayload {
  sub: string; // Discord user id
  username: string;
  avatar: string | null;
  email?: string | null;
  discord_access_token?: string; // OAuth token for Discord API calls (e.g. guild info)
  guild_roles?: string[];
  guild_nick?: string | null;
  roles_fetched_at?: number; // Unix epoch seconds when guild roles were last fetched
  iat?: number;
  exp?: number;
  iss?: string;
}

export const DEFAULT_DEV_SESSION:SessionPayload = {
  sub: 'dev-user',
  username: 'Developer',
  avatar: null,
  email: null,
  discord_access_token: 'dev',
  guild_roles:[DATABASE_CONTRIBUTOR],
  roles_fetched_at:Date.now(),

}

const ALG = 'HS256';

export async function createSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp' | 'iss'>
): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const claims: Record<string, unknown> = {
    sub: payload.sub,
    username: payload.username,
    avatar: payload.avatar,
    email: payload.email,
  };
  if (payload.discord_access_token) claims.discord_access_token = payload.discord_access_token;
  if (payload.guild_roles) claims.guild_roles = payload.guild_roles;
  if (payload.guild_nick !== undefined) claims.guild_nick = payload.guild_nick;
  if (payload.roles_fetched_at) claims.roles_fetched_at = payload.roles_fetched_at;
  return new jose.SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuer(env.JWT_ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
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
      username: (payload.username as string) ?? '',
      avatar: (payload.avatar as string | null) ?? null,
      email: (payload.email as string | null) ?? null,
      discord_access_token: payload.discord_access_token as string | undefined,
      guild_roles: (payload.guild_roles as string[] | undefined) ?? undefined,
      guild_nick: (payload.guild_nick as string | null | undefined) ?? undefined,
      roles_fetched_at: (payload.roles_fetched_at as number | undefined) ?? undefined,
      iat: payload.iat,
      exp: payload.exp,
      iss: payload.iss as string,
    };
  } catch {
    return null;
  }
}
