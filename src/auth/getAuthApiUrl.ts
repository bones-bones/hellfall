/**
 * Base URL of the auth server (e.g. https://hellfall-auth.example.com).
 * Set REACT_APP_AUTH_API_URL in .env. If unset, Discord login is not shown.
 */
export function getAuthApiUrl(): string {
  return 'http://localhost:3003';
  // return process.env.REACT_APP_AUTH_API_URL ?? '';
}
