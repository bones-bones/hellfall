import {
  // HCBorderColor,
  HCColors,
  // HCCoreColors,
  // HCMiscColors,
  // HCFinish,
  // HCFrame,
  // HCFrameEffect,
  // HCGame,
  HCImageStatus,
  // HCImageUris,
  // HCLanguageCode,
  HCLayout,
  HCLegalitiesField,
  // HCPrices,
  // HCPromoType,
  // HCPurchaseUris,
  // HCRarity,
  // HCRelatedUris,
  // HCSecurityStamp,
} from './values';

import { HCCardFace } from './CardFace';
import { HCRelatedCard } from './RelatedCard';
// import { HCManaTypes, HCCoreManaTypes, HCMiscManaTypes } from './values/ManaType';
// import { SetType } from "../Set/values";

/**
 * A collection of types related to each possible card field.
 */
export namespace HCCardFields {}

export namespace HCCardFields.Core {
  /**
   * These fields are always at the root level for every layout.
   */
  export type HCReferences = {
    /**
     * A unique ID for this card in HC’s database.
     *
     * @type UUID
     */
    id: string;
    /**
     * A code for this card’s layout. TODO: rework
     *
     * @see {@link https://scryfall.com/docs/api/layouts}
     */
    layout: `${HCLayout}`;
    /**
     * All rulings for the card.
     */
    rulings: string;
    /**
     * A link to this card’s permapage on HC’s website.
     *
     * @type URI
     */
    // scryfall_uri: string;
    /**
     * A link to this card object on HC’s API.
     *
     * @type URI
     */
    // uri: string;
    /**
     * The creator of this card.
     */
    creator: string;
    /**
     * All tags of this card.
     */
    tags?: string[];
    /**
     * Whether this card is an actual token (TODO: replace with type-based checks)
     */
    isActualToken?: boolean;
  };
}

export namespace HCCardFields.Gameplay {
  /**
   * These fields are always at the root level for every layout.
   */
  export type RootProperties = {
    /**
     * If this card is closely related to other cards, this property will be an array with Related Card Objects.
     */
    all_parts?: HCRelatedCard[];
    /**
     * An object describing the legality of this card across play formats. Possible legalities are legal, not_legal, restricted, and banned.
     */
    legalities: HCLegalitiesField;
  };

  /**
   * The card faces field. The faces will be of type T.
   */
  export type CardFaces<T extends HCCardFace.AbstractCardFace> = {
    /**
     * An array of Card Face objects, if this card is multifaced.
     */
    card_faces: T[];
  };

  /**
   * These fields are present only for Vanguards.
   */
  export type VanguardStats = {
    /**
     * This card’s hand modifier, if it is Vanguard card. This value will contain a delta, such as -1.
     */
    hand_modifier?: string;
    /**
     * This card’s life modifier, if it is Vanguard card. This value will contain a delta, such as +2.
     */
    life_modifier?: string;
  };

  /**
   * Combat stats: power, toughness, loyalty, and defense.
   * - Root level for a single-face card.
   * - Card face level for a multi-face card.
   */
  export type CombatStats = {
    /**
     * This card's defense, if any.
     */
    defense?: string;
    /**
     * This loyalty if any. Note that some cards have loyalties that are not numeric, such as X.
     */
    loyalty?: string;
    /**
     * This card’s power, if any. Note that some cards have powers that are not numeric, such as `"*"`.
     */
    power?: string;
    /**
     * This card’s toughness, if any. Note that some cards have toughnesses that are not numeric, such as `"*"`.
     */
    toughness?: string;
  };

  /**
   * On multi-face cards, these fields are duplicated at the card and face level.
   */
  type AllFaces = {
    name: string;
    type_line: string;
    mana_cost: string;
  };

