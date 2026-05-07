import { HCCard, HCFrame, HCFrameEffect } from '@hellfall/shared/types';
import {
  cardStringFilter,
  equals,
  getActualOp,
  invertOptionType,
  looseOpType,
  opToDont,
  opToNot,
  opType,
  shareOp,
} from '../types';

const toCardFrame: Record<string, HCFrame | HCFrame[]> = {
  '1993': HCFrame.Original,
  '93': HCFrame.Original,
  "'93": HCFrame.Original,
  original: HCFrame.Original,
  '1997': [HCFrame.Classic, HCFrame.ClassicToken],
  '97': [HCFrame.Classic, HCFrame.ClassicToken],
  "'97": [HCFrame.Classic, HCFrame.ClassicToken],
  classic: [HCFrame.Classic, HCFrame.ClassicToken],
  '1997card': HCFrame.Classic,
  '97card': HCFrame.Classic,
  "'97card": HCFrame.Classic,
  classiccard: HCFrame.Classic,
  '1997token': HCFrame.ClassicToken,
  '97token': HCFrame.ClassicToken,
  "'97token": HCFrame.ClassicToken,
  classictoken: HCFrame.ClassicToken,
  retro: [HCFrame.Original, HCFrame.Classic, HCFrame.ClassicToken],
  old: [HCFrame.Original, HCFrame.Classic, HCFrame.ClassicToken],
  retrocard: [HCFrame.Original, HCFrame.Classic],
  oldcard: [HCFrame.Original, HCFrame.Classic],
  retrotoken: HCFrame.ClassicToken,
  oldtoken: HCFrame.ClassicToken,
  '2003': [HCFrame.Modern, HCFrame.ModernToken],
  '03': [HCFrame.Modern, HCFrame.ModernToken],
  "'03": [HCFrame.Modern, HCFrame.ModernToken],
  modern: [HCFrame.Modern, HCFrame.ModernToken],
  '2003card': HCFrame.Modern,
  '03card': HCFrame.Modern,
  "'03card": HCFrame.Modern,
  moderncard: HCFrame.Modern,
  '2003token': HCFrame.ModernToken,
  '03token': HCFrame.ModernToken,
  "'03token": HCFrame.ModernToken,
  moderntoken: HCFrame.ModernToken,
  '2015': [HCFrame.Stamp, HCFrame.StampToken],
  '15': [HCFrame.Stamp, HCFrame.StampToken],
  "'15": [HCFrame.Stamp, HCFrame.StampToken],
  stamp: [HCFrame.Stamp, HCFrame.StampToken],
  '2015card': HCFrame.Stamp,
  '15card': HCFrame.Stamp,
  "'15card": HCFrame.Stamp,
  stampcard: HCFrame.Stamp,
  '2015token': HCFrame.StampToken,
  '15token': HCFrame.StampToken,
  "'15token": HCFrame.StampToken,
  stamptoken: HCFrame.StampToken,
  '2020': HCFrame.FullToken,
  '20': HCFrame.FullToken,
  "'20": HCFrame.FullToken,
  full: HCFrame.FullToken,
  stamporfull: [HCFrame.Stamp, HCFrame.StampToken, HCFrame.FullToken],
  '2020token': HCFrame.FullToken,
  '20token': HCFrame.FullToken,
  "'20token": HCFrame.FullToken,
  fulltoken: HCFrame.FullToken,
  future: HCFrame.Future,
  playtest: HCFrame.Playtest,
  shattered: HCFrame.Shattered,
  new: [
    HCFrame.Modern,
    HCFrame.Stamp,
    HCFrame.Future,
    HCFrame.Playtest,
    HCFrame.Shattered,
    HCFrame.ModernToken,
    HCFrame.StampToken,
    HCFrame.FullToken,
  ],
  newcard: [HCFrame.Modern, HCFrame.Stamp, HCFrame.Future, HCFrame.Playtest, HCFrame.Shattered],
  newtoken: [HCFrame.ModernToken, HCFrame.StampToken, HCFrame.FullToken],
  card: [
    HCFrame.Original,
    HCFrame.Classic,
    HCFrame.Modern,
    HCFrame.Stamp,
    HCFrame.Future,
    HCFrame.Playtest,
    HCFrame.Shattered,
  ],
  anycard: [
    HCFrame.Original,
    HCFrame.Classic,
    HCFrame.Modern,
    HCFrame.Stamp,
    HCFrame.Future,
    HCFrame.Playtest,
    HCFrame.Shattered,
  ],
  token: [HCFrame.ClassicToken, HCFrame.ModernToken, HCFrame.StampToken, HCFrame.FullToken],
  anytoken: [HCFrame.ClassicToken, HCFrame.ModernToken, HCFrame.StampToken, HCFrame.FullToken],
  magic: [
    HCFrame.Original,
    HCFrame.Classic,
    HCFrame.Modern,
    HCFrame.Stamp,
    HCFrame.Future,
    HCFrame.Playtest,
    HCFrame.Shattered,
    HCFrame.ClassicToken,
    HCFrame.ModernToken,
    HCFrame.StampToken,
    HCFrame.FullToken,
  ],
  jank: HCFrame.Jank,
  notmagic: HCFrame.NotMagic,
  nonmagic: HCFrame.NotMagic,
  pokemon: HCFrame.Pokemon,
  yugioh: HCFrame.Yugioh,
  legendsofruneterra: HCFrame.LegendsOfRuneterra,
  lor: HCFrame.LegendsOfRuneterra,
  runeterra: HCFrame.LegendsOfRuneterra,
  slaythespire: HCFrame.SlayTheSpire,
  inscryption: HCFrame.Inscryption,
  hearthstone: HCFrame.Hearthstone,
  lorcana: HCFrame.Lorcana,
  anynotmagic: [
    HCFrame.NotMagic,
    HCFrame.Pokemon,
    HCFrame.Yugioh,
    HCFrame.LegendsOfRuneterra,
    HCFrame.SlayTheSpire,
    HCFrame.Inscryption,
    HCFrame.Hearthstone,
    HCFrame.Lorcana,
  ],
  anynonmagic: [
    HCFrame.NotMagic,
    HCFrame.Pokemon,
    HCFrame.Yugioh,
    HCFrame.LegendsOfRuneterra,
    HCFrame.SlayTheSpire,
    HCFrame.Inscryption,
    HCFrame.Hearthstone,
    HCFrame.Lorcana,
  ],
  websiteapp: HCFrame.WebsiteApp,
  website: HCFrame.WebsiteApp,
  app: HCFrame.WebsiteApp,
};
const frameNames: [HCFrame[], string][] = [
  [[HCFrame.Original], "the '93 Original"],
  [[HCFrame.Classic, HCFrame.ClassicToken], "the '97 Classic"],
  [[HCFrame.Classic], "the '97 Classic card"],
  [[HCFrame.ClassicToken], "the '97 Classic token"],
  [[HCFrame.Original, HCFrame.Classic, HCFrame.ClassicToken], "the '93/97"],
  [[HCFrame.Original, HCFrame.Classic], "the '93/97 card"],
  [[HCFrame.Modern, HCFrame.ModernToken], 'the Modern'],
  [[HCFrame.Modern], 'the Modern card'],
  [[HCFrame.ModernToken], 'the Modern token'],
  [[HCFrame.Stamp, HCFrame.StampToken], 'the 2015 Stamp'],
  [[HCFrame.Stamp], 'the 2015 Stamp card'],
  [[HCFrame.StampToken], 'the 2015 Stamp token'],
  [[HCFrame.Stamp, HCFrame.StampToken, HCFrame.FullToken], 'the 2015 Stamp or 2020 token'],
  [[HCFrame.FullToken], 'the 2020 token'],
  [[HCFrame.Future], 'the Future'],
  [[HCFrame.Playtest], 'the Platest'],
  [[HCFrame.Shattered], 'a shattered'],
  [
    [
      HCFrame.Modern,
      HCFrame.Stamp,
      HCFrame.Future,
      HCFrame.Playtest,
      HCFrame.Shattered,
      HCFrame.ModernToken,
      HCFrame.StampToken,
      HCFrame.FullToken,
    ],
    'a new',
  ],
  [
    [HCFrame.Modern, HCFrame.Stamp, HCFrame.Future, HCFrame.Playtest, HCFrame.Shattered],
    'a new card',
  ],
  [[HCFrame.ModernToken, HCFrame.StampToken, HCFrame.FullToken], 'a new token'],
  [
    [
      HCFrame.Original,
      HCFrame.Classic,
      HCFrame.Modern,
      HCFrame.Stamp,
      HCFrame.Future,
      HCFrame.Playtest,
      HCFrame.Shattered,
    ],
    'a card',
  ],
  [[HCFrame.ClassicToken, HCFrame.ModernToken, HCFrame.StampToken, HCFrame.FullToken], 'a token'],
  [
    [
      HCFrame.Original,
      HCFrame.Classic,
      HCFrame.Modern,
      HCFrame.Stamp,
      HCFrame.Future,
      HCFrame.Playtest,
      HCFrame.Shattered,
      HCFrame.ClassicToken,
      HCFrame.ModernToken,
      HCFrame.StampToken,
      HCFrame.FullToken,
    ],
    'a Magic: The Gathering',
  ],
  [[HCFrame.Jank], 'a jank'],
  [[HCFrame.NotMagic], 'a nonmagic game'],
  [[HCFrame.Pokemon], 'a Pokèmon TCG'],
  [[HCFrame.Yugioh], 'a Yu-Gi-Oh!'],
  [[HCFrame.LegendsOfRuneterra], 'a Legends of Runeterra'],
  [[HCFrame.SlayTheSpire], 'a Slay the Spire'],
  [[HCFrame.Inscryption], 'an Inscryption'],
  [[HCFrame.Hearthstone], 'a Hearthstone'],
  [[HCFrame.Lorcana], 'a Lorcana'],
  [
    [
      HCFrame.NotMagic,
      HCFrame.Pokemon,
      HCFrame.Yugioh,
      HCFrame.LegendsOfRuneterra,
      HCFrame.SlayTheSpire,
      HCFrame.Inscryption,
      HCFrame.Hearthstone,
      HCFrame.Lorcana,
    ],
    'any nonmagic game',
  ],
  [[HCFrame.WebsiteApp], 'a website or app'],
];
const getFrameName = (text: string) => {
  if (text in toCardFrame) {
    return frameNames.find(frames => equals(frames[0], toCardFrame[text]))?.[1];
  }
  return undefined;
};

