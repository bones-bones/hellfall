import { HCObject } from '../Object';
import { SetType } from './values';
/**
 * The list of all set codes
 */
export const allSetsList = [
  'HLC',
  'HLC.0',
  'HLC.1',
  'HLC.2',
  'HCV.1',
  'HC2',
  'HC2.0',
  'HC2.1',
  'HCV.2',
  'HC3',
  'HC3.0',
  'HC3.1',
  'HCV.3',
  'HC4',
  'HC4.0',
  'HC4.1',
  'HCV.4',
  'HC5',
  'HC6',
  'HC6.0',
  'HC6.1',
  'HCC',
  'HCV.6',
  'HCP',
  'HCV.P',
  'HC7',
  'HC7.0',
  'HC7.1',
  'HCV.7',
  'HCV.CDC',
  'HCK',
  'HCV.K',
  'HC8',
  'HC8.0',
  'HC8.1',
  'HCV.8',
  'HCJ',
  'HCV.J',
  'HKL',
  'HCV.L',
  'HC9',
  'HC9.0',
  'HCV.9',
  'SCL',
  'HCV.S',
  'HCV',
  'HCT',
  'HBB',
  'HBB.0',
  'HBB.4',
  'HBB.7',
  // 'HBB.J',
  'HBB.L',
  'FHCJ',
  'SFT',
  'NMTG',
  'NRM',
] as const;

/**
 * The 3-6 character code for a set
 */
export type SetCode = (typeof allSetsList)[number];

export const isSetCode = (value: any): value is SetCode =>
  allSetsList.includes(value.toUpperCase());

/**
 * A stored link.
 */
export type storedLink = {
  /**
   * The linked url.
   */
  url: string;
  /**
   * The text to use for the link.
   */
  text: string;
};

/**
 * Description of a Magic card set.
 *
 * @see {@link https://scryfall.com/docs/api/sets}
 */
export type HCSet = HCObject.Object<HCObject.ObjectType.Set> & {
  /**
   * A unique ID for this set on hellfall that will not change.
   *
   * @type UUID
   */
  id: string;
  /**
   * The unique three to five-letter code for this set.
   */
  code: SetCode;
  /**
   * The English name of the set.
   */
  name: string;
  /**
   * The English description of the set.
   */
  description: string;
  /**
   * A link to something to help.
   */
  quick_link?: storedLink;
  /**
   * A link to a tts plugin, if not using the normal download.
   */
  tts_link?: storedLink;
  /**
   * A link to a pdf for self-printing.
   */
  print_link?: storedLink;
  /**
   * A computer-readable classification for this set. See {@link SetType}.
   */
  set_type: SetType;
  /**
   * The date the set was released or the first card was printed in the set (in GMT-8 Pacific time).
   *
   * @type IsoDate
   */
  // released_at?: string;
  /**
   * The block code for this set, if any.
   */
  // block_code?: string;
  /**
   * The block or group name code for this set, if any.
   */
  // block?: string;
  /**
   * The set code for the parent set, if any. This set will be used for its image if it exists.
   */
  parent_set_code?: SetCode;
  /**
   * The set codes for the daughter sets, if any. These sets will also be fetched when searching for/downloading from this set.
   */
  child_set_codes?: SetCode[];
  /**
   * The number of cards in this set.
   *
   * @type Integer
   */
  // card_count: number;
  /**
   * A URI to an SVG file for this set's icon.
   *
   * @type URI
   */
  filename?: string;
  /**
   * Whether the set is ready for MPC autofill
   */
  ready_for_autofill?: boolean;
  /**
   * Whether to include lands in the MPC autofill
   */
  include_lands?: boolean;
};

// ,
//       "child_set_codes": ["HBB.J"]
//     },
//     {
//       "id": "",
//       "code": "HBB.J",
//       "name": "Jumpstart Lands",
//       "description": "The basic lands from Hellscube Jumpstart.",
//       "set_type": "land",
//       "parent_set_code": "HCJ"
