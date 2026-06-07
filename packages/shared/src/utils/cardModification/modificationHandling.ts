import { HCCard, HCImageStatus, HCLayout, HCLayoutGroup } from '@hellfall/shared/types';
import {
  facePropType,
  faceValueType,
  listShareLower,
  popProp,
  pushProp,
  rootPropType,
  rootValueType,
  fillFacesTo,
  layoutIsDefault,
} from '@hellfall/shared/utils';
import { frameEffectTags } from './tagHandling';

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
  value: rootValueType<K>
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
  value: rootValueType<K>
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
  value: faceValueType<K>,
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
  value: faceValueType<K>,
  index?: number
) => popProp('card_faces' in card ? card.card_faces[index ?? 0] : card, prop, value);

export const faceIsBattle = (card: HCCard.AnyMultiFaced, index: number) =>
  listShareLower(card.card_faces[index]?.types, 'battle');

export const rootIsBattle = (card: HCCard.AnySingleFaced) => listShareLower(card.types, 'battle');

export const frontIsBattle = (card: HCCard.Any, index: number) =>
  'card_faces' in card ? faceIsBattle(card, index) : rootIsBattle(card);

/**
 * Adds a tag to a specific face
 * @param card card to add tag to
 * @param index face number (defaults to 0 if the face number is invalid)
 * @param prop prop to set/push the value to
 * @param value value to set/push
 * @param push whether to push the value (use true when the prop is an array)
 */
export const addTagToFace = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  value: faceValueType<K>,
  index?: number,
  push?: boolean
) => {
  // const faceIndex = index > 0 && index < card.card_faces.length ? index : 0;
  if (push) {
    pushPropToFace(card, prop, value, index);
  } else {
    addPropToFace(card, prop, value, index);
  }
};
/**
 * Adds a tag to the card root
 * @param card card to add tag to
 * @param prop prop to set/push the value to
 * @param value value to set/push
 * @param push whether to push the value (use true when the prop is an array)
 */
export const addTagToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K,
  value: rootValueType<K>,
  push?: boolean
) => {
  if (push) {
    pushPropToRoot(card, prop, value);
  } else {
    addPropToRoot(card, prop, value);
  }
};

/**
 * Adds a tag note
 * @param card card to add tag note to
 * @param tag tag to add note to
 * @param note note to add
 * @param replaceNote whether to replace the note; if not true, will concat with '; '
 */
