import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { withCors } from './api/lib/cors.js';
import type { HandlerRequest, HandlerResponse } from './api/lib/types.js';
import { meHandler } from './api/me.js';
import { logoutHandler } from './api/logout.js';
import { tagHandler } from './api/tag.js';
import { watchwolfHandler } from './api/watchwolf.js';
import { loginHandler } from './api/discord/login.js';
import { callbackHandler } from './api/discord/callback.js';
import { doneHandler } from './api/discord/done.js';
import { cardTagsHandler } from './api/cardTags.js';
import { cardJsonHandler, cardTextHandler } from './api/cardData.js';
import { pushProp } from '@hellfall/shared/utils';
import { searchHandler } from './api/search.js';

const PORT = Number(process.env.PORT) || 3003;

const routes: Record<string, (req: HandlerRequest, res: HandlerResponse) => void | Promise<void>> =
{
  '/api/me': meHandler,
  '/api/logout': logoutHandler,
  '/api/tag': tagHandler,
  '/api/watchwolf': watchwolfHandler,
  '/api/discord/login': loginHandler,
  '/api/discord/callback': callbackHandler,
  '/api/discord/done': doneHandler,
};

const CARD_API_PREFIX = '/api/cards/';

function parseCardIDFromPath(path: string): string | null {
  if (!path.startsWith(CARD_API_PREFIX)) return null;

  const rest = path.slice(CARD_API_PREFIX.length);
  const parts = rest.split('/').filter(p => p !== '');

  if (parts.length === 0) return null;

  const cardId = parts[0];
  return cardId;
}

function parseQuery(search: string | null): Record<string, string | string[]> {
  if (!search) return {};
  const params = new URLSearchParams(search);
  const out: Record<string, string | string[]> = {};
  for (const [key, values] of params) {
    const prev = out[key];
    if (prev === undefined) {
      out[key] = values;
    } else if (Array.isArray(prev)) prev.push(values);
    else out[key] = [prev, values];
  }
  return out;
}

createServer(async (incoming: IncomingMessage, res: ServerResponse) => {
  try {
    const req = incoming as HandlerRequest;
    const { pathname, search } = parseUrl(req.url ?? '/', true);
    const path = pathname ?? '/';
    req.query = parseQuery(search);
    const cardId = parseCardIDFromPath(path);

    if (cardId) {
      // Handle different formats
      if (cardId == 'search') {
        await searchHandler(req, res as HandlerResponse);
        return;
      }
      if (req.query.format == 'tags') {
        await cardTagsHandler(req, res as HandlerResponse, cardId);
        return;
      } else if (req.query.format === 'text') {
        await cardTextHandler(req, res as HandlerResponse, cardId);
        return;
      } else if (req.query.format) {
        await cardJsonHandler(req, res as HandlerResponse, cardId);
        return;
      }
      const headers = withCors({ 'Content-Type': 'application/json' }, req);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Format must be one of: json, text, tags' }));
      return;
    }
    const loader = routes[path];
    if (!loader) {
      const headers = withCors({ 'Content-Type': 'application/json' }, req);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    await loader(req, res as HandlerResponse);
  } catch (err) {
    console.error(err);
    if (res.writableEnded) return;
    try {
      const headers = withCors({ 'Content-Type': 'application/json' }, incoming);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } catch (sendErr) {
      console.error('failed to send 500 response', sendErr);
      res.destroy();
    }
  }
}).listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});
