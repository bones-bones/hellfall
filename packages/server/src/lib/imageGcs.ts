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

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function normalizeImageMime(contentType: string | undefined): string | undefined {
  if (!contentType) return undefined;
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  if (normalized === 'image/jpg') return 'image/jpeg';
  if (normalized in IMAGE_MIME_TO_EXT) return normalized;
  return undefined;
}

function contentTypeToExtension(contentType: string): string {
  const normalized = normalizeImageMime(contentType) ?? contentType;
  return IMAGE_MIME_TO_EXT[normalized] ?? '.png';
}

function sniffImageMime(buffer: Buffer): string | undefined {
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'GIF8') {
    return 'image/gif';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return undefined;
}

/** Decode postcard/replace-image base64. Magic bytes win over mime / data-URL type. */
export function parseImageBase64(imageBase64: string, imageMimeType?: string): ParsedImage {
  const trimmed = imageBase64.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  let buffer: Buffer;
  let dataUrlMime: string | undefined;
  if (dataUrlMatch) {
    dataUrlMime = dataUrlMatch[1].trim();
    buffer = Buffer.from(dataUrlMatch[2], 'base64');
  } else {
    buffer = Buffer.from(trimmed, 'base64');
  }

  const contentType =
    sniffImageMime(buffer) ||
    normalizeImageMime(imageMimeType) ||
    normalizeImageMime(dataUrlMime) ||
    'image/png';

  return {
    buffer,
    contentType,
    extension: contentTypeToExtension(contentType),
  };
}

function slugCardName(name: string): string {
  const base = name.trim() || 'image';
  return base
    .replace(/\//g, '|')
    .replace(/[^\w\-. ]+/g, '_')
    .replace(/ +/g, ' ')
    .slice(0, 180);
}

/** Build `{id} - {card name}` without slugging or truncating the id. */
function cardImageObjectKey(cardId: string, cardName: string, extension: string): string {
  const id = cardId.trim();
  if (!id) throw new Error('missing_card_id');
  return `${id} - ${slugCardName(cardName)}${extension}`;
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
  bucketName = env.IMAGE_GCS_CARD_IMAGE_BUCKET,
  imageMimeType?: string
): Promise<string> {
  const parsed = parseGcsPublicUrl(existingUrl, bucketName);
  if (!parsed) {
    throw new Error('not_gcs_url');
  }
  const { buffer, contentType } = parseImageBase64(imageBase64, imageMimeType);
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
  cardId: string,
  cardName: string,
  imageMimeType?: string
): Promise<string> {
  const bucketName = env.IMAGE_GCS_CARD_IMAGE_BUCKET;
  const { buffer, contentType, extension } = parseImageBase64(imageBase64, imageMimeType);
  const objectKey = cardImageObjectKey(cardId, cardName, extension);

  const bucket = getStorage().bucket(bucketName);
  await bucket.file(objectKey).save(buffer, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return publicGcsUrl(bucketName, objectKey);
}
