import { randomUUID } from 'node:crypto';
import { Transform, type Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
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

const CATALOG_GZIP_WRITE_OPTIONS = {
  contentType: 'application/json',
  resumable: true,
  metadata: {
    contentEncoding: 'gzip',
    cacheControl: 'public, max-age=259200',
  },
} as const;

async function writeCatalogManifest(
  bucketName: string,
  cardCount: number
): Promise<CatalogManifest> {
  const manifest: CatalogManifest = {
    version: new Date().toISOString(),
    cardCount,
  };
  const manifestObject = env.CATALOG_GCS_MANIFEST_OBJECT;
  console.log(`[catalog/gcs] writing manifest gs://${bucketName}/${manifestObject}`);
  await getStorage()
    .bucket(bucketName)
    .file(manifestObject)
    .save(JSON.stringify(manifest), {
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

/**
 * Pipe a gzip catalog into GCS without holding the file in memory.
 * Writes a UUID temp object, then moves it over `catalog.json` so readers never see a partial object.
 */
export async function uploadCatalogGzipStreamToGcs(
  produce: (dest: Writable) => Promise<{ cardCount: number }>
): Promise<{ manifest: CatalogManifest; bytes: number; cardCount: number }> {
  const bucketName = env.CATALOG_GCS_BUCKET;
  if (!bucketName) {
    throw new Error('CATALOG_GCS_BUCKET is required to upload catalog');
  }

  const bucket = getStorage().bucket(bucketName);
  const catalogObject = env.CATALOG_GCS_OBJECT;
  const tmpObject = `${catalogObject}.${randomUUID()}.tmp`;
  const tmpFile = bucket.file(tmpObject);

  let bytes = 0;
  const counter = new Transform({
    transform(chunk, _enc, cb) {
      bytes += (chunk as Buffer).length;
      cb(null, chunk);
    },
  });
  const gcs = tmpFile.createWriteStream(CATALOG_GZIP_WRITE_OPTIONS);
  counter.pipe(gcs);

  console.log(`[catalog/gcs] streaming catalog gs://${bucketName}/${tmpObject}`);
  try {
    const { cardCount } = await produce(counter);
    await finished(gcs);
    console.log(
      `[catalog/gcs] stream complete gzip=${bytes}, moving to gs://${bucketName}/${catalogObject}`
    );
    await tmpFile.move(catalogObject);
    const manifest = await writeCatalogManifest(bucketName, cardCount);
    return { manifest, bytes, cardCount };
  } catch (err) {
    gcs.destroy();
    await tmpFile.delete({ ignoreNotFound: true }).catch(() => undefined);
    throw err;
  }
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

  const catalogObject = env.CATALOG_GCS_OBJECT;
  console.log(
    `[catalog/gcs] uploading catalog gs://${bucketName}/${catalogObject} (${gzipBody.length} bytes gzip)`
  );
  await getStorage()
    .bucket(bucketName)
    .file(catalogObject)
    .save(gzipBody, CATALOG_GZIP_WRITE_OPTIONS);
  return writeCatalogManifest(bucketName, cardCount);
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
