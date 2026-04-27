import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: join(backendRoot, '.env') });

const key = process.env.GOOGLE_SHEETS_API_KEY?.trim();
if (!key) {
  throw new Error(
    'GOOGLE_SHEETS_API_KEY is not set. Copy packages/backend/.env.example to packages/backend/.env, or export the variable (e.g. in GitHub Actions secrets).',
  );
}

export const sheetsKey = key;
