import { env } from "./lib/env.js";
import { withCors } from "./lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";

export const logoutHandler = (req: HandlerRequest, res: HandlerResponse): void => {
  if (req.method === "OPTIONS") {
    Object.entries(withCors({})).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST");
    res.end();
    return;
  }

  const clearCookie = `${env.COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  res.setHeader("Set-Cookie", clearCookie);
  Object.entries(withCors({})).forEach(([k, v]) => res.setHeader(k, v));

  const redirect = typeof (req.query?.redirect) === "string" ? req.query.redirect : env.FRONTEND_URL;
  res.writeHead(302, { Location: redirect });
  res.end();
}
