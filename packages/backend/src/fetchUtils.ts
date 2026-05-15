import {
  HCCard,
  HCCardFace,
  HCFrameEffect,
  HCLayout,
  HCLayoutGroup,
  HCRelatedCard,
} from '@hellfall/shared/types';
import { error } from 'console';
import { setDerivedProps } from './derivedProps';
import {
  arrayElementType,
  cardFaceType,
  cardObjectType,
  faceArrayElementType,
  facePropType,
  faceValueType,
  listShareLower,
  partPropType,
  propType,
  pushProp,
  valueType,
} from '@hellfall/shared/utils';

// export type propType = keyof HCCard.Any;
// export type valueType<K extends propType> = HCCard.Any[K];
// export type arrayElementType<K extends propType> = Exclude<
//   HCCard.Any[K],
//   undefined
// > extends Array<infer U>
//   ? U
//   : never;

// export type facePropType = keyof HCCardFace.MultiFaced;
// export type faceValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
// export type faceArrayElementType<K extends keyof HCCardFace.MultiFaced> = Exclude<
//   HCCardFace.MultiFaced[K],
//   undefined
// > extends Array<infer U>
//   ? U
//   : never;
// // export type cardObjectType = Record<propType, valueType<propType>> & { card_faces: Record<facePropType, faceValueType<facePropType>>[], all_parts?: Record<partPropType, partValueType<partPropType>>[]}
// export type cardFaceType = { [F in facePropType]: HCCardFace.MultiFaced[F] };
// export type cardObjectType = {
//   [K in propType]?: HCCard.Any[K]; // This preserves individual types
// } & {
//   card_faces: cardFaceType[];
// };

export const fillFacesTo = (card: cardObjectType | HCCard.AnyMultiFaced, index: number) => {
  while (card.card_faces.length <= index) {
    card.card_faces.push({} as cardFaceType);
  }
};
export const addProp = <K extends propType>(
  card: cardObjectType | HCCard.Any,
  prop: K,
  value: valueType<K>
) => {
  (card as any)[prop] = value;
};
export const deleteProp = <K extends propType>(card: cardObjectType | HCCard.Any, prop: K) => {
  delete (card as any)[prop];
};
export const pushPropToCard = <K extends propType>(
  card: cardObjectType | HCCard.Any,
  prop: K,
  value: arrayElementType<K>
) => pushProp(card as cardObjectType, prop, value);
export const addPropToFace = <K extends facePropType>(
  card: cardObjectType | HCCard.AnyMultiFaced,
  prop: K,
  value: faceValueType<K>,
  index?: number
) => {
  fillFacesTo(card, index ?? 0);
  (card as any).card_faces[index ?? 0][prop] = value;
};
export const deletePropFromFace = <K extends facePropType>(
  card: cardObjectType | HCCard.AnyMultiFaced,
  prop: K,
  index?: number
) => {
  delete card.card_faces[index ?? 0][prop];
};
export const pushPropToFace = <K extends facePropType>(
  card: cardObjectType | HCCard.AnyMultiFaced,
  prop: K,
  value: faceArrayElementType<K>,
  index?: number
) => {
  fillFacesTo(card, index ?? 0);
  pushProp(card.card_faces[index ?? 0], prop, value);
};
export const faceIsBattle = (card: cardObjectType, index: number) =>
  listShareLower(card.card_faces[index]?.types, 'battle');

export const frontIsBattle = (card: cardObjectType) =>
  listShareLower(card.card_faces[0]?.types, 'battle');

/**
 * Adds a tag to a specific face
 * @param card card object
 * @param index face number (defaults to 0 if the face number is invalid)
 * @param prop prop to set/push the value to
 * @param value value to set/push
 * @param push whether to push the value (use true when the prop is an array)
 */
export const addTagToFace = <K extends facePropType>(
  card: cardObjectType,
  index: number,
  prop: K,
  value: faceValueType<K> | faceArrayElementType<K>,
  push?: boolean
) => {
  // const faceIndex = index > 0 && index < card.card_faces.length ? index : 0;
  if (push) {
    pushPropToFace(card, prop, value as faceArrayElementType<K>, index);
  } else {
    addPropToFace(card, prop, value as faceValueType<K>, index);
  }
};
/**
 * Adds a tag to the card root
 * @param card card object
 * @param prop prop to set/push the value to
 * @param value value to set/push
 * @param push whether to push the value (use true when the prop is an array)
 */
