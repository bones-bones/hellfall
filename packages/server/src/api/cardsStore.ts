import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import type { HCCard } from '@hellfall/shared/types';
import { env } from './lib/env.js';

const useLocalData = env.USE_LOCAL_CARD_DATA;

function resolveDataFile(name: string): string {
  if (process.env.DATA_DIR) return join(process.env.DATA_DIR, name);
  return join(process.cwd(), 'packages/shared/src/data', name);
}

let db: Firestore | null = null;
let collection: CollectionReference | null = null;
const cardsMap: Map<string, HCCard.Any> = new Map(
  (JSON.parse(readFileSync(resolveDataFile('Hellscube-Database.json'), 'utf-8')) as { data: HCCard.Any[] })
    .data.map(card => [card.id.toLowerCase(), card])
);

if (!useLocalData) {
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
export const getAllCards = (): HCCard.Any[] => Array.from(cardsMap.values());
