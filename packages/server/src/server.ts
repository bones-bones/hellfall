import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { withCors } from './api/lib/cors.ts';
import type { HandlerRequest, HandlerResponse } from './api/lib/types.ts';
import { meHandler } from './api/me.ts';
import { logoutHandler } from './api/logout.ts';
import { tagHandler } from './api/tag.ts';
import { watchwolfHandler } from './api/watchwolf.ts';
import { loginHandler } from './api/discord/login.ts';
import { callbackHandler } from './api/discord/callback.ts';
import { doneHandler } from './api/discord/done.ts';
import { cardTagsHandler } from './api/cardTags.ts';
import { cardJsonHandler, cardTextHandler } from './api/cardData.ts';
import { searchHandler } from './api/search.ts';
import { changesetsHandler } from './api/changesets.ts';
import { exportHellscubeHandler } from './api/exportHellscube.ts';

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
    '/api/admin/export-hellscube': exportHellscubeHandler,
  };

const CARD_API_PREFIX = '/api/cards/';
const CHANGESETS_PREFIX = '/api/changesets';

function parseCardIDFromPath(path: string): string | null {
  if (!path.startsWith(CARD_API_PREFIX)) return null;

  const rest = path.slice(CARD_API_PREFIX.length);
  const parts = rest.split('/').filter(p => p !== '');

  if (parts.length === 0) return null;

  return parts[0];
}

function parseCardTagsPath(
  path: string
): { cardId: string; tag: string | null; audit: boolean } | null {
  if (!path.startsWith(CARD_API_PREFIX)) return null;
  const rest = path.slice(CARD_API_PREFIX.length);
  const parts = rest.split('/');
  if (parts.length < 2 || parts[0] === '' || parts[1] !== 'tags') return null;
  const cardId = parts[0];
  if (parts.length >= 3 && parts[2] === 'audit') {
    return { cardId, tag: null, audit: true };
  }
  const tag = parts.length >= 3 && parts[2] !== '' ? parts[2] : null;
  return { cardId, tag, audit: false };
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

    if (req.method === 'OPTIONS') {
      const headers = withCors({}, req);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = 204;
      res.end();
      return;
    }

    if (path === CHANGESETS_PREFIX || path.startsWith(CHANGESETS_PREFIX + '/')) {
      const rest = path.slice(CHANGESETS_PREFIX.length).replace(/^\//, '');
      const parts = rest.split('/').filter(Boolean);
      const changesetId = parts[0] || null;
      const action = parts[1] || null;
      await changesetsHandler(req, res as HandlerResponse, changesetId, action);
      return;
    }

    const cardTagsParams = parseCardTagsPath(path);
    if (cardTagsParams) {
      await cardTagsHandler(
        req,
        res as HandlerResponse,
        cardTagsParams.cardId,
        cardTagsParams.tag,
        cardTagsParams.audit
      );
      return;
    }

    const cardId = parseCardIDFromPath(path);
    if (cardId) {
      if (cardId === 'search') {
        await searchHandler(req, res as HandlerResponse);
        return;
      }
      if (req.query.format === 'text') {
        await cardTextHandler(req, res as HandlerResponse, cardId);
        return;
      } else if (req.query.format) {
        await cardJsonHandler(req, res as HandlerResponse, cardId);
        return;
      }
      const headers = withCors({ 'Content-Type': 'application/json' }, req);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Format must be one of: json, text' }));
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