const toFrameEffect: Record<string, HCFrameEffect | HCFrameEffect[]> = {
  sunmoondfc: HCFrameEffect.SunMoonDfc,
  sunmoontransform: HCFrameEffect.SunMoonDfc,
  sunmoon: HCFrameEffect.SunMoonDfc,
  sundfc: HCFrameEffect.SunMoonDfc,
  suntransform: HCFrameEffect.SunMoonDfc,
  sun: HCFrameEffect.SunMoonDfc,
  moontransform: [HCFrameEffect.SunMoonDfc, HCFrameEffect.MoonEldraziDfc],
  moondfc: [HCFrameEffect.SunMoonDfc, HCFrameEffect.MoonEldraziDfc],
  moon: [HCFrameEffect.SunMoonDfc, HCFrameEffect.MoonEldraziDfc],
  mooneldrazidfc: HCFrameEffect.MoonEldraziDfc,
  mooneldrazitransform: HCFrameEffect.MoonEldraziDfc,
  mooneldrazi: HCFrameEffect.MoonEldraziDfc,
  eldrazidfc: HCFrameEffect.MoonEldraziDfc,
  eldrazitransform: HCFrameEffect.MoonEldraziDfc,
  eldrazi: HCFrameEffect.MoonEldraziDfc,
  emrakuldfc: HCFrameEffect.MoonEldraziDfc,
  emrakultransform: HCFrameEffect.MoonEldraziDfc,
  emrakul: HCFrameEffect.MoonEldraziDfc,
  fandfc: HCFrameEffect.FanDfc,
  fantransform: HCFrameEffect.FanDfc,
  fan: HCFrameEffect.FanDfc,
  compasslanddfc: HCFrameEffect.CompassLandDfc,
  compasslandtransform: HCFrameEffect.CompassLandDfc,
  compassland: HCFrameEffect.CompassLandDfc,
  compassdfc: HCFrameEffect.CompassLandDfc,
  compasstransform: HCFrameEffect.CompassLandDfc,
  compass: HCFrameEffect.CompassLandDfc,
  landdfc: HCFrameEffect.CompassLandDfc,
  landtransform: HCFrameEffect.CompassLandDfc,
  land: HCFrameEffect.CompassLandDfc,
  originpwdfc: HCFrameEffect.OriginPwDfc,
  originpwtransform: HCFrameEffect.OriginPwDfc,
  originpw: HCFrameEffect.OriginPwDfc,
  origindfc: HCFrameEffect.OriginPwDfc,
  origintransform: HCFrameEffect.OriginPwDfc,
  origin: HCFrameEffect.OriginPwDfc,
  origins: HCFrameEffect.OriginPwDfc,
  pwdfc: HCFrameEffect.OriginPwDfc,
  pwtransform: HCFrameEffect.OriginPwDfc,
  pw: HCFrameEffect.OriginPwDfc,
  typedfc: HCFrameEffect.TypeDfc,
  typetransform: HCFrameEffect.TypeDfc,
  type: HCFrameEffect.TypeDfc,
  transformdfc: HCFrameEffect.TransformDfc,
  transform: HCFrameEffect.TransformDfc,
  tdfc: HCFrameEffect.TransformDfc,
  modaldfc: HCFrameEffect.Mdfc,
  modal: HCFrameEffect.Mdfc,
  mdfc: HCFrameEffect.Mdfc,
  specialize: HCFrameEffect.Specialize,
  meld: HCFrameEffect.Meld,
  anytransform: [
    HCFrameEffect.SunMoonDfc,
    HCFrameEffect.CompassLandDfc,
    HCFrameEffect.OriginPwDfc,
    HCFrameEffect.MoonEldraziDfc,
    HCFrameEffect.FanDfc,
    HCFrameEffect.TypeDfc,
    HCFrameEffect.TransformDfc,
  ],
  anydfc: [
    HCFrameEffect.SunMoonDfc,
    HCFrameEffect.CompassLandDfc,
    HCFrameEffect.OriginPwDfc,
    HCFrameEffect.MoonEldraziDfc,
    HCFrameEffect.FanDfc,
    HCFrameEffect.TypeDfc,
    HCFrameEffect.TransformDfc,
    HCFrameEffect.Mdfc,
    HCFrameEffect.Specialize,
    HCFrameEffect.Meld,
  ],
  legendary: HCFrameEffect.Legendary,
  legend: HCFrameEffect.Legendary,
  companion: HCFrameEffect.Companion,
  snow: HCFrameEffect.Snow,
  snowy: HCFrameEffect.Snow,
  enchantment: HCFrameEffect.Enchantment,
  nyx: HCFrameEffect.Enchantment,
  lesson: HCFrameEffect.Lesson,
  vehicle: HCFrameEffect.Vehicle,
  miracle: HCFrameEffect.Miracle,
  draft: HCFrameEffect.Draft,
  draftmatters: HCFrameEffect.Draft,
  conspiracy: HCFrameEffect.Draft,
  devoid: HCFrameEffect.Devoid,
  spree: HCFrameEffect.Spree,
  tombstone: HCFrameEffect.Tombstone,
  colorshifted: HCFrameEffect.Colorshifted,
  colorshift: HCFrameEffect.Colorshifted,
  inverted: HCFrameEffect.Inverted,
  invertedtext: HCFrameEffect.Inverted,
  showcase: HCFrameEffect.Showcase,
  masterpiece: HCFrameEffect.Masterpiece,
  full: HCFrameEffect.FullArt,
  fullart: HCFrameEffect.FullArt,
  extended: HCFrameEffect.ExtendedArt,
  extendedart: HCFrameEffect.ExtendedArt,
  verticalart: HCFrameEffect.VerticalArt,
  vertical: HCFrameEffect.VerticalArt,
  noart: HCFrameEffect.NoArt,
  etched: HCFrameEffect.Etched,
  slab: HCFrameEffect.Slab,
  slabbed: HCFrameEffect.Slab,
  arena: HCFrameEffect.Arena,
};
const frameEffectNames: [HCFrameEffect[], string][] = [
  [
    [HCFrameEffect.SunMoonDfc, HCFrameEffect.MoonEldraziDfc],
    'the sun and moon or moon and Eldrazi transform marks',
  ],
  [[HCFrameEffect.SunMoonDfc], 'the sun and moon transform marks'],
  [[HCFrameEffect.MoonEldraziDfc], 'the moon and Eldrazi transform marks'],
  [[HCFrameEffect.FanDfc], 'fan transforming marks'],
  [[HCFrameEffect.CompassLandDfc], 'the compass and land transform marks'],
  [[HCFrameEffect.OriginPwDfc], 'the Origins and planeswalker transform marks'],
  [[HCFrameEffect.TypeDfc], 'type transforming marks'],
  [[HCFrameEffect.TransformDfc], 'generic transforming marks'],
  [[HCFrameEffect.Mdfc], 'mdfc marks'],
  [[HCFrameEffect.Meld], 'meld marks'],
  [[HCFrameEffect.Specialize], 'specialize marks'],
  [
    [
      HCFrameEffect.SunMoonDfc,
      HCFrameEffect.CompassLandDfc,
      HCFrameEffect.OriginPwDfc,
      HCFrameEffect.MoonEldraziDfc,
      HCFrameEffect.FanDfc,
      HCFrameEffect.TypeDfc,
      HCFrameEffect.TransformDfc,
    ],
    'any transform marks',
  ],
  [
    [
      HCFrameEffect.SunMoonDfc,
      HCFrameEffect.CompassLandDfc,
      HCFrameEffect.OriginPwDfc,
      HCFrameEffect.MoonEldraziDfc,
      HCFrameEffect.FanDfc,
      HCFrameEffect.TypeDfc,
      HCFrameEffect.TransformDfc,
      HCFrameEffect.Mdfc,
      HCFrameEffect.Specialize,
      HCFrameEffect.Meld,
    ],
    'any dfc marks',
  ],
  [[HCFrameEffect.Legendary], 'a legendary crown'],
  [[HCFrameEffect.Companion], 'a companion frame'],
  [[HCFrameEffect.Snow], 'the snowy frame effect'],
  [[HCFrameEffect.Enchantment], 'the enchantment frame effect'],
  [[HCFrameEffect.Lesson], 'the Lesson frame effect'],
  [[HCFrameEffect.Vehicle], 'the Vehicle frame effect'],
  [[HCFrameEffect.Miracle], 'the miracle frame effect'],
  [[HCFrameEffect.Draft], 'the draft-matters frame effect'],
  [[HCFrameEffect.Devoid], 'the Devoid frame effect'],
  [[HCFrameEffect.Spree], 'Spree asterisks'],
  [[HCFrameEffect.Tombstone], 'the Odyssey tombstone mark'],
  [[HCFrameEffect.Colorshifted], 'a colorshifted frame'],
  [[HCFrameEffect.Inverted], 'predominantly inverted text'],
  [[HCFrameEffect.Showcase], 'a custom Showcase frame'],
  [[HCFrameEffect.Masterpiece], 'a masterpiece frame'],
  [[HCFrameEffect.FullArt], 'a full art frame'],
  [[HCFrameEffect.ExtendedArt], 'an extended art frame'],
  [[HCFrameEffect.VerticalArt], 'a vertical art frame'],
  [[HCFrameEffect.NoArt], 'a no-art frame'],
  [[HCFrameEffect.Etched], 'an etched foil treatment'],
  [[HCFrameEffect.Slab], 'a slabbed frame'],
  [[HCFrameEffect.Arena], 'an Arena frame'],
];
const getFrameEffectName = (text: string) => {
  if (text in toFrameEffect) {
    return frameEffectNames.find(frames => equals(frames[0], toFrameEffect[text]))?.[1];
  }
  return undefined;
};

