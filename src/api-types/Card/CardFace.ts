import { HCObject } from '../Object';
import { HCCardFields } from './CardFields';

/**
 * A collection of types representing card faces of each possible type.
 *
 * @see {@link https://scryfall.com/docs/api/layouts#card-faces}
 */
export namespace HCCardFace {
  /**
   * The abstract root implementation of card faces.
   */
  export type AbstractCardFace = HCObject.Object<HCObject.ObjectType.CardFace>;

  /**
   * A card face found on cards with multiple faces.
   */
  export type MultiFaced = AbstractCardFace &
    HCCardFields.Gameplay.CardFaceSpecific &
    HCCardFields.Print.CardFaceSpecific &
    HCCardFields.Print.CardFaceOnly &
    HCCardFields.Print.CardSideSpecific;
  /**
   * A card face found on multi-sided cards.
   *
   * E.g. Transform and MDFC cards.
   */
  // export type MultiSided = AbstractCardFace &
  //   HCCardFields.Gameplay.CardFaceSpecific &
  //   HCCardFields.Gameplay.CardSideSpecific &
  //   HCCardFields.Print.CardFaceSpecific &
  //   HCCardFields.Print.CardFaceOnly &
  //   HCCardFields.Print.CardSideSpecific;

  // export type Any = Split | MultiSided;
}
