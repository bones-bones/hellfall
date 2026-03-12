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
 *
 * It also provides a broader grouping:
 * - {@link HCCard.Any} describes any card at all. Think of it as like `any` but for cards.
 *
 * There is also an alias for each possible layout: {@link HCCard.Normal}, {@link HCCard.MeldPart}, etc.
 *
 * We recommend starting from {@link HCCard.Any} to describe generic API responses, and you will need to do type narrowing to access more specific fields.
 *
 * @example // Type narrowing by layout
 * const mysteryCard: HCCard.Any = getCard();
 *
 * if (mysteryCard.layout === HCLayout.MeldPart) {
 *   const meld: HCCard.MeldPart = mysteryCard;
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
       * This must be implemented when loading cards.
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
       * We haven't yet figured out how to implement this.
       *
       * @returns An array of values for the prop
       * For single-faced cards, returns an array with the prop itself.
       * For multi-faced cards, returns the prop from each member of the card_faces array.
       *
       */
      // getPropFromAllFaces(prop:string):any[];
      /**
       * Gets the value of a prop from each face of a card (including the main part for multiface cards)
       * We haven't yet figured out how to implement this.
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
   * Examples: {@link HCLayout.Normal}, {@link HCLayout.Token}, {@link HCLayout.Sticker}.
   */
  export type AnySingleFaced = AbstractCard &
    Layout<HCLayoutGroup.SingleFacedType> &
    HCCardFields.Gameplay.RootProperties &
    HCCardFields.Gameplay.CardSpecific &
    HCCardFields.Gameplay.CardFaceSpecific &
    HCCardFields.Print.CardSpecific &
    HCCardFields.Print.CardFaceSpecific;

  /** A card with the Normal layout. */
  export type Normal = AnySingleFaced & Layout<HCLayout.Normal>;

  // /** A card with the MeldResult layout. */
  export type MeldResult = AnySingleFaced & Layout<HCLayout.MeldResult>;

  // /** A card with the Token layout. */
  export type Token = AnySingleFaced & Layout<HCLayout.Token>;

  // /** A card with the Emblem layout. */
  export type Emblem = AnySingleFaced & Layout<HCLayout.Emblem>;
}

export namespace HCCard {
  type MultiFace<Face extends HCCardFace.AbstractCardFace> = AbstractCard &
    HCCardFields.Gameplay.RootProperties &
    HCCardFields.Gameplay.CardSpecific &
    HCCardFields.Gameplay.CardFaces<Face> &
    HCCardFields.Print.CardSpecific;
  /**
   * Any multi-faced layout. These will all have `card_faces`.
   */
  export type AnyMulti = MultiFace<HCCardFace.MultiFaced> & Layout<HCLayoutGroup.MultiFacedType>;

  /** A card with the Multi layout. */
  export type Multi = AnyMulti & Layout<HCLayout.Multi>;

  /** A card with the MultiToken layout. */
  export type MultiToken = AnyMulti & Layout<HCLayout.MultiToken>;

  /** A card with the MeldPart layout. */
  export type MeldPart = AnyMulti & Layout<HCLayout.MeldPart>;
}

export namespace HCCard {
  /**
   * A card with an indeterminate layout.
   *
   * An object of this value may be any card at all.
   *
   * Since this may be of any layout, common fields are available, but layout-specific fields (e.g. card_faces) will be unavailable until you perform type narrowing on it.
   */
  export type Any = AnySingleFaced | AnyMultiFaced;
  /**
   * Any card that is multifaced.
   */
  export type AnyMultiFaced = AnyMulti;
}
