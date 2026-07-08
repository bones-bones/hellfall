import { HCCard } from '@hellfall/shared/types';
import { getCardEntries } from '../cardHandling';
import { firestoreCard } from './firestoreTypes';

/**
 * Converts an {@linkcode HCCard.Any} to a {@linkcode firestoreCard}
 * by stringifying `color_identity_hybrid` and omitting `toJSON`
 * @param card card to convert
 */
export const cardToFirestore = (card: HCCard.Any): firestoreCard => {
  const fire: firestoreCard = {};
  getCardEntries(card).forEach(([prop, value]) => {
    if (prop == 'toJSON' || value == undefined) return;
    if (prop == 'color_identity_hybrid') {
      fire[prop] = JSON.stringify(value);
      return;
    }
    (fire as any)[prop] = value;
  });
  return fire;
};

/**
 * Converts a {@linkcode firestoreCard} to an {@linkcode HCCard.Any}
 * by parsing `color_identity_hybrid`
 * @param fire firestore card to convert
 */
export const firestoreToCard = (fire: firestoreCard): HCCard.Any => {
  const card = { ...fire } as unknown as HCCard.Any;
  card.color_identity_hybrid = JSON.parse(fire.color_identity_hybrid ?? '');
  return card;
};
