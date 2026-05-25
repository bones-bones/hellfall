import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) return fromEnv;

  const candidates = [
    join(process.cwd(), 'packages/shared/src/data'),
    join(dirname(fileURLToPath(import.meta.url)), '../../../shared/src/data'),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, 'Hellscube-Database.json'))) return dir;
  }

  return candidates[0];
}

export function readDataJson<T>(filename: string): T {
  const path = join(resolveDataDir(), filename);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}
