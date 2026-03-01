const DISCORD_API = "https://discord.com/api";

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface DiscordUser {
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

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
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
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord user fetch failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<DiscordUser>;
}

/** Requires OAuth scope guilds.members.read. Returns current user's member info for the guild. */
export async function getUserAsGuildMember(
  accessToken: string,
  guildId: string,
): Promise<{ nick: string | null; roles: string[]; joined_at: string | null } | null> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });


  if (res.status === 404) { return null; }
  if (!res.ok) {
    const text = await res.text();
    console.error("Discord guild member fetch failed:", res.status, text);
    return null;
  }
  const data = (await res.json()) as { nick?: string | null; roles: string[]; joined_at?: string | null };
  return {
    nick: data.nick ?? null,
    roles: data.roles ?? [],
    joined_at: data.joined_at ?? null,
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
