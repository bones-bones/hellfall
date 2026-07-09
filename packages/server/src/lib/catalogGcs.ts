import { gunzipSync, gzipSync } from 'node:zlib';
import { Storage } from '@google-cloud/storage';
import { env } from '../api/lib/env.ts';

let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) storage = new Storage();
  return storage;
}

export type CatalogManifest = {
  version: string;
  cardCount: number;
};

export function isCatalogGcsConfigured(): boolean {
  return Boolean(env.CATALOG_GCS_BUCKET);
}

/** Public URL browsers are redirected to from GET /api/cards/load (when set). */
export function getCatalogPublicUrl(): string | undefined {
  if (env.CATALOG_PUBLIC_URL) return env.CATALOG_PUBLIC_URL.replace(/\/$/, '');
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) return undefined;
  return `https://storage.googleapis.com/${bucketName}/${env.CATALOG_GCS_OBJECT}`;
}

/** Download cached catalog JSON from GCS. Returns null when bucket is not configured. */
export async function downloadCatalogBodyFromGcs(): Promise<string | null> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) return null;

  const file = getStorage().bucket(bucketName).file(env.CATALOG_GCS_OBJECT);
  const [[contents], [meta]] = await Promise.all([file.download(), file.getMetadata()]);
  if (meta.contentEncoding === 'gzip') {
    return gunzipSync(contents).toString('utf-8');
  }
  return contents.toString('utf-8');
}

/** Upload gzip-compressed catalog JSON and manifest after a publish. Requires CATALOG_GCS_BUCKET. */
export async function uploadCatalogToGcs(
  body: string,
  cardCount: number
): Promise<CatalogManifest> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) {
    throw new Error('CATALOG_GCS_BUCKET is required to upload catalog');
  }

  const manifest: CatalogManifest = {
    version: new Date().toISOString(),
    cardCount,
  };
  const gzipBody = gzipSync(body);
  const bucket = getStorage().bucket(bucketName);
  await bucket.file(env.CATALOG_GCS_OBJECT).save(gzipBody, {
    contentType: 'application/json',
    metadata: {
      contentEncoding: 'gzip',
      cacheControl: 'public, max-age=259200',
    },
  });
  await bucket.file(env.CATALOG_GCS_MANIFEST_OBJECT).save(JSON.stringify(manifest), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=300',
    },
  });
  return manifest;
}