  /**
   * These fields are specific for a card face.
   *
   * - Root level for a single-face card.
   * - Card face level for a multi-face card.
   */
  export type CardFaceSpecific = AllFaces & {
    /**
     * This face’s colors.
     */
    colors: HCColors;
    /**
     * The colors in this card’s color indicator, if any. A null value for this field indicates the card does not have one.
     */
    color_indicator?: HCColors;
    /**
     * Nullable 	The mana cost for this card. This value will be any empty string "" if the cost is absent. Remember that per the game rules, a missing mana cost and a mana cost of {0} are different  Multi-faced cards will report this value in card faces.
     */
    mana_cost: string;
    /**
     * The name of this card.
     */
    name: string;
    /**
     * The type line of this card.
     */
    type_line: string;
    /**
     * The supertypes of the card.
     */
    supertypes?: string[];
    /**
     * The types of the card.
     */
    types?: string[];
    /**
     * The subtypes of the card.
     */
    subtypes?: string[];
    /**
     * The Oracle text for this card, if any.
     */
    oracle_text: string;
    /**
     * The lit Unfinity attractions lights on this card, if any.
     *
     * This will be an array of numbers ranging from 1 to 6 inclusive.
     */
    attraction_lights?: number[];
  } & CombatStats &
    VanguardStats;


  /**
   * These fields are specific for a card.
   * - Root level for all layouts.
   */
  export type CardSpecific = AllFaces & {
    /**
     * The card’s mana value. Note that some funny cards have fractional mana costs.
     *
     * @type Decimal
     */
    cmc: number;
    /**
     * The front's colors.
     */
    colors: HCColors;
    /**
     * This card’s color identity..
     */
    color_identity: HCColors;
    /**
     * This card’s color identity for hybrid. It is a list of HCColors in order to handle the hybrid rules.
     */
    color_identity_hybrid: HCColors[];
    /**
     * An array of keywords that this card uses, such as 'Flying' and 'Cumulative upkeep'.
     */
    keywords: string[];
    /**
     * The name of this card. If this card has multiple faces, this field will contain all names separated by ␣//␣.
     */
    name: string;
    /**
     * Colors of mana that this card could produce.
     */
    // produced_mana?: HCManaTypes;
    /**
     * The type line of this card.
     */
    type_line: string;
  };
}

export namespace HCCardFields.Print {
  /**
   * These print fields are specific for a card.
   *
   * - Root level for a non-reversible card.
   * - Card face level for a reversible card.
   */
  export type CardSpecific = {
    /**
     * The name of the illustrator of this card. Newly spoiled cards may not have this field yet.
     */
    // artist?: string;
    /**
     * The IDs of the artists that illustrated this card. Newly spoiled cards may not have this field yet.
     *
     * @type UUID
     */
    // artist_ids?: string[];
    /**
     * This card’s border color: black, white, borderless, silver, or gold.
     */
    // border_color: `${HCBorderColor}`;
    /**
     * This card’s frame layout.
     */
    // frame: `${HCFrame}`;
    /**
     * A computer-readable indicator for the state of this card’s image.
     */
    image_status: `${HCImageStatus}`;
    /**
     * A string with the image for this card.
     */
    image?: string;
    /**
     * A computer-readable indicator for the state of this card’s draft image.
     */
    draft_image_status: `${HCImageStatus}`;
    /**
     * A string with the draft image.
     */
    draft_image?: string;
    /**
     * A list of ids to add to the draft pool when this is drafted.
     */
    // draft_partner_ids?: string[];
    /**
     * Whether this card shouldn't be directly draftable
     */
    not_directly_draftable?: boolean;
    /**
     * Whether this card has draftpartners
     */
    has_draft_partners?: boolean;
    /**
     * This card’s set code.
     */
    set: string;
  } & VariationInfo;

  /**
   * These print fields are specific for a card face.
   *
   * - Root level for a single-faced card.
   * - Card face level for a multi-faced card.
   */
  export type CardFaceSpecific = {
    /**
     * A computer-readable indicator for the state of this face's image. If this face doesn't have an image, this also explains why.
     */
    image_status: `${HCImageStatus}`;
    /**
     * A string with the image for this face, if any.
     */
    image?: string;
    /**
     * The flavor text, if any.
     */
    flavor_text?: string;
    /**
     * This card’s watermark, if any.
     */
    watermark?: string;
  };

  type VariationInfo = {
    /**
     * Whether this card is a variation of another printing.
     */
    variation: boolean;
    /**
     * The printing ID of the printing this card is a variation of.
     *
     * This will only exist if the `variation` field is true.
     *
     * @type UUID
     */
    variation_of?: string;
  };
}
