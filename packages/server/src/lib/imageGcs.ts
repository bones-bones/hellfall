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
