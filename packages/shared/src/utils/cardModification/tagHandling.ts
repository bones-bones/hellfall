import {
  HCBorderColor,
  HCCard,
  HCFinish,
  HCFrame,
  HCFrameEffect,
  HCImageStatus,
  HCLayout,
  HCLayoutGroup,
  SetCode,
  // tagRecord,
  // tagState,
} from '@hellfall/shared/types';
import {
  // AcceptableValue,
  // addLayoutTag,
  addPropToRoot,
  // addTag,
  deletePropFromFace,
  deletePropFromRoot,
  // layoutTags,
  // layoutTagType,
} from './modificationHandling';
import {
  allPropType,
  allValueType,
  anyPropType,
  facePropType,
  faceType,
  faceValueType,
  rootPropType,
  rootValueType,
  toFaces,
} from '../cardHandling';
import {
  getDefaultFaceLayout,
  getDefaultFaceValue,
  getDefaultKindLayout,
  getDefaultRootValue,
  kindToDefaultFrame,
  kindToFaceLayout,
  kindToMultiLayout,
  // layoutIsDefault,
} from './defaults';
import { getSet } from '../setHandling';
import {
  anyChange,
  changeType,
  createFaceChange,
  createRootChange,
  createTagChange,
  rootChange,
  tagChange,
} from './changeTypes';
import { changeIsValid, sortChanges } from './changeHandling';

const frameTags: Record<string, HCFrame> = {
  'future-frame': HCFrame.Future,
  'playtest-frame': HCFrame.Playtest,
  'jank-frame': HCFrame.Jank,
  'pokemon-frame': HCFrame.Pokemon,
  'yugioh-frame': HCFrame.Yugioh,
  'legends-of-runeterra-frame': HCFrame.LegendsOfRuneterra,
  'slay-the-spire-frame': HCFrame.SlayTheSpire,
  'inscryption-frame': HCFrame.Inscryption,
  'hearthstone-frame': HCFrame.Hearthstone,
  'lorcana-frame': HCFrame.Lorcana,
  'balatro-frame': HCFrame.Balatro,
  'tarot-frame': HCFrame.Tarot,
  'notmagic-frame': HCFrame.NotMagic,
  'website-app-frame': HCFrame.WebsiteApp,
  'shattered-frame': HCFrame.Shattered,
};

const cardFrameTags: Record<string, HCFrame> = {
  '1993-frame': HCFrame.Original,
  '1997-frame': HCFrame.Classic,
  '2003-frame': HCFrame.Modern,
  '2015-frame': HCFrame.Stamp,
  '1997-token-frame': HCFrame.ClassicToken,
  '2003-token-frame': HCFrame.ModernToken,
  '2015-token-frame': HCFrame.StampToken,
  '2020-token-frame': HCFrame.FullToken,
};
const tokenFrameTags: Record<string, HCFrame> = {
  '1993-card-frame': HCFrame.Original,
  '1997-card-frame': HCFrame.Classic,
  '2015-card-frame': HCFrame.Stamp,
  '2003-card-frame': HCFrame.Modern,
  '1997-frame': HCFrame.ClassicToken,
  '2003-frame': HCFrame.ModernToken,
  '2015-frame': HCFrame.StampToken,
  '2020-frame': HCFrame.FullToken,
};
export const anyFrameEffectTags: Record<string, HCFrameEffect> = {
  'miracle-frame': HCFrameEffect.Miracle,
  'nyx-frame': HCFrameEffect.Enchantment,
  'draft-frame': HCFrameEffect.Draft,
  'devoid-frame': HCFrameEffect.Devoid,
  tombstone: HCFrameEffect.Tombstone,
  'colorshifted-frame': HCFrameEffect.Colorshifted,
  'masterpiece-frame': HCFrameEffect.Masterpiece,
  'inverted-text': HCFrameEffect.Inverted,
  'showcase-frame': HCFrameEffect.Showcase,
  'extended-art': HCFrameEffect.ExtendedArt,
  'full-art': HCFrameEffect.FullArt,
  'vertical-art': HCFrameEffect.VerticalArt,
  'no-art': HCFrameEffect.NoArt,
  'companion-frame': HCFrameEffect.Companion,
  'etched-frame': HCFrameEffect.Etched,
  'spree-frame': HCFrameEffect.Spree,
  'slab-frame': HCFrameEffect.Slab,
  'arena-frame': HCFrameEffect.Arena,
  'universes-beyond-frame': HCFrameEffect.UniversesBeyond,
};
export const faceFrameEffectTags: Record<string, HCFrameEffect> = {
  'sun-moon-transform': HCFrameEffect.SunMoonDfc,
  'type-transform-marks': HCFrameEffect.TypeDfc,
  'generic-transform-marks': HCFrameEffect.TransformDfc,
  'generic-mdfc-marks': HCFrameEffect.Mdfc,
  'compass-land-transform': HCFrameEffect.CompassLandDfc,
  'origin-pw-transform': HCFrameEffect.OriginPwDfc,
  'moon-eldrazi-transform': HCFrameEffect.MoonEldraziDfc,
  'fan-transform': HCFrameEffect.FanDfc,
  'specialize-frame': HCFrameEffect.Specialize,
};
const frontImageTagProps: Record<string, rootPropType> = {
  'draft-image': 'draft_image',
  'rotated-draft-image': 'rotated_draft_image',
  'still-draft-image': 'still_draft_image',
};
const faceImageTagProps: Record<string, allPropType> = {
  'rotated-image': 'rotated_image',
  'still-image': 'still_image',
};
const borderColorTags: Record<string, HCBorderColor> = {
  'white-border': HCBorderColor.White,
  borderless: HCBorderColor.Borderless,
  'no-border': HCBorderColor.NoBorder,
  'silver-border': HCBorderColor.Silver,
  'gold-border': HCBorderColor.Gold,
  'yellow-border': HCBorderColor.Yellow,
  'rainbow-border': HCBorderColor.Rainbow,
  'blue-border': HCBorderColor.Blue,
  'unique-border': HCBorderColor.Unique,
  'orange-border': HCBorderColor.Orange,
  'red-border': HCBorderColor.Red,
};

