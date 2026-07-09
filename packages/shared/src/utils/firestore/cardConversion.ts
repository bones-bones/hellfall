import { HCCard } from '@hellfall/shared/types';
import { getCardEntries } from '../cardHandling';
import { firestoreCard } from './firestoreTypes';

/** Firestore rejects map fields whose keys are empty strings. */
const sanitizeForFirestore = (prop: string, value: unknown): unknown => {
  if (prop === 'artists' && Array.isArray(value)) {
    return value.filter(artist => artist !== '');
  }
  if (prop === 'artist_notes' && value && typeof value === 'object' && !Array.isArray(value)) {
    const notes = Object.fromEntries(
      Object.entries(value as Record<string, string>).filter(([artist]) => artist !== '')
    );
    return Object.keys(notes).length ? notes : undefined;
  }
  return value;
};

/** Firestore: stringify nested arrays*/
export const cardToFirestore = (card: HCCard.Any): firestoreCard => {
  const fire: firestoreCard = {};
  getCardEntries(card).forEach(([prop, value]) => {
    if (prop == 'toJSON' || value == undefined) return;
    if (prop == 'color_identity_hybrid') {
      fire[prop] = JSON.stringify(value);
      return;
    }
    const sanitized = sanitizeForFirestore(prop, value);
    if (sanitized == undefined) return;
    (fire as any)[prop] = sanitized;
  });
  return fire;
};

export const firestoreToCard = (fire: firestoreCard /* , noRestore?: boolean */): HCCard.Any => {
  const card = { ...fire } as unknown as HCCard.Any;
  card.color_identity_hybrid = JSON.parse(fire.color_identity_hybrid ?? '');
  return card;
};
