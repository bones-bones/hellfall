import { HCObject } from '../Object';
import { HCLayout, HCLayoutGroup } from './values';
import { HCCardFace } from './CardFace';
import { HCCardFields } from './CardFields';

type Layout<T extends `${HCLayout}`> = Pick<HCCardFields.Core.HCReferences, 'layout'> & {
  layout: `${T}`;
};

/**
 * A collection of types representing HC cards of each possible layout.
 *
 * This collection is focused around two core varieties of cards:
 * - {@link HCCard.AnySingleFaced} describes any card with one face and no `card_faces` property, e.g. {@link HCCard.Normal Normal} or {@link HCCard.Saga Saga}.
 * - {@link HCCard.AnyMultiFaced} describes any card with multiple faces.
//  * - {@link HCCard.AnySingleSidedSplit} describes any card with multiple faces where both faces are on the front, e.g. {@link HCCard.Adventure Adventure}, {@link HCCard.Flip Flip}, or {@link HCCard.Split Split}.
//  * - {@link HCCard.AnyDoubleSidedSplit} describes any card with multiple faces where the faces are on the front and back of the card, e.g.  {@link HCCard.Transform Transform},  {@link HCCard.ModalDfc ModalDfc}, or  {@link HCCard.ReversibleCard ReversibleCard}.
//  * - {@link HCCard.ReversibleCard} describes solely reversible cards.
 *
//  * It also provides broader groupings:
//  * - {@link HCCard.Any} describes any card at all. Think of it as like `any` but for cards.
//  * - {@link HCCard.AnySplit} is an alias for either AnySingleSidedSplit or AnyDoubleSidedSplit.
//  * - {@link HCCard.AnyMultiFaced} is an alias for AnySingleSidedSplit, AnyDoubleSidedSplit, or Reversible. This describes all layouts that can have a `card_faces` field.
 *
//  * There is also an alias for each possible layout: {@link HCCard.Normal}, {@link HCCard.Transform}, etc.
 *
//  * We recommend starting from {@link HCCard.Any} to describe generic API responses, and you will need to do type narrowing to access more specific fields.
 *
 * @example // Type narrowing by layout
 * const mysteryCard: HCCard.Any = getCard();
 *
 * if (mysteryCard.layout === HCLayout.Transform) {
 *   const transform: HCCard.Transform = mysteryCard;
 * }
 *
 * @example // Type narrowing by property
 * const mysteryCard: HCCard.Any = getCard();
 *
 * if ("card_faces" in mysteryCard) {
 *   const mfc: HCCard.AnyMultiFaced = mysteryCard;
 * } else {
 *   const sfc: HCCard.AnySingleFaced = mysteryCard;
 * }
 *
 *
 * @see {@link https://scryfall.com/docs/api/cards}
 * @see {@link https://scryfall.com/docs/api/layouts}
 */
export namespace HCCard {
  /** The abstract root implementation of cards. */
  export type AbstractCard = HCObject.Object<HCObject.ObjectType.Card> &
    HCCardFields.Core.HCReferences & {
      /**
       * Converts the card to an array of its faces.
       * For single-faced cards, returns an array with the card itself.
       * For multi-faced cards, returns the card_faces array.
       *
       * @returns An array of card faces
       *
       * @example
       * const card: HCCard.Any = getCard();
       * const faces = card.toFaces(); // Always returns an array
       */
      toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced];
      // TODO: make these work
      /**
       * Gets the value of a prop from each face of a card (excluding the main part for multiface cards)
       *
       * @returns An array of values for the prop
       * For single-faced cards, returns an array with the prop itself.
       * For multi-faced cards, returns the prop from each member of the card_faces array.
       *
       */
      // getPropFromAllFaces(prop:string):any[];
      /**
       * Gets the value of a prop from each face of a card (including the main part for multiface cards)
       *
       * @returns An array of values for the prop
       * For single-faced cards, returns an array with the prop itself.
       * For multi-faced cards, returns the prop from each member of the card_faces array and from the card itself.
       */
      // getPropFromAllFacesInclusive(prop:string):any[];
    };
}

export namespace HCCard {
  /**
   * Any card with a single-faced layout.
   *
   * Examples: {@link HCLayout.Normal}, {@link HCLayout.Mutate}, {@link HCLayout.Token}.
   */
  export type AnySingleFaced = AbstractCard &
    Layout<HCLayoutGroup.SingleFacedType> &
    HCCardFields.Gameplay.RootProperties &
    HCCardFields.Gameplay.CardSpecific &
    HCCardFields.Gameplay.CardFaceSpecific &
    // HCCardFields.Gameplay.CardSideSpecific &
    // HCCardFields.Print.RootProperties &
    HCCardFields.Print.SingleSideOnly &
    HCCardFields.Print.CardSpecific &
    HCCardFields.Print.CardSideSpecific &
    HCCardFields.Print.CardFaceSpecific;

  /** A card with the Normal layout. */
  export type Normal = AnySingleFaced & Layout<HCLayout.Normal>;

  // /** A card with the MeldResult layout. */
  export type MeldResult = AnySingleFaced & Layout<HCLayout.MeldResult>;

  // /** A card with the Leveler layout. */
  // export type Leveler = AnySingleFaced & Layout<HCLayout.Leveler>;

  // /** A card with the Class layout. */
  // export type Class = AnySingleFaced & Layout<HCLayout.Class>;

  // /** A card with the Saga layout. */
  // export type Saga = AnySingleFaced & Layout<HCLayout.Saga>;

  // /** A card with the Mutate layout. */
  // export type Mutate = AnySingleFaced & Layout<HCLayout.Mutate>;

