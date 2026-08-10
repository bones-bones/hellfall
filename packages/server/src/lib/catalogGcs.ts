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

/** Download gzip-compressed catalog from GCS. Returns null when bucket is not configured. */
export async function downloadCatalogGzipFromGcs(): Promise<Buffer | null> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) return null;

  const file = getStorage().bucket(bucketName).file(env.CATALOG_GCS_OBJECT);
  const [[contents], [meta]] = await Promise.all([file.download(), file.getMetadata()]);
  if (meta.contentEncoding === 'gzip') {
    return contents;
  }
  return gzipSync(contents);
}

/** Download cached catalog JSON from GCS. Returns null when bucket is not configured. */
export async function downloadCatalogBodyFromGcs(): Promise<string | null> {
  const gzipBody = await downloadCatalogGzipFromGcs();
  if (!gzipBody) return null;
  return gunzipSync(gzipBody).toString('utf-8');
}

/** Upload gzip-compressed catalog JSON and manifest after a publish. Requires CATALOG_GCS_BUCKET. */
export async function uploadCatalogGzipToGcs(
  gzipBody: Buffer,
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
  const compressed = gzipBody;
  const bucket = getStorage().bucket(bucketName);
  const catalogObject = env.CATALOG_GCS_OBJECT;
  const manifestObject = env.CATALOG_GCS_MANIFEST_OBJECT;

  console.log(
    `[catalog/gcs] uploading catalog gs://${bucketName}/${catalogObject} (${compressed.length} bytes gzip)`
  );
  await bucket.file(catalogObject).save(compressed, {
    contentType: 'application/json',
    metadata: {
      contentEncoding: 'gzip',
      cacheControl: 'public, max-age=259200',
    },
  });
  console.log(
    `[catalog/gcs] catalog upload done, writing manifest gs://${bucketName}/${manifestObject}`
  );
  await bucket.file(manifestObject).save(JSON.stringify(manifest), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=300',
    },
  });
  console.log(
    `[catalog/gcs] manifest upload done version=${manifest.version} cards=${manifest.cardCount}`
  );
  return manifest;
}

/** Upload gzip-compressed catalog JSON and manifest after a publish. Requires CATALOG_GCS_BUCKET. */
export async function uploadCatalogToGcs(
  body: string,
  cardCount: number,
  /** Reuse a gzip buffer already built for the in-memory cache (avoids a second gzip of ~14MB). */
  gzipBody?: Buffer
): Promise<CatalogManifest> {
  return uploadCatalogGzipToGcs(gzipBody ?? gzipSync(body), cardCount);
}
