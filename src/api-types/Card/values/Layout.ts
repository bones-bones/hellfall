/**
 * The set of card layouts.
 */
export enum HCLayout {
  /** A standard Magic card with one face */
  Normal = 'normal',
  /** A multi-faced card */
  Multi = 'multi',
  /** Cards that can meld */
  MeldPart = 'meld_part',
  /** Cards that are the result of melding */
  MeldResult = 'meld_result',
  /** Tokens */
  Token = 'token',
  /** Tokens with another token printed on the back */
  MultiToken = 'multi_token',
  /** Emblem cards */
  Emblem = 'emblem',
  /** Reminder cards */
  Reminder = 'reminder',
  /** Sticker sheets */
  Sticker = 'sticker',
  /** Dungeons */
  Dungeon = 'dungeon',
  /** Token copies of real cards */
  RealCardToken = 'real_card_token',
  /** Misc images that aren't actually cards */
  Misc = 'misc'
}

/**
 * The set of layouts for a specific face.
 */
export enum HCFaceLayout {
  /** A standard Magic card face */
  Normal = 'normal',
  /** A split face */
  Split = 'split',
  /** A flip face */
  Flip = 'flip',
  /** Double-sided cards that transform */
  Transform = 'transform',
  /** Double-sided cards that can be played either-side */
  ModalDfc = 'modal_dfc',
  /** Cards with meld parts printed on the back */
  Meld = 'meld',
  /** Cards with Level Up */
  Leveler = 'leveler',
  /** Class-type enchantment cards */
  Class = 'class',
  /** Saga-type cards */
  Saga = 'saga',
  /** Cards with an Adventure spell part */
  Adventure = 'adventure',
  /** Cards with Mutate */
  Mutate = 'mutate',
  /** Cards with Prototype */
  Prototype = 'prototype',
  /** Battle-type cards */
  Battle = 'battle',
  /** Plane and Phenomenon-type cards */
  Planar = 'planar',
  /** Scheme-type cards */
  Scheme = 'scheme',
  /** Vanguard-type cards */
  Vanguard = 'vanguard',
  /** Token cards */
  Token = 'token',
  /** Tokens with another token printed on the back */
  DoubleFacedToken = 'double_faced_token',
  /** Emblem cards */
  Emblem = 'emblem',
  /** Cards with Augment */
  Augment = 'augment',
  /** Host-type cards */
  Host = 'host',
  /** Art Series collectable double-faced cards */
  ArtSeries = 'art_series',
  /** A Magic card with two sides that are unrelated */
  ReversibleCard = 'reversible_card',
  /** A special type of multi-part enchantment from Murders at Karlov Manor */
  Case = 'case',
}

/**
 * Groupings of layouts.
 */
export namespace HCLayoutGroup {
  /**
   * All layouts that represent a single-faced card, i.e. one with no card_faces property.
   *
   * @see {@link SingleFacedType} for the type of this group.
   */
  export const SingleFaced = [
    `${HCLayout.Normal}`,
    `${HCLayout.MeldResult}`,
    // `${HCLayout.Leveler}`,
    // `${HCLayout.Class}`,
    // `${HCLayout.Saga}`,
    // `${HCLayout.Mutate}`,
    // `${HCLayout.Prototype}`,
    // `${HCLayout.Battle}`,
    // `${HCLayout.Planar}`,
    // `${HCLayout.Scheme}`,
    // `${HCLayout.Vanguard}`,
    `${HCLayout.Token}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Reminder}`,
    `${HCLayout.Sticker}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.RealCardToken}`,
    `${HCLayout.Misc}`,
    // `${HCLayout.Augment}`,
    // `${HCLayout.Host}`,
  ] as const;

  /**
   * A type for all layouts that represent a single-faced card, i.e. one with no card_faces property.
   *
   * @see {@link SingleFaced} for an array version.
   */
  export type SingleFacedType = (typeof SingleFaced)[number];

  /**
   * All layouts that represent a multi-faced card where both faces are on the front.
   *
   * @see {@link SingleSidedSplitType} for the type of this group.
   */
  //   export const SingleSidedSplit = [
  //     `${HCLayout.Split}`,
  //     `${HCLayout.Flip}`,
  //     `${HCLayout.Adventure}`,
  //   ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where both faces are on the front.
   *
   * @see {@link SingleSidedSplit} for an array version.
   *
   */
  //   export type SingleSidedSplitType = (typeof SingleSidedSplit)[number];

  /**
   * All layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link DoubleSidedSplitType} for the type of this group.
   */
  //   export const DoubleSidedSplit = [
  //     `${HCLayout.Transform}`,
  //     `${HCLayout.ModalDfc}`,
  //     `${HCLayout.DoubleFacedToken}`,
  //     `${HCLayout.ArtSeries}`,
  //   ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link DoubleSidedSplit} for an array version.
   *
   */
  //   export type DoubleSidedSplitType = (typeof DoubleSidedSplit)[number];
  /**
   * All layouts that represent a multi-faced card.
   *
   * @see {@link MultiFacedType} for the type of this group.
   */
  export const MultiFaced = [
    `${HCLayout.Multi}`,
    `${HCLayout.MultiToken}`,
    `${HCLayout.MeldPart}`,
  ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link MultiFaced} for an array version.
   *
   */
  export type MultiFacedType = (typeof MultiFaced)[number];
  

  /**
   * All layouts that represent an actual card.
   *
   * @see {@link CardLayoutType} for the type of this group.
   */
  export const CardLayout = [
    `${HCLayout.Normal}`,
    `${HCLayout.Multi}`,
    `${HCLayout.MeldPart}`,
  ] as const;

  /**
   * A type for all layouts that represent an actual card.
   *
   * @see {@link CardLayout} for an array version.
   *
   */
  export type CardLayoutType = (typeof CardLayout)[number];


  /**
   * All layouts that represent a token.
   *
   * @see {@link TokenLayoutType} for the type of this group.
   */
  export const TokenLayout = [
    `${HCLayout.Token}`,
    `${HCLayout.MultiToken}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Reminder}`,
    `${HCLayout.Sticker}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.RealCardToken}`,
    `${HCLayout.Misc}`,
    `${HCLayout.MeldResult}`,
  ] as const;

  /**
   * A type for all layouts that represent a token.
   *
   * @see {@link TokenLayout} for an array version.
   *
   */
  export type TokenLayoutType = (typeof TokenLayout)[number];
}
