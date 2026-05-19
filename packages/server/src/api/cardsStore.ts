import { CollectionReference, Firestore } from '@google-cloud/firestore';
import type { HCCard } from '@hellfall/shared/types';
import { env } from './lib/env.js';
import cardsData from '@hellfall/shared/data/Hellscube-Database.json';
const useLocalData = env.USE_LOCAL_CARD_DATA;

let db: Firestore | null = null;
let collection: CollectionReference | null = null;
let cardsMap: Map<string, HCCard.Any> | null = null;

if (useLocalData) {
  cardsMap = new Map(
    (cardsData as { data: HCCard.Any[] }).data.map(card => [card.id.toLowerCase(), card])
  );
} else {
  db = new Firestore({ databaseId: env.FIRESTORE_HELLSCUBE_DATABASE_ID });
  collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);
}

export const getCardById = async (id: string): Promise<HCCard.Any | undefined> => {
  if (useLocalData) {
    return cardsMap?.get(id.toLowerCase());
  } else {
    return (await collection?.doc(id).get())?.data() as HCCard.Any;
  }
};
