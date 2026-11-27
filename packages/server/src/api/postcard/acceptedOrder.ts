import { allSetsList, SetCode } from '@hellfall/shared/types';
import { getAcceptedOrderSet, toSetCode } from '@hellfall/shared/utils';
import { cardsCollection, firestoreCard } from '@hellfall/shared/utils/firestore';
import { cardMap } from '../cardMap.ts';
import { PostcardBody } from './types.ts';

/** Leading integer from an accepted_order / collector_number (handles variants like `38b`). */
export function acceptedOrderInt(value: unknown): number {
  if (value == null) return 0;
  const match = String(value)
    .trim()
    .match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Set codes that share one accepted-order sequence with `setId`
 * (e.g. `HLC_0` and `HCV_1_0`).
 */
export function setsSharingAcceptedOrder(setId: string): string[] {
  const code = toSetCode(setId);
  if (!code) {
    return setId.trim() ? [setId.trim()] : [];
  }
  const orderSet = getAcceptedOrderSet(code);
  return allSetsList.filter(c => getAcceptedOrderSet(c) === orderSet);
}

function catalogMaxAcceptedOrder(setId: string): number {
  const sets = setsSharingAcceptedOrder(setId).filter((c): c is SetCode =>
    allSetsList.includes(c as SetCode)
  );
  let max = 0;
  for (const card of cardMap.getAllInSetListExact(sets)) {
    max = Math.max(max, acceptedOrderInt(card.accepted_order));
  }
  return max;
}

async function firestoreMaxAcceptedOrder(
  cardsCol: cardsCollection,
  setId: string
): Promise<number> {
  const sets = setsSharingAcceptedOrder(setId);
  if (sets.length === 0) {
    return 0;
  }

  let max = 0;
  // Firestore `in` supports at most 30 values.
  for (let i = 0; i < sets.length; i += 30) {
    const chunk = sets.slice(i, i + 30);
    const snap = await cardsCol.where('set', 'in', chunk).get();
    for (const doc of snap.docs) {
      max = Math.max(max, acceptedOrderInt(doc.data().accepted_order));
    }
  }
  return max;
}

/**
 * Next unused accepted_order for the set's accepted-order bucket.
 * Check-then-write only — same collision caveat as HCID mint.
 */
export async function mintAcceptedOrder(cardsCol: cardsCollection, setId: string): Promise<string> {
  const max = Math.max(
    catalogMaxAcceptedOrder(setId),
    await firestoreMaxAcceptedOrder(cardsCol, setId)
  );
  return String(max + 1);
}

export type ResolvedAcceptedOrder = {
  accepted_order: string;
  collector_number: string;
};

/**
 * Resolve set order for postcard: body override, keep existing, or mint next.
 * Collector number mirrors sheet ingest (same as accepted_order for non-HCJ sets).
 */
export async function resolvePostcardAcceptedOrder(
  body: PostcardBody,
  setId: string,
  previous: firestoreCard | null,
  cardsCol: cardsCollection
): Promise<ResolvedAcceptedOrder> {
  const fromBody = body.accepted_order?.trim();
  if (fromBody) {
    return { accepted_order: fromBody, collector_number: fromBody };
  }

  const existing = previous?.accepted_order?.trim();
  if (existing) {
    const collector = previous?.collector_number?.trim() || existing;
    return { accepted_order: existing, collector_number: collector };
  }

  const accepted_order = await mintAcceptedOrder(cardsCol, setId);
  return { accepted_order, collector_number: accepted_order };
}
