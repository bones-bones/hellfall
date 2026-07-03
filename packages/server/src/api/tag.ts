import { withCors, requireDatabaseRoleAuth, HandlerRequest, HandlerResponse } from './lib';

export const tagHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const auth = await requireDatabaseRoleAuth(req, res);
  if (!auth) return;

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
