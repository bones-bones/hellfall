import { HCObject } from '../Object';
// @circular-ignore scryfall does this too, so it's probably fine
import type { HCCardFields } from './CardFields.ts';

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
    HCCardFields.Print.CardFaceSpecific;
}
