import { CollectionReference, Firestore } from '@google-cloud/firestore';
import type { HCCard } from '@hellfall/shared/types';
import { env } from './lib/env.ts';
import cardsData from '@hellfall/shared/data/Hellscube-Database.json';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

const cardsMap: Map<string, HCCard.Any> = new Map(
  (cardsData as { data: HCCard.Any[] }).data.map(card => [card.id.toLowerCase(), card])
);

export const getCardById = async (id: string): Promise<HCCard.Any | undefined> => {
  return cardsMap?.get(id.toLowerCase());
};
export const getAllCards = (): HCCard.Any[] => Array.from(cardsMap.values());
