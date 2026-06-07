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

/** Download cached catalog JSON from GCS. Returns null when bucket is not configured. */
export async function downloadCatalogBodyFromGcs(): Promise<string | null> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) return null;

  const [contents] = await getStorage()
    .bucket(bucketName)
    .file(env.CATALOG_GCS_OBJECT)
    .download();
  return contents.toString('utf-8');
}

/** Upload catalog JSON and manifest after a publish. Requires CATALOG_GCS_BUCKET. */
export async function uploadCatalogToGcs(body: string, cardCount: number): Promise<CatalogManifest> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) {
    throw new Error('CATALOG_GCS_BUCKET is required to upload catalog');
  }

  const manifest: CatalogManifest = {
    version: new Date().toISOString(),
    cardCount,
  };
  const bucket = getStorage().bucket(bucketName);
  await bucket.file(env.CATALOG_GCS_OBJECT).save(body, {
    contentType: 'application/json',
    metadata: { cacheControl: 'public, max-age=60' },
  });
  await bucket.file(env.CATALOG_GCS_MANIFEST_OBJECT).save(JSON.stringify(manifest), {
    contentType: 'application/json',
  });
  return manifest;
}
