import { Firestore } from '@google-cloud/firestore';
import { HCCard, HCKind, HCImageStatus, SetCode } from '@hellfall/shared/types';
import {
  getDefaultCard,
  isValidV4UUID,
  semiSplit,
  setDerivedProps,
  splitMasterpiece,
} from '@hellfall/shared/utils';
import { cardToFirestore, cardsCollection, firestoreCard } from '@hellfall/shared/utils/firestore';
import { withCors, env, requirePostcardAuth, HandlerRequest, HandlerResponse } from './lib';
import { scheduleCatalogPublish } from '../lib/publishCatalog.ts';
import { uploadImageBase64ToGcs } from '../lib/imageGcs.ts';
import { cardMap } from './cardMap.ts';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

type PostcardKind = 'card' | 'token';

type PostcardBody = {
  name?: string;
  image?: string;
  imageBase64?: string;
  creators?: string;
  set?: string;
  hcid?: string;
  /** Hellfall print UUID (sheet BB). Used for GCS image keys; never use hcid for that. */
  id?: string;
  kind?: PostcardKind;
};

type RollbackBody = {
  docId?: string;
  wasCreate?: boolean;
  previous?: firestoreCard | null;
};

function postcardBodyContext(
  body: PostcardBody | RollbackBody | undefined,
  action: string | null
): Record<string, unknown> {
  if (!body) return { action: action ?? 'upsert' };
  if (action === 'rollback') {
    const rollback = body as RollbackBody;
    return {
      action: 'rollback',
      docId: rollback.docId,
      wasCreate: rollback.wasCreate,
      hasPrevious: Boolean(rollback.previous),
    };
  }
  const postcard = body as PostcardBody;
  return {
    action: action ?? 'upsert',
    kind: postcard.kind ?? 'card',
    name: postcard.name,
    hcid: postcard.hcid,
    set: postcard.set,
    hasImageUrl: Boolean(postcard.image?.trim()),
    hasImageBase64: Boolean(postcard.imageBase64?.trim()),
  };
}

function clientErrorReason(err: unknown): string {
  return err instanceof Error ? err.message : 'postcard_failed';
}

function isClientError(err: unknown): boolean {
  if (err instanceof SyntaxError) return true;
  const reason = clientErrorReason(err);
  return reason === 'invalid_body' || reason === 'image_gcs_not_configured';
}

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[postcard] json parse failed', { bytes: raw.length }, err);
    throw err;
  }
}

const newCardId = () => crypto.randomUUID();
const newUnlessValid = (id?: string) => (id && isValidV4UUID(id) ? id : newCardId());

/** Resolve print UUID for GCS image keys — never use hcid as the object key. */
function resolvePostcardCardId(
  body: PostcardBody,
  existing: { id: string; data: () => firestoreCard | undefined } | null,
  previous: firestoreCard | null
): string {
  if (previous?.id) {
    return newUnlessValid(previous.id);
  }
  if (body.hcid) {
    return newUnlessValid(cardMap.getFromHCID(body.hcid)?.id);
  }
  return newCardId();
}

function buildStubCard(
  body: Required<Pick<PostcardBody, 'name' | 'image' | 'creators'>> & PostcardBody
): HCCard.Any {
  const kind = body.kind === 'token' ? HCKind.Token : HCKind.Card;
  const set = (kind === HCKind.Token ? 'HCT' : body.set) as SetCode;
  const hcid = body.hcid?.trim() || body.name;

  const { name } = splitMasterpiece(body.name);

  const card = getDefaultCard(
    kind,
    false,
    {
      hcid,
      name,
      set,
      image: body.image,
      image_status: HCImageStatus.HighRes,
      creators: semiSplit(body.creators),
    },
    kind === HCKind.Token ? {} : { oracle_text: '' }
  );

  card.id = newCardId();
  card.oracle_id = newCardId();
  setDerivedProps(card, ['not-transcribed']);
  if (!isValidV4UUID(card.id)) {
    throw new Error('failed_to_generate_card_id');
  }
  return card;
}

async function findByHcid(hcid: string) {
  const matches = await cardsCol.where('hcid', '==', hcid).limit(2).get();
  if (matches.size > 1) {
    throw new Error(`multiple Firestore cards share hcid ${hcid}`);
  }
  return matches.docs[0] ?? null;
}

/** Reuse previous / catalog / Firestore oracle_id; mint only when truly new. */
function resolvePostcardOracleId(body: PostcardBody, previous: firestoreCard | null): string {
  if (previous?.oracle_id) {
    return newUnlessValid(previous.oracle_id);
  }
  const { name, code } = splitMasterpiece(body.name ?? '');
  if (!body.set?.startsWith('SCL') && !code) {
    return newCardId();
  }
  return newUnlessValid(cardMap.getOracleIDFromName(name));
}