const toShowcaseFrame: Record<string, string | string[]> = {
  kaladesh: 'Invention',
  invention: 'Invention',
  invocation: 'Invocation',
  amonkhet: 'Invocation',
  parchment: 'Parchment',
  storybook: 'Storybook',
  mural: 'Mural',
  eldraine: ['Storybook', 'Mural'],
  adventure: 'Storybook',
  signaturespellbook: 'Signature Spellbook',
  signature: 'Signature Spellbook',
  spellbook: 'Signature Spellbook',
  hedron: 'Hedron',
  landfall: 'Hedron',
  eldraziexpedition: 'Eldrazi Expedition',
  hedronexpedition: 'Hedron Expedition',
  expedition: ['Eldrazi Expedition', 'Hedron Expedition'],
  zendikar: ['Hedron', 'Eldrazi Expedition', 'Hedron Expedition'],
  phyrexian: 'Phyrexian',
  phyrexianized: 'Phyrexian',
  viking: 'Viking',
  kaldheim: 'Viking',
  strixhaven: 'Mystical Archive',
  mysticalarchive: 'Mystical Archive',
  mystical: 'Mystical Archive',
  archive: 'Mystical Archive',
  japanese: 'Japanese Mystical Archive',
  sketch: 'Sketch',
  module: 'Module',
  rulebook: 'Rulebook',
  dnd: ['Module', 'Rulebook'],
  equinox: 'Equinox',
  eternalnight: 'Eternal Night',
  doublefeature: 'Eternal Night',
  innistrad: ['Equinox', 'Eternal Night'],
  ninja: 'Ninja',
  samurai: 'Samurai',
  softglow: 'Soft Glow',
  kamigawa: ['Ninja', 'Samurai', 'Soft Glow'],
  goldenage: 'Golden Age',
  artdeco: 'Art Deco',
  skyscraper: 'Skyscraper',
  newcapenna: ['Golden Age', 'Art Deco', 'Skyscraper'],
  stainedglass: 'Stained Glass',
  thering: 'Ring',
  ring: 'Ring',
  scrolls: 'Scroll',
  scroll: 'Scroll',
  lotr: ['Ring', 'Scroll'],
  legendsofixalan: 'Legends of Ixalan',
  ixalan: ['Legends of Ixalan'],
  dossier: 'Dossier',
  magnified: 'Magnified',
  citymural: 'City',
  ravnica: ['Dossier', 'Magnified', 'City'],
  wanted: 'Wanted Poster',
  wantedposter: 'Wanted Poster',
  newspaper: 'Newspaper',
  bankvault: 'Vault',
  vault: 'Vault',
  thunderjunction: ['Wanted Poster', 'Newspaper', 'Bank Vault'],
  memorycorridor: 'Memory Corridor',
  critters: 'Critters',
  woodland: 'Woodland',
  bloomburrow: ['Critters', 'Woodland'],
  paranormal: 'Paranormal',
  duskmourn: 'Paranormal',
  draconic: 'Draconic',
  tarkir: 'Draconic',
  stellarsights: ['Stellar Sights', 'Poster Stellar Sights'],
  elemental: 'Elemental',
  fable: 'Fable',
  lorwyn: 'Fable',
  circuits: 'Circuits',
  poster: 'Poster',
  movie: 'Poster',
  comic: 'Comic',
  gamecover: 'Game Cover',
  bookcover: 'Book Cover',
  cover: ['Game Cover', 'Book Cover'],
  album: 'Album',
};

