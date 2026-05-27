import { HCCard } from '@hellfall/shared/types';

export type cardMap = Map<string, HCCard.Any>;
export const toCardMap = (cardList: HCCard.Any[]): cardMap =>
  new Map(cardList.map(card => [card.id, card]));