const removableTagProps: anyPropType[] = [
  'flavor_name',
  'watermark',
  'frame_effects',
  'rotated_image',
  'still_image',
  'draft_image',
  'draft_image_status',
  'rotated_draft_image',
  'still_draft_image',
  'tag_notes',
];
const removableFaceTagProps: facePropType[] = ['finish', 'border_color', 'frame'];

// const setTagPropsToDefault = (card: HCCard.Any) => {
//   removableTagProps.forEach(prop => deletePropFromRoot(card, prop as rootPropType));
//   card.finish = HCFinish.Nonfoil;
//   card.border_color = HCBorderColor.Black;
//   card.frame = kindToDefaultFrame[card.kind];
//   if ('card_faces' in card) {
//     card.layout = kindToMultiLayout[card.kind];
//     card.card_faces.forEach((face, i) => {
//       removableTagProps.forEach(prop => deletePropFromFace(card, prop as facePropType, i));
//       removableFaceTagProps.forEach(prop => deletePropFromFace(card, prop, i));
//       face.layout = card.kind == 'card' && i ? HCLayout.Multi : kindToFaceLayout[card.kind];
//       if (!face.image) {
//         face.image_status = i ? HCImageStatus.Inapplicable : HCImageStatus.Front;
//       }
//     });
//   } else {
//     card.layout = kindToFaceLayout[card.kind];
//   }
// };

const tokenTypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  emblem: HCLayout.Emblem,
  // 'reminder card': HCLayout.Reminder,
  stickers: HCLayout.Stickers,
  dungeon: HCLayout.Dungeon,
  // 'real card': HCLayout.RealCardToken,
  'ad card': HCLayout.Misc,
  misc: HCLayout.Misc,
  checklist: HCLayout.Checklist,
};
const typeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  plane: HCLayout.Planar,
  phenomenon: HCLayout.Planar,
  scheme: HCLayout.Scheme,
  vanguard: HCLayout.Vanguard,
  battle: HCLayout.Battle,
};
const subtypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  saga: HCLayout.Saga,
  class: HCLayout.Class,
  case: HCLayout.Case,
  spacecraft: HCLayout.Station,
  watercraft: HCLayout.Station,
  planet: HCLayout.Station,
};

// const setFacePropsFromTypes = (face: faceType, shouldSetLayout: boolean, isTokenRoot?: boolean) => {
//   if (shouldSetLayout) {
//     const tokenType = face.types
//       ?.find(type => type.toLowerCase() in tokenTypeLayouts)
//       ?.toLowerCase();
//     if (tokenType) {
//       face.layout = tokenTypeLayouts[tokenType];
//       return;
//     } else if (isTokenRoot) {
//       return;
//     }
//     const type = face.types?.find(type => type.toLowerCase() in typeLayouts)?.toLowerCase();
//     if (type) {
//       face.layout = subtypeLayouts[type];
//       return;
//     }

//     const subtype = face.subtypes
//       ?.find(type => type.toLowerCase() in subtypeLayouts)
//       ?.toLowerCase();
//     if (subtype) {
//       face.layout = subtypeLayouts[subtype];
//       return;
//     }
//   }
// };

