/**
 * The frames that a card can have
 */
export enum HCFrame {
  /** The original Magic card frame, starting from Limited Edition Alpha. */
  Original = '1993',
  /** The updated classic frame starting from Mirage block */
  Classic = '1997',
  /** The "modern" Magic card frame, introduced in Eighth Edition and Mirrodin block. */
  Modern = '2003',
  /** The holofoil-stamp Magic card frame, introduced in Magic 2015. */
  Stamp = '2015',
  /** The frame used on cards from the future */
  Future = 'future',
  /** Playtest cards */
  Playtest = 'playtest',
  /** Any cards with a shattered frame. */
  Shattered = 'shattered',
  /** Misc/jank frames (notmagic, weird full art, etc.) */
  Jank = 'jank',
  /** The updated classic token frame starting from Mirage block */
  ClassicToken = 'token_1997',
  /** The "modern" Magic card frame, introduced in Eighth Edition and Mirrodin block. */
  ModernToken = 'token_2003',
  /** The holofoil-stamp Magic card frame, introduced in Magic 2015. */
  StampToken = 'token_2015',
  /** The new full-art token frame, introduced in Magic 2020. */
  FullToken = 'token_2020',
  /** Any cards with a pokemon frame. */
  Pokemon = 'pokemon',
  /** Any cards with a yugioh frame. */
  Yugioh = 'yugioh',
  /** Any cards with a legends of runeterra frame. */
  LegendsOfRuneterra = 'legends_of_runeterra',
  /** Any cards with a slay the spire frame. */
  SlayTheSpire = 'slay_the_spire',
  /** Any cards with an inscryption frame. */
  Inscryption = 'inscryption',
  /** Any cards with a hearthstone frame. */
  Hearthstone = 'hearthstone',
  /** Any cards with a lorcana frame. */
  Lorcana = 'lorcana',
  /** Any cards with a balatro frame. */
  Balatro = 'balatro',
  /** Any cards with a tarot frame. */
  Tarot = 'tarot',
  /** Any cards with a notmagic game frame that isn't covered by another frame. */
  NotMagic = 'notmagic',
  /** Any cards with a website or app frame. */
  WebsiteApp = 'website_app',
}
/**
 * The retro frames
 */
export const RetroFrames: HCFrame[] = [HCFrame.Original, HCFrame.Classic, HCFrame.ClassicToken];
/**
 * The retro card frames
 */
export const RetroCardFrames: HCFrame[] = [HCFrame.Original, HCFrame.Classic];
/**
 * The retro token frames
 */
export const RetroTokenFrames: HCFrame[] = [HCFrame.ClassicToken];
/**
 * The frames that many frame effects are restricted to
 */
export const EffectFrames: HCFrame[] = [HCFrame.Stamp, HCFrame.StampToken, HCFrame.FullToken];
/**
 * The new frames
 */
export const NewFrames: HCFrame[] = [
  HCFrame.Modern,
  HCFrame.Stamp,
  HCFrame.Future,
  HCFrame.Playtest,
  HCFrame.Shattered,
  HCFrame.ModernToken,
  HCFrame.StampToken,
  HCFrame.FullToken,
];
/**
 * The new card frames
 */
export const NewCardFrames: HCFrame[] = [
  HCFrame.Modern,
  HCFrame.Stamp,
  HCFrame.Future,
  HCFrame.Playtest,
  HCFrame.Shattered,
];
/**
 * The new token frames
 */
export const NewTokenFrames: HCFrame[] = [
  HCFrame.ModernToken,
  HCFrame.StampToken,
  HCFrame.FullToken,
];
/**
 * The card frames
 */
export const CardFrames: HCFrame[] = [
  HCFrame.Original,
  HCFrame.Classic,
  HCFrame.Modern,
  HCFrame.Stamp,
  HCFrame.Future,
  HCFrame.Playtest,
  HCFrame.Shattered,
];
/**
 * The token frames
 */
export const TokenFrames: HCFrame[] = [
  HCFrame.ClassicToken,
  HCFrame.ModernToken,
  HCFrame.StampToken,
  HCFrame.FullToken,
];
/**
 * The frames that appear on normal magic cards
 */
export const MagicFrames: HCFrame[] = [
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
];

/**
 * The frames from nonmagic games
 */
export const NotMagicFrames: HCFrame[] = [
  HCFrame.Pokemon,
  HCFrame.Yugioh,
  HCFrame.LegendsOfRuneterra,
  HCFrame.SlayTheSpire,
  HCFrame.Inscryption,
  HCFrame.Hearthstone,
  HCFrame.Lorcana,
  HCFrame.Balatro,
  HCFrame.Tarot,
  HCFrame.NotMagic,
];

/**
 * Checks if a value is a {@linkcode HCFrame}
 * @param value the value to check
 */
export const isFrame = (value: any): value is HCFrame => Object.values(HCFrame).includes(value);
