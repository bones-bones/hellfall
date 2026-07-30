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
  allPropType,
  anyElementValueType,
  anyPropType,
  faceElementValueType,
  facePropType,
  rootElementValueType,
  rootPropType,
} from '@hellfall/shared/types';
import { getDefaultFaceValue, getDefaultKindLayout, getDefaultRootValue } from './defaults';
import { getSet } from '../setHandling';
import {
  anyChange,
  createFaceChange,
  createRootChange,
  faceChangeablePropType,
  rootChange,
  rootChangeablePropType,
  tagChange,
  sortChanges,
} from './changeTypes';
import { isValidV4UUID } from '../textHandling';
import { isInteger } from '../numHandling';
import { ensureArray, pushProp } from '../listHandling';
import { baseInvariantMap } from '../cardHandling';

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
  'sand-frame': HCFrameEffect.Sand,
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
  'print-image': 'print_image',
  'rotated-print-image': 'rotated_print_image',
  'still-print-image': 'still_print_image',
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

/**
 * Splits a full tag into a tag and its note
 * @param fullTag full tag to split
 */
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
  if (tagIsSetTag(tag)) {
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
  // 'dungeon',
  // 'draftpartner',
  'cube',
] as const;
export type layoutTagType = (typeof layoutTags)[number];

// use this for token faces in combination with cardMultiLayoutToFaceLayout
const multiLayoutTags = {
  // meld: HCLayout.MeldPart,
  'draftpartner-faces': HCLayout.DraftPartner,
  'reminder-on-back': HCLayout.ReminderOnBack,
  'reminder-card': HCLayout.MultiReminder,
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
  // draftpartner: HCImageStatus.DraftPartner,
  'reminder-on-back': HCImageStatus.Reminder,
  'reminder-card': HCImageStatus.Reminder,
  reminder: HCImageStatus.Reminder,
  'dungeon-in-inset': HCImageStatus.Dungeon,
  'dungeon-on-back': HCImageStatus.Dungeon,
  // dungeon: HCImageStatus.Dungeon,
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
  // draftpartner: HCLayout.DraftPartner,
  reminder: HCLayout.Reminder,
  'reminder-card': HCLayout.Reminder,
  token: HCLayout.Token,
  // dungeon: HCLayout.Dungeon,
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
  'weird-leveler': HCLayout.Leveler,
  leveler: HCLayout.Leveler,
  'weird-1-mana-levelers-cycle': HCLayout.Leveler,
  'mutate-layout': HCLayout.Mutate,
  noncard: HCLayout.Misc,
  prototype: HCLayout.Prototype,
};

const multiToFaceLayoutTags: Partial<
  Record<keyof typeof multiLayoutTags, HCLayoutGroup.FaceLayoutType>
