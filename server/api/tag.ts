import { withCors } from "./lib/cors.js";
import { requireTagAuth } from "./lib/requireTagAuth.js";
import type { HandlerRequest, HandlerResponse } from "./lib/types.js";

export const tagHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ "Content-Type": "application/json" }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
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

  const auth = await requireTagAuth(req, res);
  if (!auth) return;

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
