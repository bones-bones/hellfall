import {
  faceElementValueType,
  facePropType,
  faceValueType,
  HCCard,
  rootElementValueType,
  rootPropType,
  rootValueType,
} from '@hellfall/shared/types';
import {
  listIncludesValueLower,
  popProp,
  pushProp,
  fillFacesTo,
  // layoutIsDefault,
} from '@hellfall/shared/utils';

/**
 * Add a prop and value to a card root (or overwrite the existing one)
 * @param card card to add the prop to
 * @param prop prop to add
 * @param value value to add
 */
export const addPropToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootValueType<K>
) => {
  (card as any)[prop] = value;
};

/**
 * Add a prop and value to a list in the card root
 * @param card card to add the prop to
 * @param prop prop to add
 * @param value value to add
 */
export const pushPropToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootElementValueType<K>
) => pushProp(card, prop, value);

/**
 * Delete a prop from the card root
 * @param card card to delete the prop from
 * @param prop prop to delete
 */
export const deletePropFromRoot = <K extends rootPropType>(card: HCCard.Any, prop: K) => {
  if (card[prop] == undefined) {
    return false;
  }
  delete (card as any)[prop];
  return true;
};

/**
 * Delete a prop and value from a list in the card root
 * @param card card to delete the prop from
 * @param prop prop to delete from
 * @param value value to delete
 */
export const popPropFromRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootElementValueType<K>
) => popProp(card, prop, value);

/**
 * Add a prop and value to a card face (or overwrite the existing one)
 * @param card card to add the prop to
 * @param prop prop to add
 * @param value value to add
 * @param index index of the face to add the prop to (defaults to `0`)
 */
export const addPropToFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  value: faceValueType<K>,
  index?: number
) => {
  if ('card_faces' in card) {
    fillFacesTo(card, index ?? 0);
  }
  ('card_faces' in card ? card.card_faces[index ?? 0] : (card as any))[prop] = value;
};

/**
 * Add a prop and value to a list in a card face
 * @param card card to add the prop to
 * @param prop prop to add
 * @param value value to add
 * @param index index of the face to add the prop to (defaults to `0`)
 */
export const pushPropToFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  value: faceElementValueType<K>,
  index?: number
) => {
  if ('card_faces' in card) {
    fillFacesTo(card, index ?? 0);
  }
  pushProp('card_faces' in card ? card.card_faces[index ?? 0] : card, prop, value);
};

/**
 * Delete a prop from a card face
 * @param card card to delete the prop from
 * @param prop prop to delete
 * @param index index of the face to delete the prop from (defaults to `0`)
 */
export const deletePropFromFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  index?: number
) => {
  if (('card_faces' in card ? card.card_faces[index ?? 0] : card)[prop] == undefined) {
    return false;
  }
  delete ('card_faces' in card ? card.card_faces[index ?? 0] : card)[prop];
  return true;
};

/**
 * Delete a prop and value from a list in a card face
 * @param card card to delete the prop from
 * @param prop prop to delete from
 * @param value value to delete
 * @param index index of the face to delete the prop from (defaults to `0`)
 */
export const popPropFromFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  value: faceElementValueType<K>,
  index?: number
) => popProp('card_faces' in card ? card.card_faces[index ?? 0] : card, prop, value);

export const faceIsBattle = (card: HCCard.AnyMultiFaced, index: number) =>
  listIncludesValueLower(card.card_faces[index]?.types, 'battle');

export const rootIsBattle = (card: HCCard.AnySingleFaced) =>
  listIncludesValueLower(card.types, 'battle');

export const frontIsBattle = (card: HCCard.Any, index: number) =>
  'card_faces' in card ? faceIsBattle(card, index) : rootIsBattle(card);

/**
 * Adds an artist note
 * @param card card object
 * @param artist artist to add note to
 * @param note note to add
 */
const addArtistNote = (card: HCCard.Any, artist: string, note: string) => {
  if (card.artist_notes?.[artist]) {
    card.artist_notes[artist] += '; ' + note;
  } else {
    if (!card.artist_notes) {
      card.artist_notes = {} as Record<string, string>;
    }
    card.artist_notes[artist] = note;
  }
};

/**
 * Adds an artist
 * @param card card to add the artist to
 * @param artist artist to add
 * @param note artist note
 */
export const addArtist = (card: HCCard.Any, artist: string, note?: string) => {
  if (note) {
    addArtistNote(card, artist, note);
  }
};
