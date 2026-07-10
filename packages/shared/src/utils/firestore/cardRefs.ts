import type { CollectionReference, DocumentSnapshot } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '../cardHandling';
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

const resolveRelatedDoc = async (
  part: RelatedPartRef,
  cardsCol: CollectionReference
): Promise<DocumentSnapshot | null> => {
  const byId = await cardsCol.doc(part.id).get();
  if (byId.exists) {
    return byId;
  }

  if (part.hcid) {
    const byHcid = await cardsCol.where('hcid', '==', part.hcid).limit(2).get();
    if (byHcid.size === 1) {
      return byHcid.docs[0];
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
      cards.push(firestoreToCard(doc.data() ?? {}));
    })
  );

  return new CardMap(cards);
};

export const getAllPrintsCollection = async (oracle_id: string, cardsCol: CollectionReference) => {
  const snapshot = await cardsCol.where('oracle_id', '==', oracle_id).get();
  return snapshot.docs;
};
