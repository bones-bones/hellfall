/**
 * Server-side env. Set these in .env for local dev or in your deployment config.
 */
export const env = {
  get DISCORD_CLIENT_ID(): string {
    const v = process.env.DISCORD_CLIENT_ID;
    if (!v) throw new Error("DISCORD_CLIENT_ID is required");
    return v;
  },
  get DISCORD_CLIENT_SECRET(): string {
    const v = process.env.DISCORD_CLIENT_SECRET;
    if (!v) throw new Error("DISCORD_CLIENT_SECRET is required");
    return v;
  },
  get JWT_SECRET(): string {
    const v = process.env.JWT_SECRET;
    if (!v) throw new Error("JWT_SECRET is required");
    return v;
  },

  get AUTH_SERVER_URL(): string {
    const v = process.env.AUTH_SERVER_URL;
    if (!v) return "http://localhost:3003";
    return v.startsWith("http") ? v : `https://${v}`;
  },
  /** Where to send the user after login (e.g. https://yoursite.github.io/hellfall). */
  get FRONTEND_URL(): string {
    return process.env.FRONTEND_URL || "http://localhost:3003/hellfall";
  },
  get COOKIE_NAME(): string {
    return process.env.COOKIE_NAME || "hellfall_session";
  },
  /** Optional: e.g. .skeleton.club so cookie works across subdomains (skeleton.club + api.skeleton.club). */
  get COOKIE_DOMAIN(): string | undefined {
    const v = process.env.COOKIE_DOMAIN;
    return v === "" ? undefined : v;
  },
  get JWT_ISSUER(): string {
    return process.env.JWT_ISSUER || "hellfall-auth";
  },

  get DISCORD_GUILD_ID(): string | undefined {
    return process.env.DISCORD_GUILD_ID;
  },
  /** Role ID required for /api/tag. Set when ready. */
  get DISCORD_TAG_ROLE_ID(): string | undefined {
    return process.env.DISCORD_TAG_ROLE_ID;
  },
};
