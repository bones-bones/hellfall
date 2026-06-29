import { env, withCors, HandlerRequest, HandlerResponse } from './lib';

export const logoutHandler = (req: HandlerRequest, res: HandlerResponse): void => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
    res.end();
    return;
  }

  const clearCookie = `${env.COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    env.COOKIE_DOMAIN ? `; Domain=${env.COOKIE_DOMAIN}` : ''
  }`;
  res.setHeader('Set-Cookie', clearCookie);
  Object.entries(withCors({}, req)).forEach(([k, v]) => res.setHeader(k, v));

  const redirect = typeof req.query?.redirect === 'string' ? req.query.redirect : env.FRONTEND_URL;
  res.writeHead(302, { Location: redirect });
  res.end();
};
