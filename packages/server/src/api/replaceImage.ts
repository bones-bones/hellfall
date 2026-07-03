import { Firestore } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import {
  withCors,
  env,
  HandlerRequest,
  HandlerResponse,
  requireDatabaseRoleAuth,
} from './lib';
import { isImageGcsConfigured, replaceImageBase64AtGcsUrl } from '../lib/imageGcs.ts';
import { cardsCollection, firestoreToCard } from '@hellfall/shared/utils/firestore';
import { isValidV4UUID, toFaces } from '@hellfall/shared/utils';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

const imageProps = [
  'image',
  'still_image',
  'rotated_image',
  'print_image',
  'rotated_print_image',
  'still_print_image',
] as const;

type ImageProp = (typeof imageProps)[number];

function isImageProp(value: unknown): value is ImageProp {
  return typeof value === 'string' && imageProps.includes(value as ImageProp);
}

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function resolveImageUrl(
  card: HCCard.Any,
  faceIndex: number | undefined,
  imageProp: ImageProp
): string | undefined {
  const faces = toFaces(card);
  const index = faceIndex ?? 0;
  if ('card_faces' in card && index < faces.length) {
    const faceValue = (faces[index] as Record<string, unknown>)[imageProp];
    if (typeof faceValue === 'string' && faceValue.trim()) {
      return faceValue.trim();
    }
  }
  const rootValue = (card as Record<string, unknown>)[imageProp];
  if (typeof rootValue === 'string' && rootValue.trim()) {
    return rootValue.trim();
  }
  return undefined;
}

/** POST /api/cards/:cardId/image — replace image bytes at the existing GCS URL. */
export const replaceImageHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  const auth = await requireDatabaseRoleAuth(req, res);
  if (!auth) return;

  if (!isImageGcsConfigured()) {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, reason: 'image_gcs_not_configured' }));
    return;
  }

  if (!cardId || !isValidV4UUID(cardId)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_card_id' }));
    return;
  }

  let body: { imageBase64?: string; faceIndex?: number; imageProp?: string };
  try {
    body = (await readJsonBody(req)) as typeof body;
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
    return;
  }

  if (typeof body.imageBase64 !== 'string' || !body.imageBase64.trim()) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'missing_image' }));
    return;
  }

  const imageProp: ImageProp = isImageProp(body.imageProp) ? body.imageProp : 'image';
  const faceIndex =
    typeof body.faceIndex === 'number' && Number.isInteger(body.faceIndex) && body.faceIndex >= 0
      ? body.faceIndex
      : undefined;

  const snap = await cardsCol.doc(cardId).get();
  if (!snap.exists) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'card_not_found' }));
    return;
  }

  const card = firestoreToCard(snap.data()!);
  if (card.kind === 'scryfall') {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'no_modifying_scryfall' }));
    return;
  }

  const existingUrl = resolveImageUrl(card, faceIndex, imageProp);
  if (!existingUrl) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'no_existing_image' }));
    return;
  }

  try {
    const imageUrl = await replaceImageBase64AtGcsUrl(body.imageBase64, existingUrl);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, imageUrl, imageProp, faceIndex: faceIndex ?? null }));
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'replace_failed';
    const status = reason === 'not_gcs_url' ? 400 : 500;
    if (status >= 500) {
      console.error('[replaceImage] failed', { cardId, imageProp, faceIndex, reason }, err);
    }
    res.statusCode = status;
    res.end(JSON.stringify({ ok: false, reason }));
  }
};
