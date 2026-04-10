/**
 * The set of card layouts.
 */

// TODO: Decide whether to do array for cards that arguably fit multiple layouts
export enum HCLayout {
  /** A standard Magic card with one face or face */
  Normal = 'normal',
  /** A multi-faced card that doesn't fit into another category */
  Multi = 'multi',
  /** A multi-faced card that needs to be rendered as a grid (still  needs to be implemented) */
  // Grid = 'grid',
  /** Cards that can meld */
  MeldPart = 'meld_part',
  /** Cards/faces that are the result of melding */
  MeldResult = 'meld_result',
  /** Tokens */
  Token = 'token',
  /** Multi-faced tokens */
  MultiToken = 'multi_token',
  /** NotMagic cards */
  NotMagic = 'not_magic',
  /** Multi-faced NotMagic cards*/
  MultiNotMagic = 'multi_not_magic',
  /** Emblem cards */
  Emblem = 'emblem',
  /** Reminder cards */
  Reminder = 'reminder',
  /** Reminder cards with additional faces */
  MultiReminder = 'multi_reminder',
  /** Sticker sheets */
  Stickers = 'stickers',
  /** Dungeons */
  Dungeon = 'dungeon',
  /** Token copies of real cards */
  RealCardToken = 'real_card_token',
  /** Token copies of real multi-faced cards */
  RealCardMultiToken = 'real_card_multi_token',
  /** Checklist cards (used to represent double-sided cards in hands and libraries) */
  Checklist = 'checklist',
  /** Misc images that aren't actually cards */
  Misc = 'misc',
  /** Cards with faces of draftpartners */
  DraftPartnerFaces = 'draft_partner_faces',
  /** Cards with a reminder on the back */
  ReminderOnBack = 'reminder_on_back',
  /** Cards with a  dungeon on the back */
  DungeonOnBack = 'dungeon_on_back',
  /** Cards with a token on the back */
  TokenOnBack = 'token_on_back',
  /** Cards with a sticker sheet on the back */
  StickersOnBack = 'stickers_on_back',
  /** The following multi ones apply if none of the other multi ones apply, and the first one to match is applied */
  /** Cards that can be played on more than one face or modal faces of a card */
  Modal = 'modal',
  /** Cards that transform or transformed faces */
  Transform = 'transform',
  /** Cards that specialize or specialized faces */
  Specialize = 'specialize',
  /** Cards that flip or flipped faces */
  Flip = 'flip',
  /** Cards with an inset (adventure/omen spell) spell part */
  Inset = 'inset',
  /** Cards with an inset token */
  TokenInInset = 'token_in_inset',
  /** Cards with an inset dungeon */
  DungeonInInset = 'dungeon_in_inset',
  /** Cards with an aftermath face or aftermath faces */
  Aftermath = 'aftermath',
  /** Split cards or split faces */
  Split = 'split',
  /** Standard front face of a multiface card */
  Front = 'front',
  /** Cards/faces with levels */
  Leveler = 'leveler',
  /** Class-type enchantment cards/faces */
  Class = 'class',
  /** Case-type enchantment cards/faces */
  Case = 'case',
  /** Saga-type cards/faces */
  Saga = 'saga',
  /** Cards with Mutate */
  Mutate = 'mutate',
  /** Cards with Prototype */
  Prototype = 'prototype',
  /** Battle-type cards/faces */
  Battle = 'battle',
  /** Plane and Phenomenon-type cards */
  Planar = 'planar',
  /** Scheme-type cards */
  Scheme = 'scheme',
  /** Vanguard-type cards */
  Vanguard = 'vanguard',
  /** Cards with Station */
  Station = 'station',
  /** Cards with a prepared spell part */
  Prepare = 'prepare'
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
    `${HCLayout.Token}`,
    `${HCLayout.NotMagic}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Reminder}`,
    `${HCLayout.Stickers}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.RealCardToken}`,
    `${HCLayout.Checklist}`,
    `${HCLayout.Misc}`,
    `${HCLayout.Leveler}`,
    `${HCLayout.Saga}`,
    `${HCLayout.Class}`,
    `${HCLayout.Case}`,
    `${HCLayout.Mutate}`,
    `${HCLayout.Prototype}`,
    `${HCLayout.Planar}`,
    `${HCLayout.Scheme}`,
    `${HCLayout.Vanguard}`,
    `${HCLayout.Station}`,
    `${HCLayout.Battle}`,
  ] as const;

  /**
   * A type for all layouts that represent a single-faced card, i.e. one with no card_faces property.
   *
   * @see {@link SingleFaced} for an array version.
   */
  export type SingleFacedType = (typeof SingleFaced)[number];

  /**
   * All layouts that represent a multi-faced card.
   *
   * @see {@link MultiFacedType} for the type of this group.
   */
  export const MultiFaced = [
    `${HCLayout.Multi}`,
    `${HCLayout.MultiToken}`,
    `${HCLayout.MultiNotMagic}`,
    `${HCLayout.MeldPart}`,
    `${HCLayout.MultiReminder}`,
    `${HCLayout.RealCardMultiToken}`,
    `${HCLayout.DraftPartnerFaces}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.TokenInInset}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.DungeonInInset}`,
    `${HCLayout.StickersOnBack}`,
    `${HCLayout.Modal}`,
    `${HCLayout.Transform}`,
    `${HCLayout.Specialize}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Inset}`,
    `${HCLayout.Aftermath}`,
    `${HCLayout.Split}`,
    `${HCLayout.Prepare}`,
  ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link MultiFaced} for an array version.
   *
   */
  export type MultiFacedType = (typeof MultiFaced)[number];

  /**
   * All layouts that can be on an actual card.
   *
   * @see {@link CardLayoutType} for the type of this group.
   */
  export const CardLayout = [
    `${HCLayout.Normal}`,
    `${HCLayout.Multi}`,
    `${HCLayout.MeldPart}`,
    `${HCLayout.DraftPartnerFaces}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.TokenInInset}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.DungeonInInset}`,
    `${HCLayout.StickersOnBack}`,
    `${HCLayout.Modal}`,
    `${HCLayout.Transform}`,
    `${HCLayout.Specialize}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Inset}`,
    `${HCLayout.Aftermath}`,
    `${HCLayout.Split}`,
    `${HCLayout.Misc}`,
    `${HCLayout.Leveler}`,
    `${HCLayout.Class}`,
    `${HCLayout.Case}`,
    `${HCLayout.Saga}`,
    `${HCLayout.Mutate}`,
    `${HCLayout.Prototype}`,
    `${HCLayout.Planar}`,
    `${HCLayout.Scheme}`,
    `${HCLayout.Vanguard}`,
    `${HCLayout.Station}`,
    `${HCLayout.Prepare}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.Stickers}`,
    `${HCLayout.Misc}`,
    `${HCLayout.Battle}`,
  ] as const;

  /**
   * A type for all layouts that can be on an actual card.
   *
   * @see {@link CardLayout} for an array version.
   *
   */
  export type CardLayoutType = (typeof CardLayout)[number];

  /**
   * All layouts that can be on a token.
   *
   * @see {@link TokenLayoutType} for the type of this group.
   */
  export const TokenLayout = [
    `${HCLayout.Token}`,
    `${HCLayout.MultiToken}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Reminder}`,
    `${HCLayout.MultiReminder}`,
    `${HCLayout.Stickers}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.RealCardToken}`,
    `${HCLayout.RealCardMultiToken}`,
    `${HCLayout.Checklist}`,
    `${HCLayout.MeldResult}`,
    `${HCLayout.NotMagic}`,
    `${HCLayout.MultiNotMagic}`,
    `${HCLayout.Misc}`,
  ] as const;

  /**
   * A type for all layouts that can be on a token.
   *
   * @see {@link TokenLayout} for an array version.
   *
   */
  export type TokenLayoutType = (typeof TokenLayout)[number];

  /**
   * All layouts that only use their front for color identity.
   *
   * @see {@link FrontIdentityLayoutType} for the type of this group.
   */
  export const FrontIdentityLayout = [
    `${HCLayout.Specialize}`,
    `${HCLayout.MeldPart}`,
    `${HCLayout.DraftPartnerFaces}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.TokenInInset}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.DungeonInInset}`,
    `${HCLayout.StickersOnBack}`,
  ] as const;

  /**
   * A type for all layouts that only use their front for color identity.
   *
   * @see {@link FrontIdentityLayout} for an array version.
   *
   */
  export type FrontIdentityLayoutType = (typeof FrontIdentityLayout)[number];

  /**
   * All layouts that can be the layout for a face.
   *
   * @see {@link FaceLayoutType} for the type of this group.
   */
  export const FaceLayout = [
    `${HCLayout.Front}`,
    `${HCLayout.MeldResult}`,
    `${HCLayout.Token}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Reminder}`,
    `${HCLayout.Stickers}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.Checklist}`,
    `${HCLayout.Misc}`,
    `${HCLayout.DraftPartnerFaces}`,
    `${HCLayout.Modal}`,
    `${HCLayout.Transform}`,
    `${HCLayout.Specialize}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Inset}`,
    `${HCLayout.Aftermath}`,
    `${HCLayout.Split}`,
    `${HCLayout.Leveler}`,
    `${HCLayout.Class}`,
    `${HCLayout.Case}`,
    `${HCLayout.Saga}`,
    `${HCLayout.Mutate}`,
    `${HCLayout.Prototype}`,
    `${HCLayout.Battle}`,
    `${HCLayout.Planar}`,
    `${HCLayout.Scheme}`,
    `${HCLayout.Vanguard}`,
    `${HCLayout.Station}`,
    `${HCLayout.Prepare}`,
  ] as const;

  /**
   * A type for all layouts that can be the layout for a face.
   *
   * @see {@link FaceLayout} for an array version.
   *
   */
  export type FaceLayoutType = (typeof FrontIdentityLayout)[number];
}