export const splitFullTag = (fullTag: string) => {
  const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
  const [tag, note] = [
    (hasNote ? fullTag.split('<')[0] : fullTag).trim(),
    hasNote ? fullTag.split('<')[1].slice(0, -1).trim() : undefined,
  ];
  return { tag, note };
};

export const tagChangesVisibleProps = (fullTag: string): boolean => {
  const { tag } = splitFullTag(fullTag);
  if (tag in faceImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag == 'back-image') {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (tag in frontImageTagProps) {
    return true;
  }
  if (getSet(tag.toUpperCase() as SetCode) || ['hc1.0', 'hc1.1', 'hc1.2'].includes(tag)) {
    return true;
  }
  return false;
};

export const tagChangesAnyProps = (fullTag: string): boolean => {
  const { tag } = splitFullTag(fullTag);
  if (tagChangesVisibleProps(tag)) {
    return true;
  }
  if (tag in frameTags) {
    return true;
  }
  if (tag in cardFrameTags) {
    return true;
  }
  if (tag in tokenFrameTags) {
    return true;
  }
  if (tag in anyFrameEffectTags) {
    return true;
  }
  if (tag in faceFrameEffectTags) {
    return true;
  }
  if (tag in borderColorTags) {
    return true;
  }
  if (layoutTags.includes(tag as layoutTagType)) {
    return true;
  }
  if (tag == 'foil') {
    return true;
  }
  return false;
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
/**
 * Adds a tag
 * @param card card to add tag to
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 */
export const preAddToFace = <K extends facePropType>(
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string,
  prop?: K,
  value?: Record<string, faceValueType<K>> | faceValueType<K>,
  options?: {
    dontAddNote?: boolean;
    replaceNote?: boolean;
    push?: boolean;
    // useRootOnly?: boolean;
    useUrl?: boolean;
    defaultToBack?: boolean;
  }
): anyChange[] => {
  const { tag, note } = splitFullTag(full_tag);
  const changes: anyChange[] = [];
  const tag_change: tagChange = {
    location: 'tag',
    change_type,
    full_tag,
  };
  if (note != undefined) {
    tag_change.tag = tag;
  }
  if (!prop) {
    if (note) {
      tag_change.note = note;
    }
    changes.push(tag_change);
    return changes;
  }
  const defaultValue = getDefaultFaceValue(card, prop);
  const getValue = (subnote?: string, tagUrl?: string): faceValueType<K> | undefined => {
    if (defaultValue && change_type == 'delete') {
      return defaultValue;
    } else if (typeof value == 'string') {
      return value;
    } else if (typeof value == 'object' && !Array.isArray(value)) {
      return value[tag];
    } else if (subnote) {
      return (options?.useUrl ? tagUrl : subnote) as faceValueType<K> | undefined;
    }
  };
  const useBoth = note?.includes('|') && /* !options?.useRootOnly &&  */ 'card_faces' in card;
  const noteIsNum =
    Number.isInteger(Number(note)) && /* !options?.useRootOnly &&  */ 'card_faces' in card;
  const [face, subnote] = [
    useBoth
      ? parseInt(note?.split('|')[0] ?? '')
      : noteIsNum
      ? parseInt(note ?? '')
      : options?.defaultToBack && 'card_faces' in card
      ? 1
      : 0,
    useBoth ? note?.split('|')[1] : noteIsNum ? undefined : note,
  ];
  const face_change_type: changeType =
    change_type == 'delete' ? (options?.push ? 'pop' : 'delete') : options?.push ? 'push' : 'add';
  const tagUrl =
    options?.useUrl && subnote
      ? subnote.slice(0, 4) == 'http'
        ? subnote
        : 'https://lh3.googleusercontent.com/d/' + subnote
      : undefined;
  const resolvedValue = getValue(subnote, tagUrl);
  const change = createFaceChange(face_change_type, prop, resolvedValue, face);
  if (defaultValue && change_type == 'delete') {
    change.change_type = 'add';
  }
  if (change.value != undefined) {
    changes.push(change);
  }
  if (
    subnote &&
    !options?.useUrl &&
    !options?.dontAddNote /* &&
    !(subnote == '0' && tag in frameEffectTags) */
  ) {
    tag_change.note = subnote;
  }
  changes.push(tag_change);
  return changes.sort(sortChanges);
};

/**
 * Adds a tag
 * @param card card to add tag to
 * @param tag tag to add
 * @param note tag note
 * @param prop prop to set
 * @param value value to set the prop to, or record to access with the tag to get the value
 * @param options whether to replace the note instead of just concatting it; whether to push the value to an array; whether to only add to the root; whether to parse the note as an url
 */
export const preAddToRoot = <K extends rootPropType>(
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string,
  prop?: K,
  value?: Record<string, rootValueType<K>> | rootValueType<K>,
  options?: {
    dontAddNote?: boolean;
    replaceNote?: boolean;
    push?: boolean;
    // useRootOnly?: boolean;
    useUrl?: boolean;
    defaultToBack?: boolean;
  }
): anyChange[] => {
  const { tag, note } = splitFullTag(full_tag);
  const changes: anyChange[] = [];
  const tag_change: tagChange = {
    location: 'tag',
    change_type,
    full_tag,
  };
  if (note != undefined) {
    tag_change.tag = tag;
  }
  if (!prop) {
    if (note) {
      tag_change.note = note;
    }
    changes.push(tag_change);
    return changes;
  }
  const defaultValue = getDefaultRootValue(card, prop);
  const getValue = (subnote?: string, tagUrl?: string): rootValueType<K> | undefined => {
    if (defaultValue && change_type == 'delete') {
      return defaultValue;
    } else if (typeof value == 'string') {
      return value;
    } else if (typeof value == 'object' && !Array.isArray(value)) {
      return (value as Record<string, rootValueType<K>>)[tag];
    } else if (subnote) {
      return (options?.useUrl ? tagUrl : subnote) as rootValueType<K> | undefined;
    }
  };
  const root_change_type: changeType =
    change_type == 'delete' ? (options?.push ? 'pop' : 'delete') : options?.push ? 'push' : 'add';
  const tagUrl =
    options?.useUrl && note
      ? note.startsWith('http')
        ? note
        : 'https://lh3.googleusercontent.com/d/' + note
      : undefined;
  const resolvedValue = getValue(note, tagUrl);
  const change = createRootChange(root_change_type, prop, resolvedValue);
  if (defaultValue && change_type == 'delete') {
    change.change_type = 'add';
  }
  if (change.value != undefined) {
    changes.push(change);
  }
  if (
    note &&
    !options?.useUrl &&
    !options?.dontAddNote /* &&
    !(note == '0' && tag in frameEffectTags) */
  ) {
    tag_change.note = note;
  }
  changes.push(tag_change);
  return changes.sort(sortChanges);
};
export const preAddToAny = <K extends allPropType>(
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string,
  prop?: K,
  value?: Record<string, allValueType<K>> | allValueType<K>,
  options?: {
    dontAddNote?: boolean;
    replaceNote?: boolean;
    push?: boolean;
    // useRootOnly?: boolean;
    useUrl?: boolean;
    defaultToBack?: boolean;
  }
): anyChange[] => {
  const { tag, note } = splitFullTag(full_tag);
  const useBoth = note?.includes('|') && /* !options?.useRootOnly && */ 'card_faces' in card;
  const noteIsNum =
    Number.isInteger(Number(note)) && /* !options?.useRootOnly && */ 'card_faces' in card;
  const [face, subnote] = [
    useBoth
      ? parseInt(note?.split('|')[0] ?? '')
      : noteIsNum
      ? parseInt(note ?? '')
      : options?.defaultToBack && 'card_faces' in card
      ? 1
      : undefined,
    useBoth ? note?.split('|')[1] : noteIsNum ? undefined : note,
  ];
  const layoutChanges = (prop: 'layout'): anyChange[] => {
    if (face != undefined && tag in faceLayoutTags && 'card_faces' in card) {
      return preAddToFace(card, change_type, full_tag, prop, faceLayoutTags, options);
    }
    if (tag in singleLayoutTags && !('card_faces' in card)) {
      return preAddToRoot(card, change_type, full_tag, prop, singleLayoutTags, options);
    }
    if (tag == 'meld') {
      const changes = preAddToRoot(
        card,
        change_type,
        full_tag,
        prop,
        card.kind == 'token' ? HCLayout.MeldResult : HCLayout.MeldPart,
        options
      );
      if ('card_faces' in card) {
        card.card_faces.forEach((face, i) => {
          changes.push(
            createFaceChange(change_type, prop, i ? HCLayout.MeldResult : HCLayout.MeldPart, i)
          );
        });
      }
      return changes;
    }
    if (tag == 'reminder-card' && card.kind == 'token') {
      const changes: anyChange[] = preAddToRoot(
        card,
        change_type,
        full_tag,
        prop,
        'card_faces' in card ? HCLayout.MultiReminder : HCLayout.Reminder,
        options
      );
      if ('card_faces' in card) {
        card.card_faces.forEach((face, i) => {
          changes.push(createFaceChange(change_type, prop, HCLayout.Reminder, i));
        });
      }
      return changes;
    }
    if (tag in multiLayoutTags && 'card_faces' in card) {
      const changes: anyChange[] = preAddToRoot(
        card,
        change_type,
        full_tag,
        card.kind == 'token' ? undefined : prop,
        card.kind == 'token' ? undefined : multiLayoutTags,
        options
      );
      if (tag in multiToFaceLayoutTags) {
        card.card_faces.forEach((face, i) => {
          if (
            (i || !frontIgnoreMultiLayoutTags.includes(tag as keyof typeof multiLayoutTags)) &&
            getDefaultKindLayout(card, i) == face.layout
          ) {
            changes.push(
              createFaceChange(
                change_type,
                prop,
                multiToFaceLayoutTags[tag as keyof typeof multiLayoutTags],
                i
              )
            );
          }
        });
      }
      return changes;
    }
    return preAddToRoot(card, change_type, full_tag);
  };
  if (prop == 'layout') {
    const changes = layoutChanges(prop);
    const status = layoutTagToImageStatus[tag as layoutTagType];
    if ('card_faces' in card && status) {
      changes.forEach(change => {
        if (
          change.location == 'face' &&
          change.index != undefined &&
          change.prop == 'layout' &&
          !card.card_faces[change.index].image
        ) {
          const statusChange = createFaceChange(change_type, 'image_status', status, change.index);
          changes.push(statusChange);
        }
      });
    }
    return changes;
  }
  if (face == undefined) {
    return preAddToRoot(
      card,
      change_type,
      full_tag,
      prop,
      value as Record<string, rootValueType<K>> | rootValueType<K> | undefined,
      options
    );
  }
  return preAddToFace(
    card,
    change_type,
    full_tag,
    prop,
    value as Record<string, faceValueType<K>> | faceValueType<K> | undefined,
    options
  );
};

// TODO: add this to the tag change processing

export const getChangesFromTag = (
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string
): anyChange[] => {
  const { tag, note } = splitFullTag(full_tag);
  if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
    return preAddToFace(
      card,
      change_type,
      full_tag,
      'watermark',
      tag.slice(0, tag.lastIndexOf('-'))
    );
  } else if (tag in frameTags) {
    return preAddToAny(card, change_type, full_tag, 'frame', frameTags);
  } else if (tag in cardFrameTags && card.kind != 'token') {
    return preAddToAny(card, change_type, full_tag, 'frame', cardFrameTags);
  } else if (tag in tokenFrameTags && card.kind == 'token') {
    return preAddToAny(card, change_type, full_tag, 'frame', tokenFrameTags);
  } else if (tag in anyFrameEffectTags) {
    return preAddToAny(
      card,
      change_type,
      note ? full_tag : `${full_tag}`,
      'frame_effects',
      anyFrameEffectTags,
      { push: true }
    );
  } else if (tag in faceFrameEffectTags) {
    return preAddToFace(
      card,
      change_type,
      note ? full_tag : `${full_tag}`,
      'frame_effects',
      faceFrameEffectTags,
      { push: true }
    );
  } else if (tag in faceImageTagProps) {
    return preAddToAny(card, change_type, full_tag, faceImageTagProps[tag], undefined, {
      useUrl: true,
    });
  } else if (tag in borderColorTags) {
    return preAddToAny(card, change_type, full_tag, 'border_color', borderColorTags);
  } else if (layoutTags.includes(tag as layoutTagType)) {
    return preAddToAny(card, change_type, full_tag, 'layout');
  } else if (tag == 'foil') {
    return preAddToAny(card, change_type, full_tag, 'finish', HCFinish.Foil);
  } else if (note) {
    if (tag in frontImageTagProps) {
      const changes = preAddToRoot(
        card,
        change_type,
        full_tag,
        frontImageTagProps[tag],
        undefined,
        {
          useUrl: true,
          // useRootOnly: true,
        }
      );
      if (tag == 'draft-image') {
        const change: rootChange<'draft_image_status'> = createRootChange(
          change_type,
          'draft_image_status',
          HCImageStatus.HighRes
        );
        changes.push(change);
      }
      return changes;
    } else if (tag == 'back-image') {
      return preAddToFace(card, change_type, full_tag, 'image', undefined, {
        useUrl: true,
        defaultToBack: true,
      });
    } else if (tag == 'flavor-name') {
      return preAddToAny(card, change_type, full_tag, 'flavor_name', undefined, {
        dontAddNote: true,
      });
    } else if (
      tag.toLowerCase() == card.set?.toLowerCase() ||
      (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
        (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
    ) {
      return preAddToRoot(card, change_type, full_tag, 'collector_number', undefined, {
        dontAddNote: true,
      });
    }
  }
  return preAddToRoot(card, change_type, full_tag);
  // return changes.filter(change=>changeIsValid(card,change))
};

// // export const addTagToState = (state: tagState, tag: string):boolean => {
// //   const tagToAdd = splitFullTag(tag).tag
// //   pushPropToRecord(state!, 'added', tagToAdd, tag);
// //   return tagChangesVisibleProps(tagToAdd)
// // };
// // export const deleteTagFromState = (state: tagState, tag: string):boolean => {
// //   const tagToDelete = splitFullTag(tag).tag;
// //   if (state?.added?.[tagToDelete]) {
// //     delete state.added[tagToDelete];
// //   } else if (state?.base_tags?.[tagToDelete] && !state.deleted?.includes(tagToDelete)) {
// //     pushProp(state, 'deleted', tagToDelete);
// //   } else {
// //     return false;
// //   }
// //   return tagChangesVisibleProps(tagToDelete)
// // };

// export const mergeTagStates = (into: tagState, donor: tagState): tagState => {
//   const state: tagState = structuredClone(into);
//   if (donor.added) {
//     Object.values(donor.added).forEach(tags => tags.forEach(tag => addTagToState(state, tag)));
//   }
//   if (donor.deleted) {
//     donor.deleted.forEach(tag => deleteTagFromState(state, tag));
//   }
//   return state;
// };

export const addTagToBase = (base_tags: string[], fullTag: string): boolean => {
  if (!base_tags.includes(fullTag)) {
    base_tags.push(fullTag);
    return tagChangesVisibleProps(fullTag);
  }
  return false;
};

export const deleteTagFromBase = (base_tags: string[], fullTag: string): boolean => {
  const { tag, note } = splitFullTag(fullTag);
  let changesVisible = false;
  for (let i = base_tags.length - 1; i >= 0; i--) {
    if (
      splitFullTag(base_tags[i]).tag == tag &&
      (note == undefined || note == (splitFullTag(base_tags[i]).note ?? ''))
    ) {
      base_tags.splice(i, 1);
      if (tagChangesVisibleProps(tag)) {
        changesVisible = true;
      }
    }
  }
  return changesVisible;
};

// export const replaceTagInBase = (base_tags: string[], fullTag: string, noteToReplace?:string):boolean => {
//   const {tag, note} = splitFullTag(fullTag)
//   if (note == 'undefined') {

//   }

// };

export const getBaseDiffs = (
  oldBase: string[],
  newBase: string[]
): { added: string[]; deleted: string[] } => {
  const added: string[] = newBase.filter(tag => !oldBase.includes(tag));
  const deleted: string[] = oldBase.filter(tag => !newBase.includes(tag));
  return { added, deleted };
};

// const getMergedTags = (
//   oldTags: string[],
//   newTags: string[]
// ): { mergedTags: string[]; shouldDeriveProps: boolean } => {
//   let shouldDeriveProps = false;
//   // TODO: implement this on the frontend too
//   // TODO: move error to correct spot
//   // if (card.kind == 'scryfall') throw console.error("Can't set tags for scryfall cards");
//   const mergedTags = [...oldTags];
//   const { added, deleted } = getBaseDiffs(oldTags, newTags);
//   deleted.forEach(fullTag => {
//     if (deleteTagFromBase(mergedTags, fullTag)) {
//       shouldDeriveProps = true;
//     }
//   });
//   added.forEach(fullTag => {
//     if (addTagToBase(mergedTags, fullTag)) {
//       shouldDeriveProps = true;
//     }
//   });
//   return { mergedTags, shouldDeriveProps };
// };

// const setPropsFromTags = (card: HCCard.Any, tags: string[], shouldDeriveProps?: boolean) => {
//   if (card.kind == 'scryfall') return;
//   if (!shouldDeriveProps) {
//     deletePropFromRoot(card, 'tag_notes');
//     if (!tags.length /* || (tags.length == 1 && tags[0] == '') */) {
//       deletePropFromRoot(card, 'tags');
//       return;
//     }
//     card.tags = tags.map(fullTag => {
//       const { tag, note } = splitFullTag(fullTag);
//       if (note) {
//         // addTagNote(card, tag, note);
//       }
//       return tag;
//     });
//     card.tags = Array.from(new Set(card.tags));
//     return;
//   }
//   setTagPropsToDefault(card);
//   deletePropFromRoot(card, 'tag_notes');
//   if (!tags.length /* || (tags.length == 1 && tags[0] == '') */) {
//     deletePropFromRoot(card, 'tags');
//     // deletePropFromRoot(card, 'tag_state');
//     if ('card_faces' in card) {
//       card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//     } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
//     return;
//   }
//   // if (setBaseTags || !card.tag_state) {
//   //   addPropToRoot(card, 'tag_state', {});
//   // }
//   card.tags = tags.map(fullTag => {
//     const { tag, note } = splitFullTag(fullTag);
//     // if (setBaseTags) {
//     //   pushPropToRecord(card.tag_state!, 'base_tags', tag, fullTag);
//     // }
//     if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
//       addTag(card, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
//     } else if (tag in frameTags) {
//       addTag(card, tag, note, 'frame', frameTags);
//     } else if (tag in cardFrameTags && card.kind != 'token') {
//       addTag(card, tag, note, 'frame', cardFrameTags);
//     } else if (tag in tokenFrameTags && card.kind == 'token') {
//       addTag(card, tag, note, 'frame', tokenFrameTags);
//     } else if (tag in frameEffectTags) {
//       addTag(card, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
//     } else if (tag in faceImageTagProps) {
//       addTag(card, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
//     } else if (tag in borderColorTags) {
//       addTag(card, tag, note, 'border_color', borderColorTags);
//     } else if (layoutTags.includes(tag as layoutTagType)) {
//       addLayoutTag(card, tag, note);
//     } else if (tag == 'foil') {
//       addTag(card, tag, note, 'finish', HCFinish.Foil);
//     } else if (note) {
//       if (tag in frontImageTagProps) {
//         addTag(card, tag, note, frontImageTagProps[tag] as rootPropType, undefined, {
//           useUrl: true,
//           useRootOnly: true,
//         });
//         if (tag == 'draft-image') {
//           addPropToRoot(card, 'draft_image_status', HCImageStatus.HighRes);
//         }
//       } else if (tag == 'back-image') {
//         addTag(card, tag, note, 'image', undefined, { useUrl: true, defaultToBack: true });
//       } else if (tag == 'flavor-name') {
//         addTag(card, tag, note, 'flavor_name', undefined, { dontAddNote: true });
//       } else if (
//         tag.toLowerCase() == card.set?.toLowerCase() ||
//         (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
//           (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
//       ) {
//         addTag(card, tag, undefined, 'collector_number', note);
//       } else {
//         addTag(card, tag, note, undefined, undefined, { useRootOnly: true });
//       }
//     }
//     return tag;
//   });

//   card.tags = Array.from(new Set(card.tags));
//   if ('card_faces' in card) {
//     card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//   } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
// };

// export const setTags = (card: HCCard.Any, newBase: string[], noForceDerivedProps?: boolean) => {
//   const base: string[] = card.base_tags ?? [];
//   const fixedNew = newBase.length == 1 && newBase[0] == '' ? [] : newBase;
//   const { mergedTags, shouldDeriveProps } = getMergedTags(base, fixedNew);
//   if (mergedTags.length) {
//     addPropToRoot(card, 'base_tags', mergedTags);
//   } else {
//     deletePropFromRoot(card, 'base_tags');
//   }
//   setPropsFromTags(card, mergedTags, shouldDeriveProps || !noForceDerivedProps);
// };

// export const handleTags = (card: HCCard.Any, tagState: tagState, setBaseTags?: boolean, deriveInvisibleProps?:boolean) => {
//   if (card.kind == 'scryfall') return;
//   setTagPropsToDefault(card);
//   const shouldDeriveProps:'all'|'visible'|false|undefined = deriveInvisibleProps ?
//   if (!tags.length || (tags.length == 1 && tags[0] == '')) {
//     deletePropFromRoot(card, 'tags');
//     deletePropFromRoot(card, 'tag_notes');
//     deletePropFromRoot(card, 'tag_state');
//     if ('card_faces' in card) {
//       card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//     } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
//     return;
//   }
//   if (setBaseTags || !card.tag_state) {
//     addPropToRoot(card, 'tag_state', {});
//   }
//   card.tags = tags.map(fullTag => {
//     const { tag, note } = splitFullTag(fullTag);
//     if (setBaseTags) {
//       pushPropToRecord(card.tag_state!, 'base_tags', tag, fullTag);
//     }
//     if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
//       addTag(card, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
//     } else if (tag in frameTags) {
//       addTag(card, tag, note, 'frame', frameTags);
//     } else if (tag in cardFrameTags && card.kind != 'token') {
//       addTag(card, tag, note, 'frame', cardFrameTags);
//     } else if (tag in tokenFrameTags && card.kind == 'token') {
//       addTag(card, tag, note, 'frame', tokenFrameTags);
//     } else if (tag in frameEffectTags) {
//       addTag(card, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
//     } else if (tag in faceImageTagProps) {
//       addTag(card, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
//     } else if (tag in borderColorTags) {
//       addTag(card, tag, note, 'border_color', borderColorTags);
//     } else if (layoutTags.includes(tag as layoutTagType)) {
//       addLayoutTag(card, tag, note);
//     } else if (tag == 'foil') {
//       addTag(card, tag, note, 'finish', HCFinish.Foil);
//     } else if (note) {
//       if (tag in frontImageTagProps) {
//         addTag(card, tag, note, frontImageTagProps[tag] as rootPropType, undefined, {
//           useUrl: true,
//           useRootOnly: true,
//         });
//         if (tag == 'draft-image') {
//           addPropToRoot(card, 'draft_image_status', HCImageStatus.HighRes);
//         }
//       } else if (tag == 'back-image') {
//         addTag(card, tag, note, 'image', undefined, { useUrl: true, defaultToBack: true });
//       } else if (tag == 'flavor-name') {
//         addTag(card, tag, note, 'flavor_name', undefined, { dontAddNote: true });
//       } else if (
//         tag.toLowerCase() == card.set?.toLowerCase() ||
//         (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
//           (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
//       ) {
//         addTag(card, tag, undefined, 'collector_number', note);
//       } else {
//         addTag(card, tag, note, undefined, undefined, { useRootOnly: true });
//       }
//     }
//     return tag;
//   });

//   card.tags = Array.from(new Set(card.tags));
//   if ('card_faces' in card) {
//     card.card_faces.forEach((face, i) => setFacePropsFromTypes(face, layoutIsDefault(card, i)));
//   } else setFacePropsFromTypes(card, layoutIsDefault(card), card.kind == 'token');
// };

// export const addTagContributor = (card: HCCard.Any, tag: string) => {
//   if (!card.tag_state) {
//     addPropToRoot(card, 'tag_state', {});
//   }
//   pushPropToRecord(card.tag_state!, 'added', splitFullTag(tag).tag, tag);
//   mergeTags(card);
// };
// export const deleteTagContributor = (card: HCCard.Any, tag: string) => {
//   const tagToDelete = splitFullTag(tag).tag;
//   if (card.tag_state?.added?.[tagToDelete]) {
//     delete card.tag_state.added[tagToDelete];
//   } else if (
//     card.tag_state?.base_tags?.[tagToDelete] &&
//     !card.tag_state.deleted?.includes(tagToDelete)
//   ) {
//     pushProp(card.tag_state, 'deleted', tagToDelete);
//   } else {
//     return;
//   }
//   mergeTags(card);
// };

// export const tagRecordsEqual = (record1?: tagRecord, record2?: tagRecord): boolean => {
//   if (!record1 || !record2) {
//     return !record1 == !record2;
//   }
//   if (!doubleListEquals(Object.keys(record1), Object.keys(record2))) {
//     return false;
//   }
//   Object.keys(record1).forEach(tag => {
//     if (!doubleListEquals(record1[tag], record2[tag])) {
//       return false;
//     }
//   });
//   return true;
// };

// /**
//  * Returns true if the tags changed and false otherwise
//  */
// export const updateTags = (card: HCCard.Any, state: tagState): boolean => {
//   let shouldMerge = false;
//   if (!tagRecordsEqual(card.tag_state?.base_tags, state.base_tags)) {
//     shouldMerge = true;
//     if (!state.base_tags) {
//       delete card.tag_state?.base_tags;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.base_tags = state.base_tags;
//     }
//   }
//   if (!tagRecordsEqual(card.tag_state?.added, state.added)) {
//     shouldMerge = true;
//     if (!state.added) {
//       delete card.tag_state?.added;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.added = state.added;
//     }
//   }
//   if (
//     !card.tag_state?.deleted != !state.deleted ||
//     (card.tag_state?.deleted &&
//       state.deleted &&
//       !doubleListEquals(card.tag_state.deleted, state.deleted))
//   ) {
//     shouldMerge = true;
//     if (!state.deleted) {
//       delete card.tag_state?.deleted;
//     } else {
//       if (!card.tag_state) {
//         addPropToRoot(card, 'tag_state', {});
//       }
//       card.tag_state!.deleted = state.deleted;
//     }
//   }
//   if (shouldMerge) {
//     mergeTags(card);
//   }
//   return shouldMerge;
// };
