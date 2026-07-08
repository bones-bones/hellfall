import { HCColors } from '@hellfall/shared/types';

// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets

// TODO: implement better reprint handling
/**
 * An object for the props on a cockatrice card face
 */
export type CockFaceProps = Record<string, string | number | HCColors> & {
  /**
   * The name of the face
   */
  name: string;
  /**
   * The text
   */
  text: string;
  /**
   * The layout
   */
  layout: string;
  /**
   * The type line
   */
  type: string;
  /**
   * The main card type
   */
  maintype: string;
  /**
   * The mana cost
   */
  manacost: string;
  /**
   * The mana value
   */
  cmc: number;
  /**
   * The colors
   */
  colors?: string[];
  /**
   * The power and toughness (separated by '/')
   */
  pt?: string;
  /**
   * The loyalty/defense
   */
  loyalty?: string;
  /**
   * The url for the image
   */
  picurl?: string;
};
/**
 * An object for the props on a cockatrice card
 */
export type CockCardProps = Record<string, string | CockFaceProps[]> & {
  /**
   * The color identity
   */
  coloridentity?: string;
  /**
   * The hcid of the card
   */
  hcid: string;
  /**
   * The uuid of the card
   */
  uuid: string;
  /**
   * Whether the card is legal in standard
   */
  'format-standard'?: 'legal';
  /**
   * Whether the card is legal in 4cb
   */
  'format-4cb'?: 'legal';
  /**
   * Whether the card is legal in commander
   */
  'format-commander'?: 'legal';
  /**
   * The faces to use
   */
  props: CockFaceProps[];
  /**
   * The related cards to use
   */
  related?: CockRelatedProps[];
  /**
   * Whether this card is a token
   */
  token?: '1';
  /**
   * The set to use
   */
  set: string;
  /**
   * The collector number to use
   */
  collector_number?: string;
};
/**
 * An object for the props on a cockatrice related card
 */
export type CockRelatedProps = Record<string, string> & {
  /**
   * The uuid of the related card
   */
  id: string;
  /**
   * The name of the related card
   */
  name?: string;
  /**
   * Whether the relationship is reversed or not
   */
  reverse: 'reverse-' | '';
  /**
   * The number of tokens to make
   */
  count?: string;
  /**
   * Whether the related card is part of this card rather than a token
   */
  attach?: 'transform';
  /**
   * Whether the related card is persistent
   */
  persistent?: 'persistent';
};
