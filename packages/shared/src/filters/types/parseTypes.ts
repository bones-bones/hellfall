/**
 * The names for a regular filter
 */
export const filterNames = [
  'id',
  'oracleid',
  'kind',
  'name',
  'set',
  'block',
  'group',
  'settype',
  'number',
  'layout',
  'facelayout',
  'anylayout',
  'mana',
  'manatext',
  'manavalue',
  'supertype',
  'cardtype',
  'subtype',
  'type',
  'oracle',
  'flavor',
  'lore',
  'printed',
  'power',
  'toughness',
  'pt',
  'loyalty',
  'defense',
  'keyword',
  'legal',
  'notlegal',
  'banned',
  'creator',
  'artist',
  'artistnote',
  'ruling',
  'watermark',
  'border',
  'cardframe',
  'frameeffect',
  'frame',
  'showcase',
  'tag',
  'tagnote',
  'is',
  'has',
  'isrelated',
  'hasrelated',
  'include',
  'invalid',
  'invalidunique',
  'invaliddisplay',
  'invalidprefer',
  'invalidsort',
  'invalidkeyword',
  'invalidcolor',
] as const;
/**
 * The type for a name for a regular filter
 */
export type filterNameType = (typeof filterNames)[number];
/**
 * Checks if a value is {@linkcode filterNameType}
 * @param value value to check
 */
export const isFilterName = (value: any): value is filterNameType => filterNames.includes(value);
/**
 * Equivalent strings for {@linkcode filterNameType}
 */
export const equivFilterNames: Record<string, filterNameType> = {
  cardid: 'id',
  hcid: 'id',
  oid: 'oracleid',
  oi: 'oracleid',
  k: 'kind',
  n: 'name',
  s: 'set',
  b: 'block',
  g: 'group',
  st: 'settype',
  cube: 'settype',
  cn: 'number',
  collector: 'number',
  collectornumber: 'number',
  cardlayout: 'layout',
  fl: 'facelayout',
  al: 'anylayout',
  m: 'mana',
  cost: 'mana',
  manacost: 'mana',
  mt: 'manatext',
  manat: 'manatext',
  costt: 'manatext',
  costtext: 'manatext',
  mct: 'manatext',
  manacostt: 'manatext',
  manacosttextt: 'manatext',
  mv: 'manavalue',
  cmc: 'manavalue',
  t: 'type',
  super: 'supertype',
  supert: 'supertype',
  ct: 'cardtype',
  ctype: 'cardtype',
  sub: 'subtype',
  subt: 'subtype',
  o: 'oracle',
  text: 'oracle',
  oracletext: 'oracle',
  rules: 'oracle',
  rulestext: 'oracle',
  ft: 'flavor',
  flavortext: 'flavor',
  p: 'printed',
  pow: 'power',
  tou: 'toughness',
  powtou: 'pt',
  tough: 'toughness',
  loy: 'loyalty',
  def: 'defense',
  kw: 'keyword',
  keywords: 'keyword',
  f: 'legal',
  format: 'legal',
  creators: 'creator',
  a: 'artist',
  artists: 'artist',
  an: 'artistnote',
  anote: 'artistnote',
  ans: 'artistnote',
  anotes: 'artistnote',
  artistn: 'artistnote',
  artistns: 'artistnote',
  artistnotes: 'artistnote',
  rulings: 'ruling',
  bordercolor: 'border',
  wm: 'watermark',
  watermarks: 'watermark',
  frameffects: 'frameeffect',
  frameffect: 'frameeffect',
  frameeffects: 'frameeffect',
  fe: 'frameeffect',
  show: 'showcase',
  sc: 'showcase',
  otag: 'tag',
  oracletag: 'tag',
  function: 'tag',
  tn: 'tagnote',
  tnote: 'tagnote',
  tns: 'tagnote',
  tnotes: 'tagnote',
  tagn: 'tagnote',
  tagns: 'tagnote',
  tagnotes: 'tagnote',
  ir: 'isrelated',
  isrel: 'isrelated',
  isrels: 'isrelated',
  isrelateds: 'isrelated',
  hr: 'hasrelated',
  rel: 'hasrelated',
  rels: 'hasrelated',
  hasrel: 'hasrelated',
  hasrels: 'hasrelated',
  related: 'hasrelated',
  relateds: 'hasrelated',
  hasrelateds: 'hasrelated',
  sort: 'invalidsort',
  order: 'invalidsort',
  dir: 'invalidsort',
  direction: 'invalidsort',
};
/**
 * Converts a string to {@linkcode filterNameType} if possible; returns `undefined` otherwise
 * @param value value to convert
 */
export const toFilterName = (value: string): filterNameType | undefined =>
  equivFilterNames[value] ?? (isFilterName(value) ? value : undefined);
/**
 * Equivalent strings for inverted filters
 */
export const invertedFilterNames: Record<string, filterNameType> = {
  not: 'is',
  exclude: 'include',
};

/**
 * The names for a color filter
 */
const colorFilterNames = [
  'color',
  'indicator',
  'identity',
  'hybrid',
  'misccolor',
  'miscindicator',
  'miscidentity',
  'mischybrid',
] as const;
/**
 * The type for a name for a color filter
 */
