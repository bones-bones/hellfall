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

export type propType = keyof HCCard.Any;
export type valueType<K extends propType> = HCCard.Any[K];
export type arrayElementType<K extends propType> = HCCard.Any[K] extends Array<infer U> ? U : never;
export type facePropType = keyof HCCardFace.MultiFaced;
export type faceValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
export type faceArrayElementType<K extends facePropType> = HCCardFace.MultiFaced[K] extends Array<
  infer U
>
  ? U
  : never;
// export type cardObjectType = Record<propType, valueType<propType>> & { card_faces: Record<facePropType, faceValueType<facePropType>>[], all_parts?: Record<partPropType, partValueType<partPropType>>[]}
export type cardFaceType = { [F in facePropType]: HCCardFace.MultiFaced[F] };
export type cardObjectType = {
  [K in propType]?: HCCard.Any[K]; // This preserves individual types
} & {
  card_faces: cardFaceType[];
};

export const fillFacesTo = (card: cardObjectType, index: number) => {
  while (card.card_faces.length <= index) {
    card.card_faces.push({} as cardFaceType);
  }
};
export const addProp = <K extends propType>(card: cardObjectType, prop: K, value: valueType<K>) => {
  (card as any)[prop] = value;
};
export const pushProp = <K extends propType>(
  card: cardObjectType,
  prop: K,
  value: arrayElementType<K>
) => {
  if (Array.isArray(card[prop])) {
    (card as any)[prop].push(value);
  } else {
    (card as any)[prop] = [value];
  }
};
export const addPropToFace = <K extends facePropType>(
  card: cardObjectType,
  index: number,
  prop: K,
  value: faceValueType<K>
) => {
  fillFacesTo(card, index);
  (card as any).card_faces[index][prop] = value;
};
export const pushPropToFace = <K extends facePropType>(
  card: cardObjectType,
  index: number,
  prop: K,
  value: faceArrayElementType<K>
) => {
  fillFacesTo(card, index);
  if (Array.isArray(card.card_faces[index][prop])) {
    (card as any).card_faces[index][prop].push(value);
  } else {
    (card as any).card_faces[index][prop] = [value];
  }
};
export const addPropToFrontFace = <K extends facePropType>(
  card: cardObjectType,
  prop: K,
  value: faceValueType<K>
) => {
  fillFacesTo(card, 0);
  (card as any).card_faces[0][prop] = value;
};
export const faceIsBattle = (card: cardObjectType, index: number) => {
  return (
    index < card.card_faces.length &&
    (card.card_faces[index].types as string[]).some(type => type.toLowerCase())
  );
};
export const frontIsBattle = (card: cardObjectType) => {
  return (
    0 < card.card_faces.length &&
    (card.card_faces[0].types as string[]).some(type => type.toLowerCase())
  );
};
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
  const faceIndex = index > 0 && index < card.card_faces.length ? index : 0;
  if (push) {
    pushPropToFace(card, index, prop, value as faceArrayElementType<K>);
  } else {
    addPropToFace(card, index, prop, value as faceValueType<K>);
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
    pushProp(card, prop, value as arrayElementType<K>);
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
  if (!replaceNote && card.tag_notes && card.tag_notes[tag]) {
    card.tag_notes[tag] += '; ' + note;
  } else {
    if (!card.tag_notes) {
      card.tag_notes = {} as Record<string, string>;
    }
    card.tag_notes[tag] = note;
  }
};

// type TagValueType<K> =
//   K extends propType ? valueType<K> :
//   K extends facePropType ? faceValueType<K> :
//   never;
// type TagArrayElementType<K> =
//   K extends propType ? arrayElementType<K> :
//   K extends facePropType ? faceArrayElementType<K> :
//   never;
// type AddTagValueType<K> =
//   TagValueType<K> extends string ? TagValueType<K> : never;

// type AddTagArrayElementType<K> =
//   TagArrayElementType<K> extends string ? TagArrayElementType<K> : never;
type AddTagValueType<K> = K extends propType
  ? valueType<K>
  : K extends facePropType
  ? faceValueType<K>
  : never;

type AddTagArrayElementType<K> = K extends propType
  ? arrayElementType<K>
  : K extends facePropType
  ? faceArrayElementType<K>
  : never;

// Gets the base type (if array, get element; otherwise keep as is)
type BaseType<T> = T extends Array<infer U> ? U : T;

// Check if something is string-compatible (string, string enum, or string literal union)
type IsStringCompatible<T> = T extends string ? T : never;

// For a given key, get the string-compatible base type
type StringCompatibleForK<K> = K extends propType
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
    singleCard.layout = layout;
  }
  const card = singleCard as HCCard.AnySingleFaced;
  setDerivedProps(card);
  return card;
};
