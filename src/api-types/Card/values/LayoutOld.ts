/**
 * TODO: completely rework make non-normal sides of transform/mdfc cards work as well as class // room // adventure
 * layouts to add:
 * 3-way split card
 * 4-way split card
 * double adventure
 * triple-sided
 * double-sided split
 *
 */
/**
 * single-side:
 * multiple adventure
 * coalesce?
 * triple aftermath
 * split card with
 */
/**
 * multi-side:
 * 3-side mdfc
 */

/**
 * The set of layouts for a face of a card.
 */
export enum HCFaceLayout {
  /** A standard Magic card face */
  Normal = 'normal',
  /** A split-faced card */
  Split = 'split',
  /** Cards with meld parts printed on the back (meld is implemented using related cards) */
  Meld = 'meld',
  /** Cards with Level Up */
  // Leveler = "leveler",
  /** Class-type enchantment cards */
  // Class = "class",
  /** Saga-type cards */
  // Saga = "saga",
  /** Adventure or Omen spell part */
  Inset = 'inset',
  /** Scheme-type cards */
  // Scheme = "scheme",
  /** Vanguard-type cards */
  // Vanguard = "vanguard",
  /** Token cards */
  // Token = "token",
  /** Tokens with another token printed on the back */
  // DoubleFacedToken = "double_faced_token",
  /** Emblem cards */
  // Emblem = "emblem",
  /** Cards with Augment */
  // Augment = "augment",
  /** Host-type cards */
  // Host = "host",
  /** Art Series collectable double-faced cards */
  // ArtSeries = "art_series",
  /** A Magic card with two sides that are unrelated */
  // ReversibleCard = "reversible_card",
  /** A special type of multi-part enchantment from Murders at Karlov Manor */
  // Case = "case",
  /** Back side is a noncard component  */
}

/**
 * The set of layouts for a side of a card (defined by using a single image per side).
 */
export enum HCSideLayout {
  /** A standard Magic card face */
  Normal = 'normal',
  /** A split-faced card */
  Split = 'split',
  /** Cards with meld parts printed on the back (meld is implemented using related cards) */
  Meld = 'meld',
  /** Cards with Level Up */
  // Leveler = "leveler",
  /** Class-type enchantment cards */
  // Class = "class",
  /** Saga-type cards */
  // Saga = "saga",
  /** Cards with an Adventure or Omen spell part */
  // Adventure = "adventure",
  /** Cards with Mutate */
  // Mutate = "mutate",
  /** Cards with Prototype */
  // Prototype = "prototype",
  /** Battle-type cards */
  // Battle = "battle",
  /** Plane and Phenomenon-type cards */
  // Planar = "planar",
  /** Scheme-type cards */
  // Scheme = "scheme",
  /** Vanguard-type cards */
  // Vanguard = "vanguard",
  /** Token cards */
  // Token = "token",
  /** Tokens with another token printed on the back */
  // DoubleFacedToken = "double_faced_token",
  /** Emblem cards */
  // Emblem = "emblem",
  /** Cards with Augment */
  // Augment = "augment",
  /** Host-type cards */
  // Host = "host",
  /** Art Series collectable double-faced cards */
  // ArtSeries = "art_series",
  /** A Magic card with two sides that are unrelated */
  // ReversibleCard = "reversible_card",
  /** A special type of multi-part enchantment from Murders at Karlov Manor */
  // Case = "case",
  /** Back side is a noncard component  */
}

/**
 * The set of layouts for multiple sides of a card (defined by using a single image per side).
 */
export enum HCMultiLayout {
  /** A standard Magic card face */
  Normal = 'normal',
  /** Cards that invert vertically with the flip keyword (flip is implemented with multiple sides) */
  Flip = 'flip',
  /** Multi-sided cards that transform */
  Transform = 'transform',
  /** Multi-sided cards that can be played any-side */
  ModalDfc = 'modal_dfc',
  /** Back side is for reference (should instead implement through related cards whenever possible)*/
  Reference = 'reference',
}

/**
 * Groupings of layouts.
 */
export namespace HCSideLayoutGroup {
  /**
   * All side layouts that represent a single-faced card, i.e. one with no card_faces property.
   *
   * @see {@link SingleFacedType} for the type of this group.
   */
  export const SingleFaced = [
    `${HCSideLayout.Normal}`,
    `${HCLayout.Meld}`,
    `${HCLayout.Leveler}`,
    `${HCLayout.Class}`,
    `${HCLayout.Saga}`,
    `${HCLayout.Mutate}`,
    `${HCLayout.Prototype}`,
    `${HCLayout.Battle}`,
    `${HCLayout.Planar}`,
    `${HCLayout.Scheme}`,
    `${HCLayout.Vanguard}`,
    `${HCLayout.Token}`,
    `${HCLayout.Emblem}`,
    `${HCLayout.Augment}`,
    `${HCLayout.Host}`,
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
  export const SingleSidedSplit = [
    `${HCLayout.Split}`,
    `${HCLayout.Flip}`,
    `${HCLayout.Adventure}`,
  ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where both faces are on the front.
   *
   * @see {@link SingleSidedSplit} for an array version.
   *
   */
  export type SingleSidedSplitType = (typeof SingleSidedSplit)[number];

  /**
   * All layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link DoubleSidedSplitType} for the type of this group.
   */
  export const DoubleSidedSplit = [
    `${HCLayout.Transform}`,
    `${HCLayout.ModalDfc}`,
    `${HCLayout.DoubleFacedToken}`,
    `${HCLayout.ArtSeries}`,
  ] as const;

  /**
   * A type for all layouts that represent a multi-faced card where the faces are on the front and back of the card.
   *
   * @see {@link DoubleSidedSplit} for an array version.
   *
   */
  export type DoubleSidedSplitType = (typeof DoubleSidedSplit)[number];
}
