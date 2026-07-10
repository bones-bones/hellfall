import type { CollectionReference, DocumentSnapshot } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '../cardHandling';
import { textEquals } from '../textHandling';
import { firestoreToCard } from './cardConversion';
import type { firestoreCard } from './firestoreTypes';

export const getAllRelatedCollection = (
  card: HCCard.Any | firestoreCard,
  cardsCol: CollectionReference
) => (card.all_parts?.map(part => part.id) ?? []).map(id => cardsCol.doc(id));

type RelatedPartRef = {
  id: string;
  hcid?: string;
  name?: string;
  set?: string;
};

const hcidQueryValues = (hcid: string): (string | number)[] => {
  const values: (string | number)[] = [hcid];
  const asNumber = Number(hcid);
  if (!Number.isNaN(asNumber) && String(asNumber) === hcid.trim()) {
    values.push(asNumber);
  }
  return values;
};

const partMatchesCard = (part: RelatedPartRef, card: HCCard.Any): boolean => {
  if (part.id && card.id === part.id) {
    return true;
  }
  if (part.hcid && textEquals(String(part.hcid), String(card.hcid))) {
    return true;
  }
  if (part.name && textEquals(part.name, card.name)) {
    return true;
  }
  return false;
};

/** Firestore document id is authoritative — stored card.id field can drift from the doc key. */
export const firestoreDocToCard = (doc: DocumentSnapshot): HCCard.Any => {
  const card = firestoreToCard((doc.data() ?? {}) as firestoreCard);
  card.id = doc.id;
  return card;
};

const resolveRelatedDoc = async (
  part: RelatedPartRef,
  cardsCol: CollectionReference
): Promise<DocumentSnapshot | null> => {
  if (part.id) {
    const byId = await cardsCol.doc(part.id).get();
    if (byId.exists && partMatchesCard(part, firestoreDocToCard(byId))) {
      return byId;
    }
  }

  if (part.hcid) {
    for (const hcid of hcidQueryValues(part.hcid)) {
      const byHcid = await cardsCol.where('hcid', '==', hcid).limit(2).get();
      if (byHcid.size === 1) {
        return byHcid.docs[0];
      }
    }
  }

  if (part.name && part.set) {
    const byNameAndSet = await cardsCol
      .where('name', '==', part.name)
      .where('set', '==', part.set)
      .limit(2)
      .get();
    if (byNameAndSet.size === 1) {
      return byNameAndSet.docs[0];
    }
  }

  if (part.name) {
    const byName = await cardsCol.where('name', '==', part.name).limit(2).get();
    if (byName.size === 1) {
      return byName.docs[0];
    }
  }

  return null;
};

/** Resolves related cards by id, then hcid, then name — matching backend permissive lookup. */
export const fetchRelatedCardsFromCollection = async (
  card: HCCard.Any | firestoreCard,
  cardsCol: CollectionReference
): Promise<CardMap> => {
  const parts = card.all_parts ?? [];
  const cards: HCCard.Any[] = [];
  const seen = new Set<string>();

  await Promise.all(
    parts.map(async part => {
      const doc = await resolveRelatedDoc(part, cardsCol);
      if (!doc?.exists || seen.has(doc.id)) {
        return;
      }
      seen.add(doc.id);
      cards.push(firestoreDocToCard(doc));
    })
  );

  return new CardMap(cards);
};

/** Fetch any all_parts targets that are still missing from a related CardMap. */
export const ensureRelatedPartsResolved = async (
  card: HCCard.Any | firestoreCard,
  relatedMap: CardMap,
  cardsCol: CollectionReference
): Promise<void> => {
  for (const part of card.all_parts ?? []) {
    const alreadyResolved =
      relatedMap.get(part.id) ??
      relatedMap.find(related => textEquals(part.hcid, related.hcid)) ??
      relatedMap.find(related => textEquals(part.name, related.name));
    if (alreadyResolved) {
      continue;
    }

    const doc = await resolveRelatedDoc(part, cardsCol);
    if (doc?.exists) {
      relatedMap.set(firestoreDocToCard(doc));
    }
  }
};

export const getAllPrintsCollection = async (oracle_id: string, cardsCol: CollectionReference) => {
  const snapshot = await cardsCol.where('oracle_id', '==', oracle_id).get();
  return snapshot.docs;
};
