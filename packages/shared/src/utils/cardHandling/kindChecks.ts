import { HCCard } from '@hellfall/shared/types';

export const hasTokenHCID = (card: HCCard.Any): boolean =>
  ['token', 'scryfall', 'notmagic'].includes(card.kind);

export const canBeInDecks = (card: HCCard.Any): boolean => ['card', 'land'].includes(card.kind);
