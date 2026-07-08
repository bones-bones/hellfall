import type { CollectionReference } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import type { firestoreCard } from './firestoreTypes';

/**
 * Gets all related cards to a given card
 * @param card card to get the related cards to
 * @param cardsCol collection containing all cards
 */
export const getAllRelatedCollection = (
  card: HCCard.Any | firestoreCard,
  cardsCol: CollectionReference
) => (card.all_parts?.map(part => part.id) ?? []).map(id => cardsCol.doc(id));

/**
 * Gets all prints of a given oracle id
 * @param oracle_id the oracle id to use
 * @param cardsCol collection containing all cards
 */
export const getAllPrintsCollection = async (oracle_id: string, cardsCol: CollectionReference) => {
  const snapshot = await cardsCol.where('oracle_id', '==', oracle_id).get();
  return snapshot.docs;
};
