import type { CollectionReference } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import type { firestoreCard } from './firestoreTypes';

export const getAllRelatedCollection = (
  card: HCCard.Any | firestoreCard,
  cardsCol: CollectionReference
) => (card.all_parts?.map(part => part.id) ?? []).map(id => cardsCol.doc(id));