  // /** A card with the Prototype layout. */
  // export type Prototype = AnySingleFaced & Layout<HCLayout.Prototype>;

  // /** A card with the Battle layout. */
  // export type Battle = AnySingleFaced & Layout<HCLayout.Battle>;

  // /** A card with the Planar layout. */
  // export type Planar = AnySingleFaced & Layout<HCLayout.Planar>;

  // /** A card with the Scheme layout. */
  // export type Scheme = AnySingleFaced & Layout<HCLayout.Scheme>;

  // /** A card with the Vanguard layout. */
  // export type Vanguard = AnySingleFaced & Layout<HCLayout.Vanguard>;

  // /** A card with the Token layout. */
  export type Token = AnySingleFaced & Layout<HCLayout.Token>;

  // /** A card with the Emblem layout. */
  export type Emblem = AnySingleFaced & Layout<HCLayout.Emblem>;

  // /** A card with the Augment layout. */
  // export type Augment = AnySingleFaced & Layout<HCLayout.Augment>;

  // /** A card with the Host layout. */
  // export type Host = AnySingleFaced & Layout<HCLayout.Host>;
}

export namespace HCCard {
  type MultiFace<Face extends HCCardFace.AbstractCardFace> = AbstractCard &
    HCCardFields.Gameplay.RootProperties &
    HCCardFields.Gameplay.CardSpecific &
    HCCardFields.Gameplay.CardFaces<Face> &
    // HCCardFields.Print.RootProperties &
    HCCardFields.Print.CardSpecific;
  /**
   * Any split layout, either single sided or double sided. These will both have `card_faces`.
   */
  export type AnyMulti = MultiFace<HCCardFace.MultiFaced> & Layout<HCLayoutGroup.MultiFacedType>;

  /** A card with the Multi layout. */
  export type Multi = AnyMulti & Layout<HCLayout.Multi>;

  /** A card with the MultiToken layout. */
  export type MultiToken = AnyMulti & Layout<HCLayout.MultiToken>;

  /** A card with the MeldPart layout. */
  export type MeldPart = AnyMulti & Layout<HCLayout.MeldPart>;

  // /**
  //  * Any split layout, either single sided or double sided. These will both have `card_faces`.
  //  */
  // export type AnySplit = AnySingleSidedSplit | AnyDoubleSidedSplit;

  // /**
  //  * Any single-sided split card. These all have `card_faces`, and the faces are both on the front.
  //  *
  //  * Examples: {@link HCLayout.Split}, {@link HCLayout.Flip}, {@link HCLayout.Adventure}.
  //  */
  // export type AnySingleSidedSplit = MultiFace<HCCardFace.Split> &
  //   Layout<HCLayoutGroup.SingleSidedSplitType> &
  //   HCCardFields.Gameplay.CardSideSpecific &
  //   HCCardFields.Gameplay.CombatStats &
  //   HCCardFields.Print.CardSideSpecific &
  //   HCCardFields.Print.SingleSideOnly;

  // /** A card with the Split layout. */
  // export type Split = AnySingleSidedSplit & Layout<HCLayout.Split>;

  // /** A card with the Flip layout. */
  // export type Flip = AnySingleSidedSplit & Layout<HCLayout.Flip>;

  // /** A card with the Adventure layout. */
  // export type Adventure = AnySingleSidedSplit & Layout<HCLayout.Adventure>;

  // /**
  //  * Any double-sided split card. These all have `card_faces`, and the faces are on the obverse and reverse of the card.
  //  *
  //  * Examples: {@link HCLayout.Transform}, {@link HCLayout.ModalDfc}, {@link HCLayout.DoubleFacedToken}.
  //  */
  // export type AnyDoubleSidedSplit = MultiFace<HCCardFace.DoubleSided> &
  //   Layout<HCLayoutGroup.DoubleSidedSplitType>;

  // /** A card with the Transform layout. */
  // export type Transform = AnyDoubleSidedSplit & Layout<HCLayout.Transform>;

  // /** A card with the ModalDfc layout. */
  // export type ModalDfc = AnyDoubleSidedSplit & Layout<HCLayout.ModalDfc>;

  // /** A card with the DoubleFacedToken layout. */
  // export type DoubleFacedToken = AnyDoubleSidedSplit & Layout<HCLayout.DoubleFacedToken>;

  // /** A card with the ArtSeries layout. */
  // export type ArtSeries = AnyDoubleSidedSplit & Layout<HCLayout.ArtSeries>;
}

// export namespace HCCard {
//   /** A card with the ReversibleCard layout. */
//   export type ReversibleCard = Layout<HCLayout.ReversibleCard> &
//     Omit<AbstractCard, "oracle_id"> &
//     HCCardFields.Gameplay.RootProperties &
//     Omit<HCCardFields.Gameplay.CardSpecific, "type_line" | "cmc"> &
//     HCCardFields.Gameplay.CardFaces<HCCardFace.Reversible> &
//     HCCardFields.Print.RootProperties &
//     HCCardFields.Print.CardSpecific;
// }

export namespace HCCard {
  /**
   * A card with an indeterminate layout.
   *
   * An object of this value may be any card at all.
   *
   * Since this may be of any layout, common fields are available, but layout-specific fields (e.g. card_faces) will be unavailable until you perform type narrowing on
   */
  export type Any =
    | AnySingleFaced
    | AnyMultiFaced /**| AnySingleSidedSplit | AnyDoubleSidedSplit | ReversibleCard*/;
  /**
   * Any card that is multifaced: either a single or double sided split layout, or a reversible card.
   */
  export type AnyMultiFaced =
    AnyMulti /**| AnySingleSidedSplit | AnyDoubleSidedSplit | ReversibleCard*/;
}
