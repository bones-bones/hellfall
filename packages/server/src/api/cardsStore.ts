import type { HCCard } from '@hellfall/shared/types';
import { readDataJson } from '../lib/loadDataFiles.ts';

const cardsMap: Map<string, HCCard.Any> = new Map(
  readDataJson<{ data: HCCard.Any[] }>('Hellscube-Database.json').data.map(card => [
    card.id.toLowerCase(),
    card,
  ])
);

export const getCardById = async (id: string): Promise<HCCard.Any | undefined> => {
  return cardsMap.get(id.toLowerCase());
};

export const getAllCards = (): HCCard.Any[] => Array.from(cardsMap.values());
