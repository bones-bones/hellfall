import { HCObject } from '../Object';
import { HCColors } from '../Card/values';

/**
 * Description of a card symbol.
 *
 * @see {@link https://scryfall.com/docs/api/card-symbols}
 */
export type HCCardSymbol = HCObject.Object<HCObject.ObjectType.CardSymbol> & {
  /**
   * The plaintext symbol stripped of curly braces {}. Note that not all symbols are ASCII text (for example, {∞}).
   */
  symbol: string;
  /**
   * An alternate version of this symbol, if it is possible to write it without curly braces.
   */
  // loose_variant?: string | null;
  /**
   * An English snippet that describes this symbol. Appropriate for use in alt text or other accessible communication formats.
   */
  english: string;
  /**
   * True if it is possible to write this symbol "backwards". For example, the official symbol {U/P} is sometimes written as {P/U} or {P\U} in informal settings. Note that the HC API never writes symbols backwards in other responses. This field is provided for informational purposes.
   */
  // transposable: boolean;
  /**
   * True if this is a mana symbol.
   */
  represents_mana: boolean;
  /**
   * A decimal number representing this symbol's mana value (also knowns as the converted mana cost). Note that mana symbols from funny sets can have fractional mana values.
   *
   * @type Decimal
   */
  mana_value?: number | null;
  /**
   * True if this symbol appears in a mana cost on any Magic card. For example {20} has this field set to false because {20} only appears in Oracle text, not mana costs.
   */
  // appears_in_mana_costs: boolean;
  /**
   * An array of colors that this symbol represents.
   */
  colors?: HCColors;
  /**
   * True if the symbol is a hybrid mana symbol. Note that monocolor Phyrexian symbols aren't considered hybrid.
   */
  // hybrid: boolean;
  /**
   * True if the symbol is a Phyrexian mana symbol, i.e. it can be paid with 2 life.
   */
  // phyrexian: boolean;
  /**
   * An array of alternate versions of this symbol.
   */
  alternates?: string[] | null;
  /**
   * True if the symbol doesn't need a drop shadow.
   */
  no_shadow?:boolean;
  /**
   * type of custom shadow clipping if necessary
   */
  clip_type?:'right-half'|'top-left-third'|'bottom-third';
  /**
   * A path to an image of this symbol.
   *
   * @type URI
   */
  filename: string;
};
