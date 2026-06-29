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
  listShareLower,
  popProp,
  pushProp,
  fillFacesTo,
  // layoutIsDefault,
} from '@hellfall/shared/utils';

export const addPropToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootValueType<K>
) => {
  (card as any)[prop] = value;
};
export const pushPropToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootElementValueType<K>
) => pushProp(card, prop, value);
export const deletePropFromRoot = <K extends rootPropType>(card: HCCard.Any, prop: K) => {
  if (card[prop] == undefined) {
    return false;
  }
  delete (card as any)[prop];
  return true;
};
export const popPropFromRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootElementValueType<K>
) => popProp(card, prop, value);

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
export const popPropFromFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  value: faceElementValueType<K>,
  index?: number
) => popProp('card_faces' in card ? card.card_faces[index ?? 0] : card, prop, value);

export const faceIsBattle = (card: HCCard.AnyMultiFaced, index: number) =>
  listShareLower(card.card_faces[index]?.types, 'battle');

export const rootIsBattle = (card: HCCard.AnySingleFaced) => listShareLower(card.types, 'battle');

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
 * Adds a tag
 * @param card card
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 */
export const addArtist = (card: HCCard.Any, artist: string, note?: string) => {
  if (note) {
    addArtistNote(card, artist, note);
  }
};
