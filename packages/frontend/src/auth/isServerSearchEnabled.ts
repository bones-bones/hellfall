import { getAuthApiUrl } from './getAuthApiUrl';

/**
 * Truthy REACT_APP_SERVER_SEARCH enables the server-backed HellFall search path.
 * Values `0` and `false` are treated as off.
 */
export function isServerSearchEnabled(): boolean {
  const flag = process.env.REACT_APP_SERVER_SEARCH;
  if (!flag) return false;
  const normalized = flag.trim().toLowerCase();
  return normalized !== '0' && normalized !== 'false';
}

/**
 * Server search is used only when the flag is on and an auth API base URL is set.
 * Otherwise HellFall falls back to client-side search over the catalog.
 */
export function canUseServerSearch(): boolean {
  return isServerSearchEnabled() && Boolean(getAuthApiUrl().replace(/\/$/, ''));
}
