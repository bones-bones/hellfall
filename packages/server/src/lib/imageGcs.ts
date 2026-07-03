import { Storage } from '@google-cloud/storage';
import { env } from '../api/lib/env.ts';

let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) storage = new Storage();
  return storage;
}

type ParsedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

function contentTypeToExtension(contentType: string): string {
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  switch (normalized) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.png';
  }
}

function parseImageBase64(imageBase64: string): ParsedImage {
  const trimmed = imageBase64.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUrlMatch) {
    const contentType = dataUrlMatch[1].trim();
    const buffer = Buffer.from(dataUrlMatch[2], 'base64');
    return {
      buffer,
      contentType,
      extension: contentTypeToExtension(contentType),
    };
  }

  const buffer = Buffer.from(trimmed, 'base64');
  return { buffer, contentType: 'image/png', extension: '.png' };
}

function slugObjectName(name: string): string {
  const base = name.trim() || 'image';
  return base.replace(/\//g, '|').replace(/[^\w\-.]+/g, '_').slice(0, 180);
}

export function publicGcsUrl(bucketName: string, objectKey: string): string {
  const encoded = objectKey
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  return `https://storage.googleapis.com/${bucketName}/${encoded}`;
}

export function isImageGcsConfigured(): boolean {
  return Boolean(env.IMAGE_GCS_CARD_IMAGE_BUCKET);
}

const GCS_HOSTS = ['storage.googleapis.com', 'storage.cloud.google.com'] as const;

/** Parse a public GCS HTTPS URL into bucket + object key, or null if not a GCS URL. */
export function parseGcsPublicUrl(
  url: string,
  expectedBucket?: string
): { bucket: string; objectKey: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!GCS_HOSTS.includes(parsed.hostname as (typeof GCS_HOSTS)[number])) {
    return null;
  }
  const pathParts = parsed.pathname.replace(/^\//, '').split('/');
  const bucket = pathParts.shift();
  if (!bucket) return null;
  const objectKey = decodeURIComponent(pathParts.join('/'));
  if (!objectKey) return null;
  if (expectedBucket && bucket !== expectedBucket) return null;
  return { bucket, objectKey };
}

/** Overwrite an existing GCS object (same URL) with new image bytes. */
export async function replaceImageBase64AtGcsUrl(
  imageBase64: string,
  existingUrl: string,
  bucketName = env.IMAGE_GCS_CARD_IMAGE_BUCKET
): Promise<string> {
  const parsed = parseGcsPublicUrl(existingUrl, bucketName);
  if (!parsed) {
    throw new Error('not_gcs_url');
  }
  const { buffer, contentType } = parseImageBase64(imageBase64);
  const bucket = getStorage().bucket(parsed.bucket);
  await bucket.file(parsed.objectKey).save(buffer, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  return existingUrl.trim();
}

/** Upload base64 image bytes to GCS and return a public HTTPS URL. */
export async function uploadImageBase64ToGcs(
  imageBase64: string,
  objectName: string
): Promise<string> {
  const bucketName = env.IMAGE_GCS_CARD_IMAGE_BUCKET;
  const { buffer, contentType, extension } = parseImageBase64(imageBase64);
  const objectKey = `${slugObjectName(objectName)}${extension}`;

  const bucket = getStorage().bucket(bucketName);
  await bucket.file(objectKey).save(buffer, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return publicGcsUrl(bucketName, objectKey);
}
