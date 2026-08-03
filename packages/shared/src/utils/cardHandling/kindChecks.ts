import { HCCard } from '@hellfall/shared/types';


/**
 * Checks whether a card can be in decks
 * @param card card to check
 */
export const canBeInDecks = (card: HCCard.Any) =>
  ['card'].includes(card.kind) || card.tags?.includes('draftpartner');