export const addTagToRoot = <K extends propType>(
  card: cardObjectType,
  prop: K,
  value: valueType<K> | arrayElementType<K>,
  push?: boolean
) => {
  if (push) {
    pushPropToCard(card, prop, value as arrayElementType<K>);
  } else {
    addProp(card, prop, value as valueType<K>);
  }
};
/**
 * Adds a tag note
 * @param card card object
 * @param tag tag to add note to
 * @param note note to add
 * @param replaceNote whether to replace the note; if not true, will concat with '; '
 */
const addTagNote = (card: cardObjectType, tag: string, note: string, replaceNote?: boolean) => {
  if (!replaceNote && card.tag_notes?.[tag]) {
    card.tag_notes[tag] += '; ' + note;
  } else {
    if (!card.tag_notes) {
      card.tag_notes = {} as Record<string, string>;
    }
    card.tag_notes[tag] = note;
  }
};

// Gets the base type (if array, get element; otherwise keep as is)
type BaseType<T> = T extends Array<infer U> ? U : T;

// Check if something is string-compatible (string, string enum, or string literal union)
type IsStringCompatible<T> = T extends string ? T : never;

// For a given key, get the string-compatible base type
type StringCompatibleForK<K> = K extends 'layout'
  ? HCLayout
  : K extends propType
  ? IsStringCompatible<BaseType<valueType<K>>>
  : K extends facePropType
  ? IsStringCompatible<BaseType<faceValueType<K>>>
  : never;
type AcceptableValue<K> = StringCompatibleForK<K>;
/**
 * Adds a tag
 * @param card card object
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 */
export const addTag = <K extends propType | facePropType>(
  card: cardObjectType,
  tag: string,
  note?: string,
  prop?: K,
  value?: Record<string, AcceptableValue<K>> | AcceptableValue<K>,
  options?: {
    dontAddNote?: boolean;
    replaceNote?: boolean;
    push?: boolean;
    useRootOnly?: boolean;
    useUrl?: boolean;
    defaultToBack?: boolean;
  }
) => {
  if (note) {
    const useBoth = note.includes('|') && !options?.useRootOnly;
    const noteIsNum = Number.isInteger(Number(note)) && !options?.useRootOnly;
    const [face, subnote] = [
      useBoth ? parseInt(note.split('|')[0]) : noteIsNum ? parseInt(note) : undefined,
      useBoth ? note.split('|')[1] : noteIsNum ? undefined : note,
    ];
    const tagUrl =
      options?.useUrl && subnote
        ? subnote.slice(0, 4) == 'http'
          ? subnote
          : 'https://lh3.googleusercontent.com/d/' + subnote
        : undefined;
    if (face != undefined) {
      if (typeof value == 'string') {
        addTagToFace(card, face, prop as facePropType, value, options?.push);
      } else if (value) {
        addTagToFace(card, face, prop as facePropType, value[tag], options?.push);
      } else if (prop && subnote) {
        addTagToFace(
          card,
          face,
          prop as facePropType,
          options?.useUrl ? tagUrl! : subnote,
          options?.push
        );
      }
    } else if (options?.defaultToBack) {
      if (typeof value == 'string') {
        addTagToFace(card, 1, prop as facePropType, value, options?.push);
      } else if (value) {
        addTagToFace(card, 1, prop as facePropType, value[tag], options?.push);
      } else if (prop && subnote) {
        addTagToFace(
          card,
          1,
          prop as facePropType,
          options?.useUrl ? tagUrl! : subnote,
          options?.push
        );
      }
    } else {
      if (typeof value == 'string') {
        addTagToRoot(card, prop as propType, value, options?.push);
      } else if (value) {
        addTagToRoot(card, prop as propType, value[tag], options?.push);
      } else if (prop) {
        addTagToRoot(card, prop as propType, options?.useUrl ? tagUrl! : note, options?.push);
      }
    }
    if (subnote && !options?.useUrl && !options?.dontAddNote) {
      addTagNote(card, tag, subnote, options?.replaceNote);
    }
  } else {
    if (typeof value == 'string') {
      addTagToRoot(card, prop as propType, value, options?.push);
    } else if (value) {
      addTagToRoot(card, prop as propType, value[tag], options?.push);
    }
  }
};

