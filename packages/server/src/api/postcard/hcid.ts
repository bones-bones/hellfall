import { cardsData } from '@hellfall/shared/data';
import { isInteger, splitMasterpiecePostcard } from '@hellfall/shared/utils';
import { cardsCollection, firestoreCard } from '@hellfall/shared/utils/firestore';
import type { DocumentSnapshot } from '@google-cloud/firestore';
import { cardMap } from '../cardMap.ts';
import { PostcardBody, PostcardKind } from './types.ts';

const hcidQueryValues = (hcid: string): (string | number)[] => {
  const values: (string | number)[] = [hcid];
  const asNumber = Number(hcid);
  if (!Number.isNaN(asNumber) && String(asNumber) === hcid.trim()) {
    values.push(asNumber);
  }
  return values;
};

export async function findByHcid(
  cardsCol: cardsCollection,
  hcid: string
): Promise<DocumentSnapshot | null> {
  for (const value of hcidQueryValues(hcid)) {
    const matches = await cardsCol.where('hcid', '==', value).limit(2).get();
    if (matches.size > 1) {
      throw new Error(`multiple Firestore cards share hcid ${hcid}`);
    }
    if (matches.size === 1) {
      return matches.docs[0];
    }
  }
  return null;
}

export async function findByNameAndSet(
  cardsCol: cardsCollection,
  name: string,
  set: string
): Promise<DocumentSnapshot | null> {
  const matches = await cardsCol.where('name', '==', name).where('set', '==', set).limit(2).get();
  if (matches.size > 1) {
    throw new Error(`multiple Firestore cards share name ${name} in set ${set}`);
  }
  return matches.docs[0] ?? null;
}

function catalogMaxNumericHcid(): number {
  let max = 0;
  for (const card of cardsData.data) {
    if (card.kind === 'card' && isInteger(card.hcid)) {
      max = Math.max(max, parseInt(card.hcid, 10));
    }
  }
  return max;
}

async function hcidIsAvailable(cardsCol: cardsCollection, hcid: string): Promise<boolean> {
  return !cardMap.hasHCID(hcid) && !(await findByHcid(cardsCol, hcid));
}

async function mintNumericHcid(cardsCol: cardsCollection): Promise<string> {
  let candidate = catalogMaxNumericHcid() + 1;
  for (;;) {
    const hcid = String(candidate);
    if (await hcidIsAvailable(cardsCol, hcid)) {
      return hcid;
    }
    candidate++;
  }
}

const tokenHcidSuffix = (hcid: string, baseName: string): number | undefined => {
  if (!hcid.startsWith(baseName)) {
    return undefined;
  }
  const rest = hcid.slice(baseName.length);
  if (!rest) {
    return 0;
  }
  if (!/^\d+$/.test(rest)) {
    return undefined;
  }
  return parseInt(rest, 10);
};

async function maxTokenHcidSuffix(cardsCol: cardsCollection, baseName: string): Promise<number> {
  const matches = await cardsCol.where('name', '==', baseName).where('set', '==', 'HCT').get();
  let maxSuffix = 0;
  for (const doc of matches.docs) {
    const hcid = doc.data().hcid;
    if (typeof hcid !== 'string') {
      continue;
    }
    const suffix = tokenHcidSuffix(hcid, baseName);
    if (suffix !== undefined) {
      maxSuffix = Math.max(maxSuffix, suffix);
    }
  }
  return maxSuffix;
}

async function mintTokenHcid(cardsCol: cardsCollection, baseName: string): Promise<string> {
  let suffix = (await maxTokenHcidSuffix(cardsCol, baseName)) + 1;
  for (;;) {
    const hcid = `${baseName}${suffix}`;
    if (await hcidIsAvailable(cardsCol, hcid)) {
      return hcid;
    }
    suffix++;
  }
}

/** Resolve upsert key: use provided hcid, reuse an existing print, or mint a new one. */
export async function resolvePostcardHcid(
  body: PostcardBody,
  kind: PostcardKind,
  setId: string,
  cardsCol: cardsCollection
): Promise<{ hcid: string; existing: DocumentSnapshot | null }> {
  const trimmed = body.hcid?.trim();
  if (trimmed) {
    return { hcid: trimmed, existing: await findByHcid(cardsCol, trimmed) };
  }

  const { name } = splitMasterpiecePostcard(body.name ?? '');
  const existing = await findByNameAndSet(cardsCol, name, setId);
  if (existing) {
    const previous = existing.data() as firestoreCard;
    const hcid = String(previous.hcid ?? '').trim();
    if (!hcid) {
      throw new Error('invalid_body');
    }
    return { hcid, existing };
  }

  const hcid =
    kind === 'token' ? await mintTokenHcid(cardsCol, name) : await mintNumericHcid(cardsCol);
  return { hcid, existing: null };
}
