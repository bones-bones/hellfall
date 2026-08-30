import { HCObject } from '../Object';
import { SetType } from './values';
/**
 * The list of all set codes
 */
export const allSetsList = [
  'HLC',
  'HLC_0',
  'HCV_1_0',
  'HLC_1',
  'HCV_1_1',
  'HLC_2',
  'HCV_1',
  'HC2',
  'HC2_0',
  'HCV_2_0',
  'HC2_1',
  'HCV_2_1',
  'HCV_2',
  'HC3',
  'HC3_0',
  'HCV_3_0',
  'HC3_1',
  'HCV_3_1',
  'HCV_3',
  'HBB_0',
  'HC4',
  'HC4_0',
  'HCV_4_0',
  'HC4_1',
  'HCV_4_1',
  'HBB_4',
  'HCV_4',
  'HC5',
  'HC6',
  'HC6_0',
  'HC6_1',
  'HCC',
  'HCV_6',
  'HWN',
  'HCP',
  'HCV_P',
  'HC7',
  'HC7_0',
  'HC7_1',
  'HBB_7',
  'HCV_7',
  'CDC',
  'HCK',
  'HCV_K',
  'HC8',
  'HC8_0',
  'HCJ',
  'HCV_J',
  'HC8_1',
  'HCV_8',
  'HKL',
  'HBB_L',
  'HCV_HKL',
  'HC9',
  'HC9_0',
  'HBB_9',
  'HCV_9',
  'SCL',
  'SCL_1',
  'SCL_2',
  'SCL_3',
  'HCV_SCL',
  'HDH',
  'HCV_HDH',
  'SCL_4',
  'HBB_S',
  'SCL_5',
  'SOH',
  'HCV_SOH',
  'SCL_6',
  'SCL_7',
  'SCL_8',
  'HC9_1',
  'HCV',
  'HCT',
  'HBB',
  'FHCJ',
  'SFT',
  'NRM',
] as const;

/**
 * The 3-6 character code for a set
 */
export type SetCode = (typeof allSetsList)[number];

/**
 * Checks if a value is a {@linkcode SetCode}
 * @param value the value to check
 */
export const isSetCode = (value: any): value is SetCode =>
  typeof value == 'string' &&
  allSetsList.includes(value.toUpperCase().replaceAll('.', '_') as SetCode);

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
 * Description of a Hellscube card set.
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
   * The date the set was finished
   *
   * @type IsoDate
   */
  released_at?: string;
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
   * The set codes for the daughter sets, if any. These sets will also be fetched
   * when searching for/downloading from this set.
   */
  child_set_codes?: SetCode[];
  /**
   * The number of cards in this set.
   *
   * @type Integer
   */
  // card_count: number;
  /**
   * Whether to order collector numbers by color (if not, defaults to using AO)
   */
  use_color_order?: boolean;
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
