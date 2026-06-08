import { homedir } from 'node:os';
import { resolve } from 'node:path';

/** Expand `~` in GOOGLE_APPLICATION_CREDENTIALS (dotenv does not). */
export function resolveGoogleApplicationCredentials(): void {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!raw) return;

  if (raw.startsWith('~/')) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(homedir(), raw.slice(2));
    return;
  }
  if (raw === '~') {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = homedir();
  }
}
