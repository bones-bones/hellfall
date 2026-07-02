import { HCCard } from '@hellfall/shared/types';

/**
 * Checks whether a card has an HCID that takes the form of a token HCID
 * @param card card to check
 */
export const hasTokenHCID = (card: HCCard.Any): boolean =>
  ['token', 'scryfall', 'notmagic'].includes(card.kind);

/**
 * Checks whether a card can be in decks
 * @param card card to check
 */
export const canBeInDecks = (card: HCCard.Any): boolean => ['card', 'land'].includes(card.kind);
