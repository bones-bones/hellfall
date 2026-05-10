const DISCORD_API = "https://discord.com/api";

/** Logs every outbound Discord REST call for diagnosing rate limits. */
async function discordApiFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const pathForLog = url.startsWith(DISCORD_API) ? url.slice(DISCORD_API.length) : url;
  const start = Date.now();
  const res = await fetch(url, init);
  const ms = Date.now() - start;
  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  const resetAfter = res.headers.get("x-ratelimit-reset-after");
  const scope = res.headers.get("x-ratelimit-scope");
  const retryAfter = res.headers.get("retry-after");
  const parts = [`[discord-api] ${method} ${pathForLog} -> ${res.status} ${ms}ms`];
  if (limit != null) { parts.push(`limit=${limit}`) }
  if (remaining != null) { parts.push(`remaining=${remaining}`) }
  if (resetAfter != null) parts.push(`resetAfter=${resetAfter}s`);
  if (scope != null) parts.push(`scope=${scope}`);
  if (retryAfter != null) parts.push(`retryAfter=${retryAfter}`);
  console.log(parts.join(" "));
  return res;
}

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  global_name: string | null;
  email?: string | null;
  verified?: boolean;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await discordApiFetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord token exchange failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<DiscordTokenResponse>;
}

export async function getDiscordUser(accessToken: string) {
  const res = await discordApiFetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord user fetch failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<DiscordUser>;
}

/** Result of looking up the current user in a guild (OAuth token is short-lived; JWT session is longer). */
type GuildMemberLookup =
  | { kind: "member"; nick: string | null; roles: string[]; }
  | { kind: "not_member" }
  /** Discord rejected the bearer token (expired/revoked) — user should log in again. */
  | { kind: "oauth_invalid" };

/** Requires OAuth scope guilds.members.read. */
export async function getUserAsGuildMember(accessToken: string, guildId: string): Promise<GuildMemberLookup> {
  const res = await discordApiFetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 404) { return { kind: "not_member" } };
  if (res.status === 401 || res.status === 403) {
    const text = await res.text();
    console.error("Discord guild member: OAuth token invalid:", res.status, text);
    return { kind: "oauth_invalid" };
  }
  if (!res.ok) {
    const text = await res.text();
    console.error("Discord guild member fetch failed:", res.status, text);
    return { kind: "not_member" };
  }
  const data = (await res.json()) as { nick?: string | null; roles: string[] };
  return {
    kind: "member",
    nick: data.nick ?? null,
    roles: data.roles ?? [],
  };
}

export function buildAuthorizeUrl(
  { clientId, redirectUri, state, scope }: {
    clientId: string,
    redirectUri: string,
    state: string,
    scope: string[]
  }
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope.join("+"),
    state,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
