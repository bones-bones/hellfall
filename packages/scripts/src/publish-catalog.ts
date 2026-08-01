/**
 * One-off: publish Firestore hellscube cards → GCS catalog.json
 * Usage: npx tsx src/publish-catalog.ts
 */
import { config } from 'dotenv';
import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Storage } from '@google-cloud/storage';
import { resolveGoogleApplicationCredentials } from './lib/resolveGoogleCredentials.ts';
import { loadHellscubeCatalogCards } from '@hellfall/shared/utils/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
resolveGoogleApplicationCredentials();

const BUCKET = process.env.CATALOG_GCS_BUCKET?.trim() || 'hellfall-489004-hellfall-catalog';
const OBJECT = process.env.CATALOG_GCS_OBJECT?.trim() || 'catalog.json';
const MANIFEST = process.env.CATALOG_GCS_MANIFEST_OBJECT?.trim() || 'catalog-manifest.json';

async function main() {
  console.log(`Loading cards from Firestore…`);
  const data = await loadHellscubeCatalogCards();
  console.log(`Loaded ${data.length} cards`);

  const body = JSON.stringify({ data });
  const compressed = gzipSync(body);
  const manifest = {
    version: new Date().toISOString(),
    cardCount: data.length,
  };

  const storage = new Storage();
  const bucket = storage.bucket(BUCKET);
  console.log(
    `Uploading gs://${BUCKET}/${OBJECT} (${body.length} bytes, gzip ${compressed.length})…`
  );
  await bucket.file(OBJECT).save(compressed, {
    contentType: 'application/json',
    metadata: {
      contentEncoding: 'gzip',
      cacheControl: 'public, max-age=259200',
    },
  });
  await bucket.file(MANIFEST).save(JSON.stringify(manifest), {
    contentType: 'application/json',
    metadata: { cacheControl: 'public, max-age=300' },
  });
  console.log(`Published version=${manifest.version} cards=${manifest.cardCount}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
