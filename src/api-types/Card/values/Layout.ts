/**
 * The set of card layouts.
 */

// TODO: Decide whether to do array for cards that arguably fit multiple layouts
export enum HCLayout {
  /** A standard Magic card with one face */
  Normal = 'normal',
  /** A multi-faced card that doesn't fit into another category */
  Multi = 'multi',
  /** A multi-faced card that needs to be rendered as a grid (still  needs to be implemented) */
  // Grid = 'grid',
  /** Cards that can meld */
  MeldPart = 'meld_part',
  /** Cards that are the result of melding */
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
  DraftPartner = 'draft_partner',
  /** Cards with a reminder on the back */
  ReminderOnBack = 'reminder_on_back',
  /** Cards with a  dungeon on the back */
  DungeonOnBack = 'dungeon_on_back',
  /** Cards with a token on the back */
  TokenOnBack = 'token_on_back',
  /** Cards with a sticker sheet on the back */
  StickersOnBack = 'stickers_on_back',
  /** The following apply if none of the other multi ones apply, and the first one to match is applied */
  /** Cards that can be played on more than one face */
  Modal = 'modal',
  /** Cards that transform */
  Transform = 'transform',
  /** Cards that flip */
  Flip = 'flip',
  /** Cards with an inset */
  Inset = 'inset',
  /** Cards with an aftermath face */
  Aftermath = 'aftermath',
  /** Split cards */
  Split = 'split',
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
    `${HCLayout.DraftPartner}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.StickersOnBack}`,
    `${HCLayout.Modal}`,
    `${HCLayout.Transform}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Inset}`,
    `${HCLayout.Aftermath}`,
    `${HCLayout.Split}`,
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
    `${HCLayout.DraftPartner}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.StickersOnBack}`,
    `${HCLayout.Modal}`,
    `${HCLayout.Transform}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Inset}`,
    `${HCLayout.Aftermath}`,
    `${HCLayout.Split}`,
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
    `${HCLayout.MultiReminder}`,
    `${HCLayout.Stickers}`,
    `${HCLayout.Dungeon}`,
    `${HCLayout.RealCardToken}`,
    `${HCLayout.RealCardMultiToken}`,
    `${HCLayout.Checklist}`,
    `${HCLayout.Misc}`,
    `${HCLayout.MeldResult}`,
    `${HCLayout.NotMagic}`,
    `${HCLayout.MultiNotMagic}`,
  ] as const;

  /**
   * A type for all layouts that represent a token.
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
    `${HCLayout.MeldPart}`,
    `${HCLayout.DraftPartner}`,
    `${HCLayout.ReminderOnBack}`,
    `${HCLayout.TokenOnBack}`,
    `${HCLayout.DungeonOnBack}`,
    `${HCLayout.StickersOnBack}`,
  ] as const;

  /**
   * A type for all layouts that only use their front for color identity.
   *
   * @see {@link FrontIdentityLayout} for an array version.
   *
   */
  export type FrontIdentityLayoutType = (typeof FrontIdentityLayout)[number];
}
