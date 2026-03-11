import { env } from "../lib/env.js";
import { withCors } from "../lib/cors.js";
import type { HandlerRequest, HandlerResponse } from "../lib/types.js";

/**
 * Same-origin redirect so the browser stores the session cookie before going to the frontend.
 * Some browsers drop cookies when the callback responds with 302 to a different origin.
 */
export const doneHandler = (req: HandlerRequest, res: HandlerResponse): void => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end();
    return;
  }
  const auth = typeof req.query?.auth === "string" ? req.query.auth : "ok";
  Object.entries(withCors({}, req)).forEach(([header, value]) => res.setHeader(header, value));
  res.writeHead(302, { Location: `${env.FRONTEND_URL}?auth=${auth}` });
  res.end();
};
