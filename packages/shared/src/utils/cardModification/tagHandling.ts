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
} from '@hellfall/shared/types';
import {
  allPropType,
  allValueType,
  anyPropType,
  facePropType,
  faceValueType,
  rootPropType,
  rootValueType,
} from '../cardHandling';
import {
  getDefaultFaceValue,
  getDefaultKindLayout,
  getDefaultRootValue,
} from './defaults';
import { getSet } from '../setHandling';
import {
  anyChange,
  changeType,
  createFaceChange,
  createRootChange,
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
  'cube',
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
  cube: HCLayout.Cube,
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
  cube: HCLayout.Cube,
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
  cube: HCLayout.Cube,
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
export const changesForFaceTag = <K extends facePropType>(
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
    return changes.sort(sortChanges);
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
export const changesForRootTag = <K extends rootPropType>(
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
    return changes.sort(sortChanges);
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
export const changesForAnyTag = <K extends allPropType>(
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
      return changesForFaceTag(card, change_type, full_tag, prop, faceLayoutTags, options);
    }
    if (tag in singleLayoutTags && !('card_faces' in card)) {
      return changesForRootTag(card, change_type, full_tag, prop, singleLayoutTags, options);
    }
    if (tag == 'meld') {
      const changes = changesForRootTag(
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
      return changes.sort(sortChanges);
    }
    if (tag == 'reminder-card' && card.kind == 'token') {
      const changes: anyChange[] = changesForRootTag(
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
      return changes.sort(sortChanges);
    }
    if (tag in multiLayoutTags && 'card_faces' in card) {
      const changes: anyChange[] = changesForRootTag(
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
      return changes.sort(sortChanges);
    }
    return changesForRootTag(card, change_type, full_tag);
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
    return changes.sort(sortChanges);
  }
  if (face == undefined) {
    return changesForRootTag(
      card,
      change_type,
      full_tag,
      prop,
      value as Record<string, rootValueType<K>> | rootValueType<K> | undefined,
      options
    );
  }
  return changesForFaceTag(
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
    return changesForFaceTag(
      card,
      change_type,
      full_tag,
      'watermark',
      tag.slice(0, tag.lastIndexOf('-'))
    );
  } else if (tag in frameTags) {
    return changesForAnyTag(card, change_type, full_tag, 'frame', frameTags);
  } else if (tag in cardFrameTags && card.kind != 'token') {
    return changesForAnyTag(card, change_type, full_tag, 'frame', cardFrameTags);
  } else if (tag in tokenFrameTags && card.kind == 'token') {
    return changesForAnyTag(card, change_type, full_tag, 'frame', tokenFrameTags);
  } else if (tag in anyFrameEffectTags) {
    return changesForAnyTag(
      card,
      change_type,
      note ? full_tag : `${full_tag}`,
      'frame_effects',
      anyFrameEffectTags,
      { push: true }
    );
  } else if (tag in faceFrameEffectTags) {
    return changesForFaceTag(
      card,
      change_type,
      note ? full_tag : `${full_tag}`,
      'frame_effects',
      faceFrameEffectTags,
      { push: true }
    );
  } else if (tag in faceImageTagProps) {
    return changesForAnyTag(card, change_type, full_tag, faceImageTagProps[tag], undefined, {
      useUrl: true,
    });
  } else if (tag in borderColorTags) {
    return changesForAnyTag(card, change_type, full_tag, 'border_color', borderColorTags);
  } else if (layoutTags.includes(tag as layoutTagType)) {
    return changesForAnyTag(card, change_type, full_tag, 'layout');
  } else if (tag == 'foil') {
    return changesForAnyTag(card, change_type, full_tag, 'finish', HCFinish.Foil);
  } else if (note) {
    if (tag in frontImageTagProps) {
      const changes = changesForRootTag(
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
      return changes.sort(sortChanges);
    } else if (tag == 'back-image') {
      return changesForFaceTag(card, change_type, full_tag, 'image', undefined, {
        useUrl: true,
        defaultToBack: true,
      });
    } else if (tag == 'flavor-name') {
      return changesForAnyTag(card, change_type, full_tag, 'flavor_name', undefined, {
        dontAddNote: true,
      });
    } else if (
      tag.toLowerCase() == card.set?.toLowerCase() ||
      (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
        (card.set?.slice(0, 3) == 'HLC' || card.set == 'HCV.1'))
    ) {
      return changesForRootTag(card, change_type, full_tag, 'collector_number', undefined, {
        dontAddNote: true,
      });
    }
  }
  return changesForRootTag(card, change_type, full_tag);
  // return changes.filter(change=>changeIsValid(card,change))
};

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