export const addTagNote = (card: HCCard.Any, tag: string, note: string, replaceNote?: boolean) => {
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
  : K extends rootPropType
  ? IsStringCompatible<BaseType<rootValueType<K>>>
  : K extends facePropType
  ? IsStringCompatible<BaseType<faceValueType<K>>>
  : never;
type AcceptableValue<K> = StringCompatibleForK<K>;
/**
 * Adds a tag
 * @param card card to add tag to
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 * returns true when the tag is added to the root and false otherwise
 */
export const addTag = <K extends rootPropType | facePropType>(
  card: HCCard.Any,
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
  let addedToRoot = false;
  if (note) {
    const useBoth = note.includes('|') && !options?.useRootOnly && 'card_faces' in card;
    const noteIsNum =
      Number.isInteger(Number(note)) && !options?.useRootOnly && 'card_faces' in card;
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
    if (face != undefined && 'card_faces' in card) {
      if (typeof value == 'string') {
        addTagToFace(card, prop as facePropType, value, face, options?.push);
      } else if (value) {
        addTagToFace(card, prop as facePropType, value[tag], face, options?.push);
      } else if (prop && subnote) {
        addTagToFace(
          card,
          prop as facePropType,
          options?.useUrl ? tagUrl! : subnote,
          face,
          options?.push
        );
      }
    } else if (options?.defaultToBack && 'card_faces' in card) {
      if (typeof value == 'string') {
        addTagToFace(card, prop as facePropType, value, 1, options?.push);
      } else if (value) {
        addTagToFace(card, prop as facePropType, value[tag], 1, options?.push);
      } else if (prop && subnote) {
        addTagToFace(
          card,
          prop as facePropType,
          options?.useUrl ? tagUrl! : subnote,
          1,
          options?.push
        );
      }
    } else {
      if (typeof value == 'string') {
        addTagToRoot(card, prop as rootPropType, value, options?.push);
      } else if (value) {
        addTagToRoot(card, prop as rootPropType, value[tag], options?.push);
      } else if (prop) {
        addTagToRoot(card, prop as rootPropType, options?.useUrl ? tagUrl! : note, options?.push);
      }
      addedToRoot = Boolean(value || prop);
    }
    if (
      subnote &&
      !options?.useUrl &&
      !options?.dontAddNote &&
      !(subnote == '0' && tag in frameEffectTags)
    ) {
      addTagNote(card, tag, subnote, options?.replaceNote);
    }
  } else {
    if (typeof value == 'string') {
      addTagToRoot(card, prop as rootPropType, value, options?.push);
    } else if (value) {
      addTagToRoot(card, prop as rootPropType, value[tag], options?.push);
    }
    addedToRoot = Boolean(value);
  }
  return addedToRoot;
};
export const layoutTags = [
  'weird-leveler',
  'leveler',
  'weird-1-mana-levelers-cycle',
  'mutate-layout',
  'prototype',
  'noncard',
  'meld',
  'reminder-card',
  'draftpartner-faces',
  'reminder-on-back',
  'dungeon-in-inset',
  'dungeon-on-back',
  'stickers-on-back',
  'token-in-inset',
  'token-on-back',
  'specialize',
  'mdfc',
  'transform',
  'flip',
  'inset',
  'prepare',
  'aftermath',
  'split',
  'reminder',
  'token',
  'stickers',
  'dungeon',
  'draftpartner',
] as const;
export type layoutTagType = (typeof layoutTags)[number];
const singleLayoutTags: Partial<Record<layoutTagType, HCLayoutGroup.SingleFacedType>> = {
  'weird-leveler': HCLayout.Leveler,
  leveler: HCLayout.Leveler,
  'weird-1-mana-levelers-cycle': HCLayout.Leveler,
  'mutate-layout': HCLayout.Mutate,
  noncard: HCLayout.Misc,
  prototype: HCLayout.Prototype,
};

// use this for token faces in combination with cardMultiLayoutToFaceLayout
const multiLayoutTags = {
  // meld: HCLayout.MeldPart,
  'draftpartner-faces': HCLayout.DraftPartner,
  'reminder-on-back': HCLayout.ReminderOnBack,
  'dungeon-in-inset': HCLayout.DungeonInInset,
  'dungeon-on-back': HCLayout.DungeonOnBack,
  'stickers-on-back': HCLayout.StickersOnBack,
  'token-in-inset': HCLayout.TokenInInset,
  'token-on-back': HCLayout.TokenOnBack,
  specialize: HCLayout.Specialize,
  mdfc: HCLayout.Modal,
  transform: HCLayout.Transform,
  flip: HCLayout.Flip,
  inset: HCLayout.Inset,
  prepare: HCLayout.Prepare,
  aftermath: HCLayout.Aftermath,
  split: HCLayout.Split,
} as const satisfies Partial<Record<layoutTagType, HCLayoutGroup.MultiFacedType>>;

const layoutTagToImageStatus: Partial<
  Record<keyof typeof faceLayoutTags | keyof typeof multiToFaceLayoutTags, HCImageStatus>
> = {
  'draftpartner-faces': HCImageStatus.DraftPartner,
  draftpartner: HCImageStatus.DraftPartner,
  'reminder-on-back': HCImageStatus.Reminder,
  'reminder-card': HCImageStatus.Reminder,
  reminder: HCImageStatus.Reminder,
  'dungeon-in-inset': HCImageStatus.Dungeon,
  'dungeon-on-back': HCImageStatus.Dungeon,
  dungeon: HCImageStatus.Dungeon,
  'stickers-on-back': HCImageStatus.Stickers,
  stickers: HCImageStatus.Stickers,
  'token-in-inset': HCImageStatus.Token,
  'token-on-back': HCImageStatus.Token,
  token: HCImageStatus.Token,
  flip: HCImageStatus.Flip,
  inset: HCImageStatus.Inset,
  prepare: HCImageStatus.Prepare,
  aftermath: HCImageStatus.Aftermath,
  split: HCImageStatus.Split,
};

const frontIgnoreMultiLayoutTags: (keyof typeof multiLayoutTags)[] = [
  // 'meld',
  'draftpartner-faces',
  'reminder-on-back',
  'token-on-back',
  'token-in-inset',
  'dungeon-on-back',
  'dungeon-in-inset',
  'stickers-on-back',
  'inset',
  'prepare',
];
const faceLayoutTags: Partial<Record<layoutTagType, HCLayoutGroup.FaceLayoutType>> = {
  draftpartner: HCLayout.DraftPartner,
  reminder: HCLayout.Reminder,
  token: HCLayout.Token,
  dungeon: HCLayout.Dungeon,
  stickers: HCLayout.Stickers,
  mdfc: HCLayout.Modal,
  transform: HCLayout.Transform,
  specialize: HCLayout.Specialize,
  flip: HCLayout.Flip,
  inset: HCLayout.Inset,
  prepare: HCLayout.Prepare,
  aftermath: HCLayout.Aftermath,
  split: HCLayout.Split,
};
const multiToFaceLayoutTags: Partial<
  Record<keyof typeof multiLayoutTags, HCLayoutGroup.FaceLayoutType>
> = {
  'draftpartner-faces': HCLayout.DraftPartner,
  'reminder-on-back': HCLayout.Reminder,
  'token-on-back': HCLayout.Token,
  'token-in-inset': HCLayout.Token,
  'dungeon-in-inset': HCLayout.Dungeon,
  'dungeon-on-back': HCLayout.Dungeon,
  'stickers-on-back': HCLayout.Stickers,
  mdfc: HCLayout.Modal,
  transform: HCLayout.Transform,
  specialize: HCLayout.Specialize,
  flip: HCLayout.Flip,
  inset: HCLayout.Inset,
  prepare: HCLayout.Prepare,
  aftermath: HCLayout.Aftermath,
  split: HCLayout.Split,
};

// const defaultRootLayouts = [HCLayout.MultiToken, HCLayout.Multi, HCLayout.Token, HCLayout.Normal];

const addLayoutToRoot = (
  card: HCCard.Any,
  tag: string,
  value: typeof singleLayoutTags | typeof multiLayoutTags
) => addTagToRoot(card, 'layout', value[tag as keyof typeof value]!);
const addLayoutToFace = (
  card: HCCard.AnyMultiFaced,
  index: number,
  tag: string,
  value: typeof faceLayoutTags | typeof multiToFaceLayoutTags
) => {
  addTagToFace(card, 'layout', value[tag as keyof typeof value]!, index);
  if (!card.card_faces[index].image && tag in layoutTagToImageStatus) {
    card.card_faces[index].image_status = layoutTagToImageStatus[tag as keyof typeof value]!;
  }
};

export const addLayoutTag = (card: HCCard.Any, tag: string, note?: string) => {
  const useBoth = note?.includes('|') && 'card_faces' in card;
  const noteIsNum = Number.isInteger(Number(note)) && 'card_faces' in card;

  if (note) {
    const [face, subnote] = [
      useBoth ? parseInt(note.split('|')[0]) : noteIsNum ? parseInt(note) : undefined,
      useBoth ? note.split('|')[1] : noteIsNum ? undefined : note,
    ];
    if (subnote) {
      addTagNote(card, tag, subnote);
    }
    if (face != undefined) {
      if (tag in faceLayoutTags && 'card_faces' in card) {
        addLayoutToFace(card, face, tag, faceLayoutTags);
      }
      return;
    }
  }
  if (!('card_faces' in card)) {
    if (tag in singleLayoutTags) {
      addLayoutToRoot(card, tag, singleLayoutTags);
    } else if (tag == 'meld') {
      addTagToRoot(card, 'layout', card.kind == 'token' ? HCLayout.MeldResult : HCLayout.MeldPart);
    } else if (tag == 'reminder-card' && card.kind == 'token') {
      addTagToRoot(card, 'layout', HCLayout.Reminder);
    }
  } else {
    if (tag in multiLayoutTags) {
      if (card.kind != 'token') {
        addLayoutToRoot(card, tag, multiLayoutTags);
      }
      if (tag in multiToFaceLayoutTags) {
        card.card_faces.forEach((face, i) => {
          if (
            (i || !frontIgnoreMultiLayoutTags.includes(tag as keyof typeof multiLayoutTags)) &&
            layoutIsDefault(card, i)
          ) {
            addLayoutToFace(card, i, tag, multiToFaceLayoutTags);
          }
        });
      }
    } else if (tag == 'meld') {
      addTagToRoot(card, 'layout', card.kind == 'token' ? HCLayout.MeldResult : HCLayout.MeldPart);
      card.card_faces.forEach((face, i) => {
        addTagToFace(card, 'layout', i ? HCLayout.MeldResult : HCLayout.MeldPart, i);
      });
    } else if (tag == 'reminder-card' && card.kind == 'token') {
      addTagToRoot(card, 'layout', HCLayout.MultiReminder);
      card.card_faces.forEach((face, i) => {
        addTagToFace(card, 'layout', HCLayout.Reminder, i);
        if (!face.image) {
          face.image_status = layoutTagToImageStatus['reminder-card']!;
        }
      });
    }
  }
};

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