> = {
  'draftpartner-faces': HCLayout.DraftPartner,
  'reminder-on-back': HCLayout.Reminder,
  'reminder-card': HCLayout.Reminder,
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

const tagCanHaveFaces = (tag: string, card?: HCCard.Any): boolean => {
  if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
    return true;
  } else if (tag in frameTags) {
    return true;
  } else if (tag in cardFrameTags && card && card.kind != 'token') {
    return true;
  } else if (tag in tokenFrameTags && card && card.kind == 'token') {
    return true;
  } else if (tag in anyFrameEffectTags) {
    return true;
  } else if (tag in faceFrameEffectTags) {
    return true;
  } else if (tag in faceImageTagProps) {
    return true;
  } else if (tag in borderColorTags) {
    return true;
  } else if (layoutTags.includes(tag as layoutTagType)) {
    return true;
  } else if (tag == 'foil') {
    return true;
  } else if (tag == 'flavor-name') {
    return true;
  }
  return false;
};
const tagDefaultsToBack = (tag: string): boolean => {
  if (tag == 'back-image') {
    return true;
  }
  return false;
};
const isDriveURLString = (text: string): boolean => /^[A-Za-z0-9_-]{33}$/.test(text);
const tagCanUseURL = (tag: string): boolean => {
  if (tag in faceImageTagProps) {
    return true;
  } else if (tag in frontImageTagProps) {
    return true;
  } else if (tag == 'back-image') {
    return true;
  }
  return false;
};
const tagCanUseUUID = (tag: string): boolean => {
  if (tag == 'card-in-scryfall') {
    return true;
  } else if (tag == 'has-other-prints') {
    return true;
  }
  return false;
};
const tagIsSetTag = (tag: string, card?: HCCard.Any): boolean => {
  if (card ? tag.toUpperCase() == card.set : getSet(tag.toUpperCase() as SetCode)) {
    return true;
  }
  if (
    ['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
    (!card || card.set.startsWith('HLC') || card.set.startsWith('HCV.1'))
  ) {
    return true;
  }
  if (tag == 'scl' && (!card || card.set?.slice(0, 3) == 'SCL')) {
    return true;
  }
  return false;
};
const tagUsesNoteAsValue = (tag: string, card?: HCCard.Any): boolean => {
  if (tag == 'flavor-name') {
    return true;
  } else if (tagIsSetTag(tag, card)) {
    return true;
  } else if (flagTags.includes(tag)) {
    return true;
  }
  return false;
};
/**
 * The return object from splitting a tag
 */
type splitTagReturn = {
  /**
   * The tag to return
   */
  tag: string;
  /**
   * The note to add to/remove from `tag_notes`
   */
  note?: string;
  /**
   * The value to use for the tag's effects (used for `flavor-name`, set tags, flag tags)
   */
  value?: string;
  /**
   * The value to use for the tag's keywords (used for keywords and tags that are also keywords)
   */
  keywords?: string[];
  /**
   * The face to apply the tag's effects to
   */
  face?: number;
  /**
   * The uuid to use for the tag's effects
   */
  uuid?: string;
  /**
   * The url to use for the tag's effects
   */
  url?: string;
};

const subKeywords: Record<string, string | string[]> = {
  'commander ninjutsu': 'ninjutsu',
  gravestorm: 'storm',
  multikicker: 'kicker',
  'legendary landwalk': 'landwalk',
  'nonbasic landwalk': 'landwalk',
  megamorph: 'morph',
  plainswalk: 'landwalk',
  islandwalk: 'landwalk',
  swampwalk: 'landwalk',
  mountainwalk: 'landwalk',
  forestwalk: 'landwalk',
  desertwalk: 'landwalk',
  'double agenda': 'hidden agenda',
  'partner with': 'partner',
  'hexproof from': 'hexproof',
  plainscycling: 'landcycling',
  islandscycling: 'landcycling',
  swampcycling: 'landcycling',
  mountaincycling: 'landcycling',
  forestcycling: 'landcycling',
  nebulacycling: 'landcycling',
  'basic landcycling': 'landcycling',
  typecycling: 'cycling',
  wizardcycling: 'typecycling',
  slivercycling: 'typecycling',
  landcycling: 'cycling',
  'manifest dread': 'manifest',
  extroll: 'extort',
  'fast as fuck': 'split second',
  unbearable: 'changeling',
  stackicker: 'kicker',
  multistackicker: ['stackicker', 'multikicker'],
  means: 'transform',
  spellmorph: 'morph',
  override: 'cleave',
  gx: 'exhaust',
  'devotion to dreadmaw': 'devotion',
  inklink: 'lifelink',
  'typeline menace': 'menace',
  denimwalk: 'walk',
  lifesteal: 'lifelink',
  carsist: 'persist',
  'bands with others': 'banding',
  'bad templatingwalk': 'walk',
  picklelink: 'link',
  foodlink: 'link',
  accelerator: 'annihilator',
  superflashback: 'flashback',
  drive: 'delve',
  woah: 'fear',
  'drive-to-work': 'suspend',
  goldlink: 'link',
  'dead weapon': 'living weapon',
  homiecycling: 'cycling',
  crewshido: ['crew', 'bushido'],
  'gruul prowess': 'prowess',
  'colossal dreadmorph': 'morph',
  'planeswalker monstrosity': 'monstrosity',
  muderlink: 'link',
  'land bestow': 'bestow',
  damagewalk: 'walk',
  'keyword scavenge': 'scavenge',
  cardcycling: 'cycling',
  fungmass: 'amass',
  'defend rear end': 'undying',
  underload: 'overload',
  flyingwalk: 'walk',
  millwalk: 'walk',
  manafest: 'manifest',
  'counter delve': 'delve',
  myrsist: 'persist',
  outkast: 'outlast',
  walkwalk: 'walk',
  'keyword graft': 'graft',
  servolink: 'link',
  ratlink: 'link',
  shardcade: 'cascade',
  gravegraft: 'graft',
  'surprise suspend': 'suspend',
  overmode: ['overload', 'fuse'],
  revoke: 'evoke',
  overspend: ['suspend', 'overload'],
  fertilize: 'proliferate',
  crample: 'trample',
  casketscade: 'cascade',
  upload: 'overload',
  'flash-fuse': ['flashback', 'fuse'],
  moonwalk: 'walk',
  turtlesplice: 'splice',
  screwtate: 'mutate',
  'half prowl': 'prowl',
  cluelink: 'link',
  murderlink: 'link',
  science: 'miracle',
  'mad sus': ['madness', 'suspend'],
  'zone-verload gx': ['overload', 'gx'],
  subtypecycling: 'typecycling',
  squirrellink: 'link',
  asscade: 'cascade',
  'counter scavenge': 'scavenge',
  dirtwalk: 'walk',
  asleepen: 'awaken',
  'return to monke': 'dash',
  musclecycling: 'cycling',
  gatefall: 'landfall',
  graphed: 'graft',
  slowback: ['flashback', 'suspend'],
  dive: 'delve',
  'mega domain': 'domain',
  internalize: 'eternalize',
  crowtouch: 'touch',
  sideboardjutsu: 'ninjutsu',
  unicycling: 'cycling',
  multiflicker: 'multikicker',
  hyperlink: ['surveil', 'link'],
  izzetcrew: 'crew',
  scrylink: ['scry', 'link'],
  'religious delirium': 'delirium',
  sidekick: 'kicker',
  bearcycling: 'typecycling',
  'big extort': 'extort',
  'big afterlife': 'afterlife',
  'big haunt': 'haunt',
  sexproof: 'hexproof',
  shardlink: 'link',
  'reverse screwtate': 'screwtate',
  blend: 'mutate',
  blendifier: 'annihilator',
  'living fortification': 'living weapon',
  'cleave land': 'cleave',
  amasslink: ['amass', 'link'],
  detainlink: ['detain', 'link'],
  cascadelink: ['cascade', 'link'],
  voidtouch: 'touch',
  'overclock cipher': 'cipher',
  foodtouch: 'touch',
  votekicker: 'kicker',
  remutate: ['mutate', 'reconfigure'],
  devourlink: ['devour', 'link'],
  '2ble strike': 'double strike',
  'untapped landwalk': 'landwalk',
  yeehaw: 'job select',
  'pre-errata companion': 'companion',
  cashback: 'flashback',
  rainbowcycling: 'cycling',
  'double cleave': 'cleave',
  wardtection: ['ward', 'protection'],
  fishlink: 'link',
  'bestow artifact': 'bestow',
  'mana-value-5-sorcery cycling': 'cycling',
  'cascade up': 'cascade',
  bicycling: 'cycling',
  'choose a background': 'partner',
  lore: 'partner',
  'third wheel': 'partner',
  discoverlink: ['discover', 'link'],
  'choose a signature spell': 'partner',
  'do man': 'domain',
  landcasacade: 'cascade',
  treasuretouch: 'touch',
  treasurewalk: 'walk',
  treasurelink: 'link',
  'flash fuse': ['flash', 'fuse'],
  cripxtort: 'extort',
  explort: 'explore',
  'commander augment': 'augment',
  'commander plot': 'plot',
  skelefest: 'manifest',
  'collect evidence': 'collect',
  antnihilator: 'annihilator',
  'colossal dreadmanifest': 'manifest',
  flush: 'flash',
  construction: 'suspend',
  'maternal death': 'offspring',
  convoken: 'convoke',
  rummagelink: 'link',
  sleeptouch: 'touch',
  naplink: 'link',
  sporecounterlink: 'link',
  squadspring: ['squad', 'offspring'],
  "urza'scycling": 'landcycling',
  pipverge: 'converge',
  'commander suspend': 'suspend',
  'annihilate voters': 'annihilator',
  milllink: 'link',
  cheesetouch: 'touch',
  'manifest dreads': 'manifest dread',
  'manifest destiny': 'manifest',
  crewquip: ['crew', 'equip'],
  'split-ish second': 'split second',
  escapejutsu: ['escape', 'ninjutsu'],
  'firstest strike': 'first strike',
  'menace to society': 'menace',
  junklink: 'link',
  'drink annihilator': 'annihilator',
  'trenchcoat armor': 'umbra armor',
  orbiting: 'flying',
  ponderlink: 'link',
  stackscade: 'cascade',
  'start your fucking engines': 'start your engines',
  '2quip': 'equip',
  fliptouch: 'touch',
  'draft level up': 'level up',
  scrample: ['conjure', 'trample'],
  helltouch: 'touch',
  thrabenicate: ['investigate', 'conjure'],
  'started engine': 'start your engines',
  'manifest dreadmaw': 'manifest dread',
  sunlink: 'link',
};

const keywordTags = [
  'fuse',
  'enchant',
  'flip',
  'transform',
  'aftermath',
  'meld',
  'draftpartner',
  'grunch',
];
const tagsToKeywords: Record<string, string | string[]> = {
  'devoid-frame': 'devoid',
  'means-end': ['means', 'end'],
  'gx-ability': 'gx',
  cube: 'rotate',
  'mutate-layout': 'mutate',
  'partner-mechanic': 'partner',
  'unprinted-partner': 'partner',
  spidertouch: 'touch',
  spiderlink: 'link',
  connivelink: ['connive', 'link'],
  'planeswalker-deathtouch': 'deathtouch',
};

export const fillSubKeywords = (keywords: string[]) => {
  for (const keyword in keywords) {
    if (keyword in subKeywords) {
      ensureArray(subKeywords[keyword]).forEach(sub => {
        if (!keywords.includes(sub)) {
          keywords.push(sub);
        }
      });
    }
  }
};
/**
 * Splits a full tag into a tag and its components
 * @param fullTag full tag to split
 * @param card the card that the tag will be applied to; only really necessary if the tag is a uuid tag
 * and is going off of the card name or if the tag note includes an element that specifies the face
 * @param alsoAddingFaces whether this tag is being applied alongside changes that convert the card
 * from a single-faced card to a multifaced card
 * @see {@linkcode splitTagReturn} for the return type documentation
 */
export const splitTagComponents = (
  full_tag: string,
  card?: HCCard.Any,
  alsoAddingFaces?: boolean
): splitTagReturn => {
  const splitTag: splitTagReturn = splitFullTag(full_tag);
  if (keywordTags.includes(splitTag.tag)) {
    splitTag.keywords = [splitTag.tag];
    fillSubKeywords(splitTag.keywords);
  }
  if (splitTag.tag in tagsToKeywords) {
    splitTag.keywords = ensureArray(tagsToKeywords[splitTag.tag]);
    fillSubKeywords(splitTag.keywords);
  }
  if (!splitTag.note) {
    if (tagCanUseUUID(splitTag.tag)) {
      const id = baseInvariantMap.getOracleID(card?.name ?? '');
      if (id) {
        splitTag.uuid = id;
      }
    }
    return splitTag;
  }
  const splitNote = splitTag.note.split('|');
  for (let i = splitNote.length - 1; i >= 0; i--) {
    if (splitTag.tag == 'keyword') {
      const [keyword] = splitNote.splice(i, 1);
      if (!splitTag.keywords?.includes(keyword)) {
        pushProp(splitTag, 'keywords', keyword.toLowerCase());
      }
      continue;
    }
    if (tagCanUseUUID(splitTag.tag) && !splitTag.uuid) {
      if (isValidV4UUID(splitNote[i])) {
        [splitTag.uuid] = splitNote.splice(i, 1);
        continue;
      }
      if (baseInvariantMap.hasName(splitNote[i])) {
        const [name] = splitNote.splice(i, 1);
        splitTag.uuid = baseInvariantMap.getOracleID(name);
        continue;
      }
    }
    if (
      tagCanUseURL(splitTag.tag) &&
      // (splitNote[i].startsWith('http') || isDriveURLString(splitNote[i])) &&
      !splitTag.url
    ) {
      [splitTag.url] = splitNote.splice(i, 1);
      if (isDriveURLString(splitTag.url)) {
        splitTag.url = `https://lh3.googleusercontent.com/d/${splitTag.url}`;
      } else if (!splitTag.url.startsWith('https://')) {
        splitTag.url = `https://storage.googleapis.com/hellscube-images/${splitTag.url}`;
      }
      if (tagDefaultsToBack(splitTag.tag) && ((card && 'card_faces' in card) || alsoAddingFaces)) {
        splitTag.face = 1;
      }
      continue;
    }
    if (
      tagCanHaveFaces(splitTag.tag, card) &&
      ((card && 'card_faces' in card) || alsoAddingFaces) &&
      isInteger(splitNote[i]) &&
      !isDriveURLString(splitNote[i]) &&
      !splitTag.face
    ) {
      const [num] = splitNote.splice(i, 1);
      splitTag.face = parseInt(num);
      continue;
    }
    if (
      tagUsesNoteAsValue(splitTag.tag, card) &&
      !splitTag.value &&
      !(flagTags.includes(splitTag.tag) && !isInteger(splitNote[i]))
    ) {
      [splitTag.value] = splitNote.splice(i, 1);
      continue;
    }
  }
  if (splitTag.tag == 'keyword' && splitTag.keywords) {
    fillSubKeywords(splitTag.keywords);
  }
  if (splitNote.length) {
    splitTag.note = splitNote.join('|');
  } else if (splitTag.note) {
    delete splitTag.note;
  }
  return splitTag;
};

/**
 * The input for a tag change
 * @template K The type of the prop to modify, if any
 */
type TagChangeInput<K extends anyPropType> = {
  /**
   * The card that the tag change will be applied to
   */
  card: HCCard.Any;
  /**
   * The type of change. Add is used for adding a new tag or updating an existing one;
   * delete is for deleting an existing tag
   */
  change_type: 'add' | 'delete';
  /**
   * The full tag to change.
   */
  full_tag: string;
  /**
   * The split tag to change. See {@linkcode splitTagReturn} for documentation
   */
  splitTag: splitTagReturn;
  /**
   * The prop to change, if any
   */
  prop?: K;
  /**
   * The value to change, if any.
   */
  value?: Record<string, anyElementValueType<K>> | anyElementValueType<K>;
};

/**
 * Adds a prop with a given value to a {@linkcode TagChangeInput}
 * @template K The type of the prop to add
 * @param input the input object to add the prop to
 * @param prop the prop to add
 * @param value the value to add, if any
 */
const addPropToInput = <K extends anyPropType>(
  input: TagChangeInput<any>,
  prop: K,
  value?: Record<string, anyElementValueType<K>> | anyElementValueType<K>
) => {
  (input as any).prop = prop;
  if (value != undefined) {
    (input as any).value = value;
  }
};

/**
 * Gets the changes for a tag that applies to a card face
 * @template K The type of the prop to add
 * @param input the {@linkcode TagChangeInput} to use
 * @param alsoAddingFaces dummy
 */
const changesForFaceTag = <K extends facePropType>(
  input: TagChangeInput<K>,
  alsoAddingFaces?: boolean
): anyChange[] => {
  const { card, change_type, full_tag, splitTag, prop, value } = input;
  const changes: anyChange[] = [];
  const tag_change: tagChange = {
    location: 'tag',
    change_type,
    full_tag,
  };
  if (splitTag.tag != full_tag) {
    tag_change.tag = splitTag.tag;
  }
  if (splitTag.note) {
    tag_change.note = splitTag.note;
  }
  if (splitTag.keywords) {
    splitTag.keywords.forEach(keyword => {
      const change = createRootChange(change_type, 'keywords', keyword);
      changes.push(change);
    });
  }
  const defaultValue = getDefaultFaceValue(card, prop);
  const getValue = () => {
    if (!prop) return;
    if (defaultValue && change_type == 'delete') {
      return defaultValue;
    } else if (typeof value == 'object' && value != null && !Array.isArray(value)) {
      return (value as Record<string, anyElementValueType<K>>)[splitTag.tag];
    } else {
      return value;
    }
  };
  const resolvedValue = getValue() as faceElementValueType<K> | undefined;
  if (!resolvedValue) {
    changes.push(tag_change);
    return changes.sort(sortChanges);
  }
  const change = createFaceChange(
    change_type,
    prop as faceChangeablePropType<typeof change_type>,
    resolvedValue,
    splitTag.face
  );
  if (defaultValue && change_type == 'delete') {
    change.change_type = 'add';
  }
  if (change.value != undefined) {
    changes.push(change);
  }
  changes.push(tag_change);
  return changes.sort(sortChanges);
};

/**
 * Gets the changes for a tag that applies to a card root
 * @template K The type of the prop to add
 * @param input the {@linkcode TagChangeInput} to use
 * @param alsoAddingFaces dummy
 */
const changesForRootTag = <K extends rootPropType>(
  input: TagChangeInput<K>,
  alsoAddingFaces?: boolean
): anyChange[] => {
  const { card, change_type, full_tag, splitTag, prop, value } = input;
  const changes: anyChange[] = [];
  const tag_change: tagChange = {
    location: 'tag',
    change_type,
    full_tag,
  };
  if (splitTag.tag != full_tag) {
    tag_change.tag = splitTag.tag;
  }
  if (splitTag.note) {
    tag_change.note = splitTag.note;
  }
  if (splitTag.keywords) {
    splitTag.keywords.forEach(keyword => {
      const change = createRootChange(change_type, 'keywords', keyword);
      changes.push(change);
    });
  }
  const defaultValue = getDefaultRootValue(card, prop);
  const getValue = () => {
    if (!prop) return;
    if (defaultValue && change_type == 'delete') {
      return defaultValue;
    } else if (typeof value == 'object' && value != null && !Array.isArray(value)) {
      return (value as Record<string, anyElementValueType<K>>)[splitTag.tag];
    } else {
      return value;
    }
  };
  const resolvedValue = getValue() as
    | rootElementValueType<rootChangeablePropType<typeof change_type>>
    | undefined;
  if (!resolvedValue) {
    changes.push(tag_change);
    return changes.sort(sortChanges);
  }
  const change = createRootChange(
    change_type,
    prop as rootChangeablePropType<typeof change_type>,
    resolvedValue
  );
  if (defaultValue && change_type == 'delete') {
    change.change_type = 'add';
  }
  if (change.value != undefined) {
    changes.push(change);
  }
  changes.push(tag_change);
  return changes.sort(sortChanges);
};

/**
 * Gets the changes for a tag that applies to any part of a card
 * @template K The type of the prop to add
 * @param input the {@linkcode TagChangeInput} to use
 * @param alsoAddingFaces whether this tag is being applied alongside changes
 * that convert the card from a single-faced card to a multifaced card
 */
const changesForAnyTag = <K extends allPropType>(
  input: TagChangeInput<K>,
  alsoAddingFaces?: boolean
): anyChange[] => {
  const { card, change_type, splitTag, prop } = input;
  const layoutChanges = (prop: 'layout'): anyChange[] => {
    if (
      splitTag.tag in multiLayoutTags &&
      ('card_faces' in card || alsoAddingFaces) &&
      splitTag.face == undefined
    ) {
      if (card.kind == 'token' && splitTag.tag != 'reminder-card') {
        input.prop = undefined;
        input.value = undefined;
      } else {
        (input as any).value = multiLayoutTags;
      }
      const changes: anyChange[] = changesForRootTag(input);
      if (splitTag.tag in multiToFaceLayoutTags && 'card_faces' in card) {
        card.card_faces.forEach((face, i) => {
          if (
            (i ||
              !frontIgnoreMultiLayoutTags.includes(splitTag.tag as keyof typeof multiLayoutTags)) &&
            getDefaultKindLayout(card, i) == face.layout
          ) {
            changes.push(
              createFaceChange(
                change_type,
                prop,
                multiToFaceLayoutTags[splitTag.tag as keyof typeof multiLayoutTags],
                i
              )
            );
          }
        });
      }
      return changes.sort(sortChanges);
    }
    if (
      splitTag.tag in faceLayoutTags &&
      !(('card_faces' in card || alsoAddingFaces) && splitTag.face == undefined)
    ) {
      (input as any).value = faceLayoutTags;
      return splitTag.face == undefined ? changesForRootTag(input) : changesForFaceTag(input);
    }
    if (splitTag.tag == 'meld') {
      (input as any).value = card.kind == 'token' ? HCLayout.MeldResult : HCLayout.MeldPart;
      const changes = changesForRootTag(input);
      if ('card_faces' in card) {
        card.card_faces.forEach((face, i) => {
          changes.push(
            createFaceChange(change_type, prop, i ? HCLayout.MeldResult : HCLayout.MeldPart, i)
          );
        });
      }
      return changes.sort(sortChanges);
    }
    input.prop = undefined;
    input.value = undefined;
    return changesForRootTag(input);
  };
  if (prop == 'layout') {
    const changes = layoutChanges(prop);
    const status = layoutTagToImageStatus[splitTag.tag as layoutTagType];
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
  return splitTag.face == undefined ? changesForRootTag(input) : changesForFaceTag(input);
};

const flagTags = [
  'missing-legend-frame',
  'legend-frame',
  'missing-snow-frame',
  'missing-lesson-frame',
  'missing-vehicle-frame',
  'missing-transform-frame',
  'missing-mdfc-frame',
  'missing-cube-frame',
  'missing-specialize-frame',
  'unnecessary-color-indicator',
  'generic',
  'no-compress',
  'irregular-mana-value',
];

/**
 * Checks if a card has a flag tag
 * @param card card to check
 * @param flag flag tag to check
 * @param i index to check, if any
 */
export const baseIncludesFlag = (card: HCCard.Any, flag: string, i?: number): boolean | undefined =>
  card.base_tags?.some(full_tag => {
    const { tag, value } = splitTagComponents(full_tag);
    if (tag != flag) {
      return false;
    }
    if (value == undefined || parseInt(value) == i) {
      return true;
    }
    return false;
  });

/**
 * Gets the input and the
 * @param card card to get the input for
 * @param change_type whether to add or delete the tag
 * @param full_tag the full tag to use
 * @param alsoAddingFaces whether this tag is being applied alongside changes
 * that convert the card from a single-faced card to a multifaced card
 * @returns the {@linkcode TagChangeInput} to use and the location to apply the input to
 */
const inputForTag = (
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string,
  alsoAddingFaces?: boolean
): { input: TagChangeInput<any>; location: 'face' | 'root' | 'any' } => {
  const splitTag = splitTagComponents(full_tag, card, alsoAddingFaces);
  const input: TagChangeInput<any> = {
    card,
    change_type,
    full_tag,
    splitTag,
  };
  const tag = splitTag.tag;
  // TODO: remove value resolution (i.e. `resolveValue` functions) if possible
  let location: 'face' | 'root' | 'any' = 'any';
  if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
    addPropToInput(input, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
    location = 'face';
  } else if (tag in frameTags) {
    addPropToInput(input, 'frame', frameTags);
  } else if (tag in cardFrameTags && card.kind != 'token') {
    addPropToInput(input, 'frame', cardFrameTags);
  } else if (tag in tokenFrameTags && card.kind == 'token') {
    addPropToInput(input, 'frame', tokenFrameTags);
  } else if (tag in anyFrameEffectTags) {
    addPropToInput(input, 'frame_effects', anyFrameEffectTags);
  } else if (tag in faceFrameEffectTags) {
    addPropToInput(input, 'frame_effects', faceFrameEffectTags);
    location = 'face';
  } else if (tag in faceImageTagProps) {
    addPropToInput(input, faceImageTagProps[tag], splitTag.url);
  } else if (tag in frontImageTagProps) {
    addPropToInput(input, frontImageTagProps[tag], splitTag.url);
    location = 'root';
  } else if (tag == 'back-image') {
    addPropToInput(input, 'image', splitTag.url);
    location = 'face';
  } else if (tag in borderColorTags) {
    addPropToInput(input, 'border_color', borderColorTags);
  } else if (layoutTags.includes(tag as layoutTagType)) {
    addPropToInput(input, 'layout');
  } else if (tag == 'foil') {
    addPropToInput(input, 'finish', HCFinish.Foil);
  } else if (tag == 'card-in-scryfall' || tag == 'has-other-prints') {
    addPropToInput(input, 'oracle_id', splitTag.uuid);
    location = 'root';
  } else if (tag == 'exact-card-in-scryfall') {
    addPropToInput(input, 'id_is_scryfall', true);
    location = 'root';
  } else if (tag == 'flavor-name') {
    addPropToInput(input, 'flavor_name', splitTag.value);
  } else if (tagIsSetTag(tag, card)) {
    addPropToInput(input, 'collector_number', splitTag.value);
    location = 'root';
  }
  return { input, location };
};

/**
 * Gets the changes to a card for a given change_type and full_tag
 * @param card card to get the changes for
 * @param change_type whether to add or delete the tag
 * @param full_tag the full tag to use
 * @param alsoAddingFaces whether this tag is being applied alongside changes
 * that convert the card from a single-faced card to a multifaced card
 */
export const getChangesFromTag = (
  card: HCCard.Any,
  change_type: 'add' | 'delete',
  full_tag: string,
  alsoAddingFaces?: boolean
): anyChange[] => {
  const { input, location } = inputForTag(card, change_type, full_tag, alsoAddingFaces);
  const changes = (
    location == 'any'
      ? changesForAnyTag
      : location == 'face'
      ? changesForFaceTag
      : changesForRootTag
  )(input, alsoAddingFaces);
  const tag = input.splitTag.tag;

  if (tag == 'print-image') {
    const change: rootChange<typeof change_type, 'print_image_status'> = createRootChange(
      change_type,
      'print_image_status',
      HCImageStatus.HighRes
    );
    changes.push(change);
  } else if (tag == 'card-in-scryfall') {
    const change: rootChange<typeof change_type, 'oracle_id_is_scryfall'> = createRootChange(
      change_type,
      'oracle_id_is_scryfall',
      true
    );
    changes.push(change);
    // } else if (tag == 'exact-card-in-scryfall') {
    //   const change: rootChange<'id_is_scryfall'> = createRootChange(
    //     change_type,
    //     'id_is_scryfall',
    //     true
    //   );
    //   changes.push(change);
  }
  return changes.sort(sortChanges);
  // return changes.filter(change=>changeIsValid(card,change))
};

/**
 * Adds a full tag to a `base_tags` array
 * @param base_tags `base_tags` array to add to
 * @param fullTag full tag to add
 * @returns whether the change could cause props to need to be rederived
 */
export const addTagToBase = (base_tags: string[], fullTag: string): boolean => {
  if (!base_tags.includes(fullTag)) {
    base_tags.push(fullTag);
    return tagChangesVisibleProps(fullTag);
  }
  return false;
};

/**
 * Deletes a full tag from a `base_tags` array
 * @param base_tags `base_tags` array to delete from
 * @param fullTag full tag to delete
 * @returns whether the change could cause props to need to be rederived
 */
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

// export const replaceTagInBase = (
//   base_tags: string[],
//   fullTag: string,
//   noteToReplace?: string
// ): boolean => {
//   const { tag, note } = splitFullTag(fullTag);
//   if (note == 'undefined') {
//   }
// };

/**
 * Gets the full tags added and deleted when changing from an old `base_tags` array to a new one
 * @param oldBase old `base_tags` array
 * @param newBase new `base_tags` array
 * @returns arrays of the tags that were added and that were deleted
 */
export const getBaseDiffs = (
  oldBase: string[],
  newBase: string[]
): { added: string[]; deleted: string[] } => {
  const added: string[] = newBase.filter(tag => !oldBase.includes(tag));
  const deleted: string[] = oldBase.filter(tag => !newBase.includes(tag));
  return { added, deleted };
};
