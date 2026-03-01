import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parse as parseUrl } from "node:url";
import type { HandlerRequest, HandlerResponse } from "./api/lib/types.js";
import { meHandler } from "./api/me.js";
import { logoutHandler } from "./api/logout.js";
import { tagHandler } from "./api/tag.js";
import { watchwolfHandler } from "./api/watchwolf.js";
import { loginHandler } from "./api/discord/login.js";
import { callbackHandler } from "./api/discord/callback.js";

const PORT = Number(process.env.PORT) || 3003;

const routes: Record<string, (req: HandlerRequest, res: HandlerResponse) => void | Promise<void>> = {
  "/api/me": meHandler,
  "/api/logout": logoutHandler,
  "/api/tag": tagHandler,
  "/api/watchwolf": watchwolfHandler,
  "/api/discord/login": loginHandler,
  "/api/discord/callback": callbackHandler
};

function parseQuery(search: string | null): Record<string, string | string[]> {
  if (!search) return {};
  const params = new URLSearchParams(search);
  const out: Record<string, string | string[]> = {};
  for (const [key, values] of params) {
    const prev = out[key];
    if (prev === undefined) { out[key] = values }
    else if (Array.isArray(prev)) prev.push(values);
    else out[key] = [prev, values];
  }
  return out;
}

createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const { pathname, search } = parseUrl(req.url ?? "/", true);
  const path = pathname ?? "/";

  const loader = routes[path];
  if (!loader) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  (req as HandlerRequest).query = parseQuery(search);
  await loader(req as HandlerRequest, res as HandlerResponse);
}).listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});