export type colorFilterNameType = (typeof colorFilterNames)[number];
/**
 * Checks if a value is {@linkcode colorFilterNameType}
 * @param value value to check
 */
export const isColorFilterName = (value: any): value is colorFilterNameType =>
  colorFilterNames.includes(value);
/**
 * Equivalent strings for {@linkcode colorFilterNameType}
 */
export const equivColorFilterNames: Record<string, colorFilterNameType> = {
  c: 'color',
  colors: 'color',
  colorindicator: 'indicator',
  ci: 'identity',
  cidentity: 'identity',
  colorid: 'identity',
  cid: 'identity',
  hi: 'hybrid',
  hci: 'hybrid',
  hid: 'hybrid',
  hcid: 'hybrid',
  hybridid: 'hybrid',
  hybrididentity: 'hybrid',
  hybridcoloridentity: 'hybrid',
  mc: 'misccolor',
  mcolors: 'misccolor',
  mcolor: 'misccolor',
  mcolorindicator: 'miscindicator',
  mci: 'miscidentity',
  mcidentity: 'miscidentity',
  mcolorid: 'miscidentity',
  mcid: 'miscidentity',
  mhi: 'mischybrid',
  mhci: 'mischybrid',
  mhid: 'mischybrid',
  mhcid: 'mischybrid',
  mhybridid: 'mischybrid',
  mhybrididentity: 'mischybrid',
  mhybridcoloridentity: 'mischybrid',
  miscc: 'misccolor',
  misccolors: 'misccolor',
  misccolorindicator: 'miscindicator',
  miscci: 'miscidentity',
  misccidentity: 'miscidentity',
  misccolorid: 'miscidentity',
  misccid: 'miscidentity',
  mischi: 'mischybrid',
  mischci: 'mischybrid',
  mischid: 'mischybrid',
  mischcid: 'mischybrid',
  mischybridid: 'mischybrid',
  mischybrididentity: 'mischybrid',
  mischybridcoloridentity: 'mischybrid',
};
/**
 * Converts a string to {@linkcode colorFilterNameType} if possible; returns `undefined` otherwise
 * @param value value to convert
 */
export const toColorFilterName = (value: string): colorFilterNameType | undefined =>
  equivColorFilterNames[value] ?? (isColorFilterName(value) ? value : undefined);

/**
 * The names for a prints filter
 */
const printsFilterNames = ['in', 'sets', 'prints'] as const;
/**
 * The type for a name for a prints filter
 */
export type printsFilterNameType = (typeof printsFilterNames)[number];
/**
 * Checks if a value is {@linkcode printsFilterNameType}
 * @param value value to check
 */
export const isPrintsFilterName = (value: any): value is printsFilterNameType =>
  printsFilterNames.includes(value);
/**
 * Equivalent strings for {@linkcode printsFilterNameType}
 */
export const equivPrintsFilterNames: Record<string, printsFilterNameType> = {};
/**
 * Converts a string to {@linkcode printsFilterNameType} if possible; returns `undefined` otherwise
 * @param value value to convert
 */
export const toPrintsFilterName = (value: string): printsFilterNameType | undefined =>
  equivPrintsFilterNames[value] ?? (isPrintsFilterName(value) ? value : undefined);

/**
 * The names for a devotion filter
 */
const devotionFilterNames = [
  'devotion',
  'dreadmaw',
  'gray',
  'god',
  'fatass',
  'locus',
  'hybrid',
  'fish',
  'awesome',
  'history',
  "urza's",
] as const;
/**
 * The type for a name for a devotion filter
 */
export type devotionFilterNameType = (typeof devotionFilterNames)[number];
/**
 * The names for a devotion filter that can be a keyword on their own
 */
export const devotionKeywordFilterNames: devotionFilterNameType[] = ['devotion', 'dreadmaw'];
/**
 * The names for a devotion filter that can take a number
 */
export const devotionNumberFilterNames: devotionFilterNameType[] = [
  'dreadmaw',
  'gray',
  'hybrid',
  'history',
];
/**
 * Checks if a value is {@linkcode devotionFilterNameType}
 * @param value value to check
 */
export const isDevotionFilterName = (value: any): value is devotionFilterNameType =>
  devotionFilterNames.includes(value);
/**
 * Equivalent strings for {@linkcode devotionFilterNameType}
 */
export const equivDevotionFilterNames: Record<string, devotionFilterNameType> = {
  d: 'devotion',
  dev: 'devotion',
  dm: 'dreadmaw',
  maw: 'dreadmaw',
  grey: 'gray',
  gods: 'god',
  fat: 'fatass',
  ass: 'fatass',
  asses: 'fatass',
  fatasses: 'fatass',
  hybriddev: 'hybrid',
  hd: 'hybrid',
  hybridd: 'hybrid',
  hist: 'history',
  historic: 'history',
  urzas: "urza's",
  urza: "urza's",
};
/**
 * Converts a string to {@linkcode devotionFilterNameType} if possible; returns `undefined` otherwise
 * @param value value to convert
 */
export const toDevotionFilterName = (value: string): devotionFilterNameType | undefined =>
  equivDevotionFilterNames[value] ?? (isDevotionFilterName(value) ? value : undefined);

export type anyFilterNameType =
  | filterNameType
  | colorFilterNameType
  | printsFilterNameType
  | 'devotion'
  | 'comp';