/**
 * Adds an artist note
 * @param card card object
 * @param artist artist to add note to
 * @param note note to add
 */
const addArtistNote = (card: cardObjectType, artist: string, note: string) => {
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
 * @param card card object
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 */
export const addArtist = (card: cardObjectType, artist: string, note?: string) => {
  if (note) {
    addArtistNote(card, artist, note);
  }
};

export const toSingleCard = (
  cardObject: cardObjectType,
  layout?: HCLayoutGroup.SingleFacedType
): HCCard.AnySingleFaced => {
  if (cardObject.card_faces[0].image) {
    // this should never happen. If it does, it means that an image needs to be moved to an image tag
    throw error;
  }
  const { card_faces, ...singleCard } = cardObject;
  for (const [key, value] of Object.entries(cardObject.card_faces[0]).filter(
    ([key, value]) =>
      ![
        'object',
        'name',
        'type_line',
        // 'mana_cost',
        'mana_value',
        'image_status',
        'colors',
        'image',
        'layout',
      ].includes(key)
  )) {
    if (key == 'frame_effects' && cardObject[key]) {
      (singleCard as any)[key].push(...(value as HCFrameEffect[]));
    } else {
      (singleCard as any)[key] = value;
    }
  }
  if (layout) {
    (singleCard as any).layout = layout;
  }
  const card = singleCard as HCCard.AnySingleFaced;
  setDerivedProps(card);
  return card;
};

export const propListIncludes = (propList: propType[], prop: string | propType) =>
  propList.includes(prop as propType);
export const facePropListIncludes = (propList: facePropType[], prop: string | facePropType) =>
  propList.includes(prop as facePropType);
export const partPropListIncludes = (propList: partPropType[], prop: string | partPropType) =>
  propList.includes(prop as partPropType);

export const getCardEntries = (card: HCCard.Any) =>
  Object.entries(card) as { [K in propType]: [K, valueType<K>] }[propType][];

export const getFaceEntries = (card: HCCard.AnyMultiFaced, index?: number) =>
  Object.entries(card.card_faces[index ?? 0]) as {
    [K in facePropType]: [K, faceValueType<K>];
  }[facePropType][];

export const getFilteredCardEntries = (card: HCCard.Any, propList: propType[]) =>
  (Object.entries(card) as { [K in propType]: [K, valueType<K>] }[propType][]).filter(
    ([key, value]) => propList.includes(key)
  );
export const getFilteredFaceEntries = (
  card: HCCard.AnyMultiFaced,
  propList: facePropType[],
  index?: number
) =>
  (
    Object.entries(card.card_faces[index ?? 0]) as {
      [K in facePropType]: [K, faceValueType<K>];
    }[facePropType][]
  ).filter(([key, value]) => propList.includes(key));

export const getFilteredCardProps = (card: HCCard.Any, propList: propType[]) =>
  (Object.keys(card) as propType[]).filter(key => propList.includes(key));
export const getFilteredFaceProps = (
  card: HCCard.AnyMultiFaced,
  propList: facePropType[],
  index?: number
) =>
  (Object.keys(card.card_faces[index ?? 0]) as facePropType[]).filter(key =>
    propList.includes(key)
  );

export const getFilteredCardMoveEntries = (
  card: HCCard.Any,
  propList: (propType & facePropType)[]
) =>
  (
    Object.entries(card) as { [K in propType & facePropType]: [K, valueType<K>] }[propType &
      facePropType][]
  ).filter(([key, value]) => propList.includes(key));
export const getFilteredFaceMoveEntries = (
  card: HCCard.AnyMultiFaced,
  propList: (propType & facePropType)[],
  index?: number
) =>
  (
    Object.entries(card.card_faces[index ?? 0]) as {
      [K in propType & facePropType]: [K, faceValueType<K>];
    }[propType & facePropType][]
  ).filter(([key, value]) => propList.includes(key));