function validatePostcardBody(
  body: PostcardBody
): body is Required<Pick<PostcardBody, 'name' | 'creators' | 'hcid'>> &
  PostcardBody & { set: string } & ({ image: string } | { imageBase64: string }) {
  const hasImageUrl = typeof body.image === 'string' && body.image.trim();
  const hasImageBase64 = typeof body.imageBase64 === 'string' && body.imageBase64.trim();
  return Boolean(
    typeof body.name === 'string' &&
      body.name.trim() &&
      typeof body.hcid === 'string' &&
      body.hcid.trim() &&
      (hasImageUrl || hasImageBase64) &&
      typeof body.creators === 'string' &&
      (body.kind === 'token' || (typeof body.set === 'string' && body.set.trim()))
  );
}

async function resolveImageUrl(body: PostcardBody, cardId: string): Promise<string> {
  if (typeof body.imageBase64 === 'string' && body.imageBase64.trim()) {
    const name = body.name?.trim() || 'image';
    try {
      return await uploadImageBase64ToGcs(body.imageBase64, cardId, name);
    } catch (err) {
      console.error(
        '[postcard] gcs image upload failed',
        {
          cardId,
          name,
          bucket: env.IMAGE_GCS_CARD_IMAGE_BUCKET,
        },
        err
      );
      throw err;
    }
  }
  if (typeof body.image === 'string' && body.image.trim()) {
    return body.image.trim();
  }
  throw new Error('invalid_body');
}

async function upsertPostcard(body: PostcardBody) {
  if (!validatePostcardBody(body)) {
    throw new Error('invalid_body');
  }

  const kind: PostcardKind = body.kind === 'token' ? 'token' : 'card';
  const setId = kind === 'token' ? 'HCT' : body.set;
  const existing = await findByHcid(body.hcid.trim());
  const previous: firestoreCard | null = existing?.data() ?? null;
  const cardId = resolvePostcardCardId(body, existing, previous);
  const oracle_id = resolvePostcardOracleId(body, previous);

  const imageUrl = await resolveImageUrl(body, cardId);
  const bodyWithImage = { ...body, image: imageUrl };

  if (existing?.exists && previous) {
    const update: firestoreCard = {
      name: splitMasterpiece(body.name).name,
      image: imageUrl,
      image_status: HCImageStatus.HighRes,
      creators: semiSplit(body.creators),
      set: setId as SetCode,
    };
    if (body.hcid?.trim()) update.hcid = body.hcid.trim();
    if (cardId !== previous.id) update.id = cardId;
    if (oracle_id !== previous.oracle_id) update.oracle_id = oracle_id;
    await existing.ref.update(update);
    scheduleCatalogPublish();
    return {
      docId: existing.id,
      id: cardId,
      oracle_id,
      wasCreate: false,
      previous,
      imageUrl,
    };
  }

  const stub = buildStubCard({ ...bodyWithImage, kind, set: setId });
  stub.id = cardId;
  stub.oracle_id = oracle_id;
  const fireDoc = cardToFirestore(stub);
  if (!isValidV4UUID(fireDoc.id ?? '')) {
    throw new Error('failed_to_generate_card_id');
  }
  await cardsCol.doc(stub.id).set(fireDoc);
  scheduleCatalogPublish();
  return {
    docId: stub.id,
    id: stub.id,
    oracle_id,
    wasCreate: true,
    previous: null,
    imageUrl,
  };
}

async function rollbackPostcard(body: RollbackBody) {
  if (typeof body.docId !== 'string' || !body.docId.trim()) {
    throw new Error('invalid_body');
  }
  const docRef = cardsCol.doc(body.docId);
  if (body.wasCreate) {
    await docRef.delete();
    scheduleCatalogPublish();
    return;
  }
  if (body.previous && typeof body.previous === 'object') {
    await docRef.set(body.previous);
    scheduleCatalogPublish();
  }
}

const jsonHeaders = (req: HandlerRequest): Record<string, string> => {
  return withCors({ 'Content-Type': 'application/json' }, req);
};

/** POST /api/cards/postcard — mork upserts a sparse accepted card. */
export const postcardHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  actionParam: string | null
): Promise<void | undefined> => {
  const headers = jsonHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  if (!requirePostcardAuth(req, res)) return;

  const action = actionParam ?? null;
  let body: PostcardBody | RollbackBody | undefined;

  try {
    body = (await readJsonBody(req)) as PostcardBody | RollbackBody;

    if (action === 'rollback') {
      await rollbackPostcard(body as RollbackBody);
      console.log('[postcard] rollback ok', postcardBodyContext(body, action));
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (action) {
      console.warn('[postcard] unknown action', { action });
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
      return;
    }

    const result = await upsertPostcard(body as PostcardBody);
    console.log('[postcard] upsert ok', {
      ...postcardBodyContext(body, action),
      docId: result.docId,
      id: result.id,
      oracle_id: result.oracle_id,
      wasCreate: result.wasCreate,
      imageUrl: result.imageUrl,
    });
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ...result }));
  } catch (err) {
    const reason = clientErrorReason(err);
    const status = isClientError(err) ? 400 : 500;
    const log = status >= 500 ? console.error : console.warn;
    log.call(
      console,
      '[postcard] failed',
      {
        ...postcardBodyContext(body, action),
        status,
        reason,
      },
      err
    );
    res.statusCode = status;
    res.end(JSON.stringify({ ok: false, reason }));
  }
};