export const filterCardFrame: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    if (!(value2 in toCardFrame)) {
      return false;
    }
    return shareOp(
      actualOp,
      [...value1.toFaces().flatMap(e => e.frame ?? []), ...(value1.frame ?? [])],
      toCardFrame[value2]
    );
  },
  {
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: string) => {
      const frame = getFrameName(value);
      if (frame) {
        return `the cards ${opToDont(operator)} have ${frame} frame`;
      } else {
        return '!';
      }
    },
  }
);
export const filterFrameEffect: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    if (!(value2 in toFrameEffect)) {
      return false;
    }
    return shareOp(
      actualOp,
      [...value1.toFaces().flatMap(e => e.frame_effects ?? []), ...(value1.frame_effects ?? [])],
      toFrameEffect[value2]
    );
  },
  {
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: string) => {
      const frame = getFrameEffectName(value);
      if (frame) {
        return `the cards ${opToDont(operator)} have ${frame}`;
      } else {
        return '!';
      }
    },
  }
);

export const filterFrame: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return filterCardFrame(value1, actualOp, value2) || filterFrameEffect(value1, actualOp, value2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: string) => {
      const frame = getFrameName(value);
      const frameEffect = getFrameEffectName(value);
      if (frame) {
        return `the cards ${opToDont(operator)} have ${frame} frame`;
      } else if (frameEffect) {
        return `the cards ${opToDont(operator)} have ${frameEffect}`;
      } else {
        return '!';
      }
    },
  }
);

export const filterShowcase: cardStringFilter = Object.assign(
  function (this: cardStringFilter, value1: HCCard.Any, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    if (!(value2 in toShowcaseFrame && value1.tag_notes?.['showcase-frame'])) {
      return false;
    }
    return shareOp(
      actualOp,
      value1.tag_notes['showcase-frame'].split(', '),
      toShowcaseFrame[value2]
    );
  },
  {
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: string) => {
      if (!(value in toShowcaseFrame)) {
        return '!';
      }
      const frame = toShowcaseFrame[value];
      if (Array.isArray(frame)) {
        return `the cards ${opToDont(operator)} have a ${frame
          .map(e => `"${e}"`)
          .join(' or ')} showcase frame`;
      } else if (frame) {
        return `the cards ${opToDont(operator)} have a "${frame}" showcase frame`;
      } else {
        return '!';
      }
    },
  }
);
