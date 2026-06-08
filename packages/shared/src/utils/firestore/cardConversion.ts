import { HCCard } from '@hellfall/shared/types';
import { anyMappedType, anyPropType, getCardEntries } from '../cardHandling';
import { firestoreCard } from './firestoreTypes';
import { restoreMissingFields } from '../cardModification';

/** Firestore: stringify nested arrays; omit attributes whose value is `""`. */
export const cardToFirestore = (card: HCCard.Any): firestoreCard => {
  const fire: firestoreCard = {};
  getCardEntries(card).forEach(([prop, value]) => {
    if (value == '' || prop == 'toJSON' || value == undefined) return;
    if (prop == 'color_identity_hybrid') {
      fire[prop] = JSON.stringify(value);
      return;
    }
    (fire as any)[prop] = value;
  });
  return fire;
};

export const firestoreToCard = (fire: firestoreCard, noRestore?: boolean): HCCard.Any => {
  const card = { ...fire } as unknown as HCCard.Any;
  card.color_identity_hybrid = JSON.parse(fire.color_identity_hybrid!);
  if (noRestore) {
    return card;
  }
  restoreMissingFields(card);
  return card;
};
