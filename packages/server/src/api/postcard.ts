import { Firestore } from '@google-cloud/firestore';
import { HCCard, HCKind, HCImageStatus, SetCode } from '@hellfall/shared/types';
import { getDefaultCard, isValidV4UUID, setDerivedProps } from '@hellfall/shared/utils';
import {
  cardToFirestore,
  cardsCollection,
  firestoreCard,
} from '@hellfall/shared/utils/firestore';
import { withCors } from './lib/cors.ts';
import { env } from './lib/env.ts';
import { requirePostcardAuth } from './lib/requirePostcardAuth.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { scheduleCatalogPublish } from '../lib/publishCatalog.ts';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

type PostcardKind = 'card' | 'token';

type PostcardBody = {
  name?: string;
  image?: string;
  creators?: string;
  set?: string;
  hcid?: string;
  kind?: PostcardKind;
};

type RollbackBody = {
  docId?: string;
  wasCreate?: boolean;
  previous?: firestoreCard | null;
};

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

function parseCreators(creators: string): string[] {
  if (!creators.trim()) return [];
  if (creators.includes(';')) {
    return creators
      .split(';')
      .map(part => part.trim())
      .filter(Boolean);
  }
  return [creators.trim()];
}

function newCardId(): string {
  return crypto.randomUUID();
}

function resolveCardId(docId: string, data: firestoreCard): string {
  const fromDoc = typeof data.id === 'string' ? data.id.trim() : '';
  if (fromDoc && isValidV4UUID(fromDoc)) return fromDoc;
  if (isValidV4UUID(docId)) return docId;
  return newCardId();
}

function buildStubCard(body: Required<Pick<PostcardBody, 'name' | 'image' | 'creators'>> & PostcardBody): HCCard.Any {
  const kind = body.kind === 'token' ? HCKind.Token : HCKind.Card;
  const setId = (kind === HCKind.Token ? 'HCT' : body.set) as SetCode;
  const hcid = body.hcid?.trim() || body.name;

  const card = getDefaultCard(
    kind,
    false,
    {
      hcid,
      name: body.name,
      set: setId,
      image: body.image,
      image_status: HCImageStatus.HighRes,
      creators: parseCreators(body.creators),
    },
    kind === HCKind.Token ? {} : { oracle_text: '' }
  );

  card.id = newCardId();
  card.oracle_id = newCardId();
  setDerivedProps(card);
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

async function findByNameAndSet(name: string, setId: string) {
  const matches = await cardsCol
    .where('name', '==', name)
    .where('set', '==', setId)
    .limit(2)
    .get();
  if (matches.size > 1) {
    throw new Error(`multiple Firestore cards share name=${name} set=${setId}`);
  }
  return matches.docs[0] ?? null;
}

async function lookupDoc(hcid: string | undefined, name: string, setId: string) {
  if (hcid) {
    const byHcid = await findByHcid(hcid);
    if (byHcid) return byHcid;
  }
  return findByNameAndSet(name, setId);
}

function validatePostcardBody(body: PostcardBody): body is Required<
  Pick<PostcardBody, 'name' | 'image' | 'creators'>
> &
  PostcardBody & { set: string } {
  return Boolean(
    typeof body.name === 'string' &&
      body.name.trim() &&
      typeof body.image === 'string' &&
      body.image.trim() &&
      typeof body.creators === 'string' &&
      (body.kind === 'token' || (typeof body.set === 'string' && body.set.trim()))
  );
}

async function upsertPostcard(body: PostcardBody) {
  if (!validatePostcardBody(body)) {
    throw new Error('invalid_body');
  }

  const kind: PostcardKind = body.kind === 'token' ? 'token' : 'card';
  const setId = kind === 'token' ? 'HCT' : body.set;
  const existing = await lookupDoc(body.hcid?.trim() || undefined, body.name, setId);
  const stub = buildStubCard({ ...body, kind, set: setId });

  if (existing?.exists) {
    const previous = existing.data() ?? {};
    const cardId = resolveCardId(existing.id, previous);
    const update: firestoreCard = {
      name: body.name,
      image: body.image,
      image_status: HCImageStatus.HighRes,
      creators: parseCreators(body.creators),
      set: setId as SetCode,
    };
    if (body.hcid?.trim()) update.hcid = body.hcid.trim();
    if (cardId !== previous.id) update.id = cardId;
    await existing.ref.update(update);
    scheduleCatalogPublish();
    return { docId: existing.id, cardId, wasCreate: false, previous };
  }

  const fireDoc = cardToFirestore(stub);
  if (!fireDoc.id || !isValidV4UUID(String(fireDoc.id))) {
    throw new Error('failed_to_generate_card_id');
  }
  await cardsCol.doc(stub.id).set(fireDoc);
  scheduleCatalogPublish();
  return { docId: stub.id, cardId: stub.id, wasCreate: true, previous: null };
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

function jsonHeaders(req: HandlerRequest): Record<string, string> {
  return withCors({ 'Content-Type': 'application/json' }, req);
}

/** POST /api/cards/postcard — mork upserts a sparse accepted card. */
export async function postcardHandler(
  req: HandlerRequest,
  res: HandlerResponse,
  action: string | null
): Promise<void> {
  const headers = jsonHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  if (!requirePostcardAuth(req, res)) return;

  try {
    const body = (await readJsonBody(req)) as PostcardBody | RollbackBody;

    if (action === 'rollback') {
      await rollbackPostcard(body as RollbackBody);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (action) {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
      return;
    }

    const result = await upsertPostcard(body as PostcardBody);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ...result }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'postcard_failed';
    const status = message === 'invalid_body' ? 400 : 500;
    res.statusCode = status;
    res.end(JSON.stringify({ ok: false, reason: message }));
  }
}
