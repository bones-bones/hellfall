import { HCCard, HCLegalitiesField, HCMiscColors } from '@hellfall/shared/types';
import { getAllNames } from '../getNames';
import {
  colorMiscReduce,
  filterColorContents,
  filterColorIdentityContents,
  filterColorIdentityNumber,
  filterColorIndicatorContents,
  filterColorIndicatorNumber,
  filterColorNumber,
  filterHybridIdentityContents,
  filterHybridIdentityNumber,
  hybridIdentityMiscReduce,
} from './values/filterColors';
import { filterNumberString, filterNumberStringList } from './filterNumber';
import {
  filterObject,
  CardStringFilter,
  PassThroughSummaryFilter,
  sortObject,
  IncludeFilter,
  StringPropSummaryFilter,
  NumberPropSummaryFilter,
} from './filterObject';
import { filterIncludeExtras, filterSetBoth, filterSetCard, filterSetToken } from './filterSet';
import { filterEmpty, filterId, filterTag, filterTextList } from './filterText';
import {
  colorFilterMaker,
  dirType,
  filterMaker,
  includeFilterMaker,
  looseOpList,
  looseOpType,
  sortMaker,
  sortType,
} from './types';
import { invertOp, opToIncludePlural, opToIncludeSingular } from './filterUtils';
import { filterBanned, filterLegal, filterNotLegal } from './values/filterLegality';
import { filterHas, filterIs } from './filterIs';
import {
  filterAnyLayout,
  filterCardLayout,
  filterFaceLayout,
  toCardLayout,
} from './values/filterLayout';
import { filterBorder } from './values/filterBorder';
import {
  filterCardFrame,
  filterFrame,
  filterFrameEffect,
  filterShowcase,
} from './values/filterFrame';
import { isInteger, isNumber } from '@hellfall/shared/utils/isInt';
import { filterSort } from './sortRule';

export const makeIncludeFilter: includeFilterMaker = (value: string, op: looseOpType) => {
  return new IncludeFilter('include', filterIncludeExtras, value, op, '=');
};
export const makeSetFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('set', filterSetCard, value, op, '=');
};
export const makeTokenSetFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('tokenset', filterSetToken, value, op, '=');
};
export const makeBlockFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('block', filterSetBoth, value, op, '=');
};
export const makeInvalidFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalid',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown "${value}"`
  );
};
export const makeInvalidSortFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidsort',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown sort choice "${value}"`
  );
};
export const makeInvalidKeywordFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidkeyword',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown keyword "${value}"`
  );
};
export const makeInvalidColorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidcolor',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown color "${value}"`
  );
};

// export const makeInvalidIncludeFilter: filterMaker = (value: string, op: looseOpType) => {
//   return new filterObject<string, string>(
//     'invalidinclude',
//     filterEmpty,
//     value,
//     op,
//     '>=',
//     card => '',
//     () => `!Unknown include "${value}"`
//   );
// };

export const makeIDFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string, string>(
    'id',
    filterId,
    value,
    op,
    '=',
    card => card.id
  );
};

export const makeNameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'name',
    filterTextList,
    value,
    op,
    '>=',
    card => getAllNames(card),
    'the name',
    opToIncludeSingular
  );
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'mana',
    filterTextList,
    value,
    op,
    '>=',
    card => card.toFaces().map(e => e.mana_cost),
    'the cost',
    opToIncludeSingular
  );
};

export const makeTypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'type',
    filterTextList,
    value,
    op,
    '>=',
    card => [
      ...card.toFaces().flatMap(e => e.supertypes || []),
      ...card.toFaces().flatMap(e => e.types || []),
      ...card.toFaces().flatMap(e => e.subtypes || []),
      ...card.toFaces().map(e => e.type_line),
    ],
    'the types',
    opToIncludePlural
  );
};
export const makeSupertypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'supertype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      card
        .toFaces()
        .flatMap(e => [
          ...(e.supertypes || []),
          ...(e.supertypes && e.supertypes.length > 1 ? [e.supertypes.join(' ')] : []),
        ]),
    'the supertypes',
    opToIncludePlural
  );
};
export const makeCardtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'cardtype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      card
        .toFaces()
        .flatMap(e => [
          ...(e.types || []),
          ...(e.types && e.types.length > 1 ? [e.types.join(' ')] : []),
        ]),
    'the card types',
    opToIncludePlural
  );
};
export const makeSubtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'subtype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      card
        .toFaces()
        .flatMap(e => [
          ...(e.subtypes || []),
          ...(e.subtypes && e.subtypes.length > 1 ? [e.subtypes.join(' ')] : []),
        ]),
    'the subtypes',
    opToIncludePlural
  );
};
export const makeOracleFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'oracle',
    filterTextList,
    value,
    op,
    '>=',
    card => card.toFaces().map(e => e.oracle_text),
    'the oracle text',
    opToIncludeSingular
  );
};
export const makeFlavorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'flavor',
    filterTextList,
    value,
    op,
    '>=',
    card => card.toFaces().flatMap(e => e.flavor_text ?? []),
    'the flavor text',
    opToIncludeSingular
  );
};

export const makeLoreFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'lore',
    filterTextList,
    value,
    op,
    '>=',
    card => [
      ...getAllNames(card),
      ...card.toFaces().flatMap(e => e.supertypes || []),
      ...card.toFaces().flatMap(e => e.types || []),
      ...card.toFaces().flatMap(e => e.subtypes || []),
      ...card.toFaces().map(e => e.type_line),
      ...card.toFaces().map(e => e.oracle_text),
      ...card.toFaces().flatMap(e => e.flavor_text ?? []),
    ],
    'the lore',
    opToIncludeSingular
  );
};

export const makeCreatorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '>=',
    card => card.creators ?? [],
    'the creators',
    opToIncludePlural
  );
};
export const makeArtistFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'artist',
    filterTextList,
    value,
    op,
    '>=',
    card => card.artists ?? [],
    'the artists',
    opToIncludePlural
  );
};
export const makeKeywordFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '=',
    card => card.keywords,
    'the keywords',
    opToIncludePlural
  );
};
export const makeTagFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string[], string>(
    'tag',
    filterTag,
    value,
    op,
    '>=',
    card => card.tags ?? []
  );
};
export const makeCollectorNumberFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<string | undefined, string>(
    'number',
    filterNumberString,
    value,
    op,
    '=',
    card => card.collector_number,
    'the collector number'
  );
};
export const makeManaValueFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<number, string>(
    'manavalue',
    filterNumberString,
    value,
    op,
    '=',
    card => card.mana_value,
    'the mana value'
  );
};
export const makePowerFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'power',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.power ?? []),
    'the power'
  );
};
export const makeToughnessFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'toughness',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.toughness ?? []),
    'the toughness'
  );
};

export const makeLoyaltyFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'loyalty',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.loyalty ?? []),
    'the loyalty'
  );
};

export const makeDefenseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'defense',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.defense ?? []),
    'the defense'
  );
};

export const makeColorFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[], string[]>(
      'color',
      filterColorContents,
      value,
      op,
      '>=',
      card => card.colors
    );
  } else {
    return new PassThroughSummaryFilter<string[], number>(
      'color',
      filterColorNumber,
      value,
      op,
      '=',
      card => card.colors
    );
  }
};

export const makeIdentityFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[], string[]>(
      'identity',
      filterColorIdentityContents,
      value,
      op,
      '<=',
      card => card.color_identity
    );
  } else {
    return new PassThroughSummaryFilter<string[], number>(
      'identity',
      filterColorIdentityNumber,
      value,
      op,
      '=',
      card => card.color_identity
    );
  }
};

export const makeIndicatorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[][], string[]>(
      'indicator',
      filterColorIndicatorContents,
      value,
      op,
      '=',
      card =>
        card
          .toFaces()
          .filter(e => e.color_indicator)
          .map(e => e.color_indicator!)
    );
  } else {
    return new PassThroughSummaryFilter<string[][], number>(
      'indicator',
      filterColorIndicatorNumber,
      value,
      op,
      '=',
      card =>
        card
          .toFaces()
          .filter(e => e.color_indicator)
          .map(e => e.color_indicator!)
    );
  }
};

export const makeHybridFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[][], string[]>(
      'hybrid',
      filterHybridIdentityContents,
      value,
      op,
      '<=',
      card => card.color_identity_hybrid
    );
  } else {
    return new PassThroughSummaryFilter<string[][], number>(
      'hybrid',
      filterHybridIdentityNumber,
      value,
      op,
      '=',
      card => card.color_identity_hybrid
    );
  }
};
export const makeMiscColorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[], string[]>(
      'misccolor',
      filterColorContents,
      value,
      op,
      '>=',
      card => colorMiscReduce(card.colors)
    );
  } else {
    return new PassThroughSummaryFilter<string[], number>(
      'misccolor',
      filterColorNumber,
      value,
      op,
      '=',
      card => colorMiscReduce(card.colors)
    );
  }
};

export const makeMiscIdentityFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[], string[]>(
      'miscidentity',
      filterColorIdentityContents,
      value,
      op,
      '<=',
      card => colorMiscReduce(card.color_identity)
    );
  } else {
    return new PassThroughSummaryFilter<string[], number>(
      'miscidentity',
      filterColorIdentityNumber,
      value,
      op,
      '=',
      card => colorMiscReduce(card.color_identity)
    );
  }
};

export const makeMiscIndicatorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[][], string[]>(
      'miscindicator',
      filterColorIndicatorContents,
      value,
      op,
      '=',
      card =>
        card
          .toFaces()
          .filter(e => e.color_indicator)
          .map(e => colorMiscReduce(e.color_indicator!))
    );
  } else {
    return new PassThroughSummaryFilter<string[][], number>(
      'miscindicator',
      filterColorIndicatorNumber,
      value,
      op,
      '=',
      card =>
        card
          .toFaces()
          .filter(e => e.color_indicator)
          .map(e => colorMiscReduce(e.color_indicator!))
    );
  }
};

export const makeMiscHybridFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  if (Array.isArray(value)) {
    return new PassThroughSummaryFilter<string[][], string[]>(
      'mischybrid',
      filterHybridIdentityContents,
      value,
      op,
      '<=',
      card => hybridIdentityMiscReduce(card.color_identity_hybrid)
    );
  } else {
    return new PassThroughSummaryFilter<string[][], number>(
      'mischybrid',
      filterHybridIdentityNumber,
      value,
      op,
      '=',
      card => hybridIdentityMiscReduce(card.color_identity_hybrid)
    );
  }
};

export const makeLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'legal',
    filterLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};

export const makeNotLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'notlegal',
    filterNotLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};

export const makeBannedFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'banned',
    filterBanned,
    value,
    op,
    '=',
    card => card.legalities
  );
};

const cardFramesToParse = ['old', 'new'];
const frameEffectsToParse = [
  'full',
  'fullart',
  'extended',
  'extendedart',
  'vertical',
  'verticalart',
  'showcase',
  'etched',
];

export const makeIsFilter: filterMaker = (value: string, op: looseOpType) => {
  if (cardFramesToParse.includes(value)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(value)) {
    return makeFrameEffectFilter(value, op);
  }
  if (value in toCardLayout) {
    return makeCardLayoutFilter(value, op);
  }
  return new CardStringFilter('is', filterIs, value, op, '=');
};
export const makeHasFilter: filterMaker = (value: string, op: looseOpType) => {
  if (cardFramesToParse.includes(value)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(value)) {
    return makeFrameEffectFilter(value, op);
  }
  if (value in toCardLayout) {
    return makeFaceLayoutFilter(value, op);
  }
  return new CardStringFilter('has', filterHas, value, op, '=');
};

export const makeCardLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('layout', filterCardLayout, value, op, '=', card => [
    card.layout,
  ]);
};
export const makeFaceLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('facelayout', filterFaceLayout, value, op, '=', card =>
    card.toFaces().map(face => face.layout)
  );
};
export const makeAnyLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('anylayout', filterAnyLayout, value, op, '=', card =>
    (card.toFaces().map(face => face.layout) as string[]).concat(...[card.layout])
  );
};

export const makeBorderFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string, string>(
    'border',
    filterBorder,
    value,
    op,
    '=',
    card => card.border_color
  );
};
export const makeCardFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('cardframe', filterCardFrame, value, op, '=', card => [
    ...card.toFaces().flatMap(e => e.frame ?? []),
    ...(card.frame ?? []),
  ]);
};
export const makeFrameEffectFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('frameeffect', filterFrameEffect, value, op, '=', card => [
    ...card.toFaces().flatMap(e => e.frame_effects ?? []),
    ...(card.frame_effects ?? []),
  ]);
};
export const makeFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('frame', filterFrame, value, op, '=', card =>
    [...card.toFaces().flatMap(e => e.frame ?? []), ...(card.frame ?? [])].concat([
      ...card.toFaces().flatMap(e => e.frame_effects ?? []),
      ...(card.frame_effects ?? []),
    ])
  );
};
export const makeShowcaseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter(
    'showcase',
    filterShowcase,
    value,
    op,
    '=',
    card => card.tag_notes?.['showcase-frame'].split(', ') ?? []
  );
};

export const makeSort: sortMaker = (sort: sortType, dir: dirType) => {
  return new sortObject('sort', filterSort, sort, dir);
};

export const equivFilterNames: Record<string, string> = {
  cardid: 'id',
  name: 'n',
  m: 'mana',
  cost: 'mana',
  manacost: 'mana',
  t: 'type',
  o: 'oracle',
  oracletext: 'oracle',
  rules: 'oracle',
  rulestext: 'oracle',
  super: 'supertype',
  supert: 'supertype',
  ct: 'cardtype',
  ctype: 'cardtype',
  sub: 'subtype',
  subt: 'subtype',
  ft: 'flavor',
  flavortext: 'flavor',
  creators: 'creator',
  artists: 'artist',
  otag: 'tag',
  oracletag: 'tag',
  cn: 'number',
  collector: 'number',
  collectornumber: 'number',
  mv: 'manavalue',
  pow: 'power',
  tou: 'toughness',
  tough: 'toughness',
  loy: 'loyalty',
  def: 'defense',
  kw: 'keyword',
  // powtou:'pt',
  cardlayout: 'layout',
  f: 'legal',
  format: 'legal',
  bordercolor: 'border',
  frameeffects: 'frameeffect',
  sort: 'invalid',
  order: 'invalid',
  dir: 'invalid',
  direction: 'invalid',
  s: 'set',
  ts: 'tokenset',
  b: 'block',
};

export const filters: Record<string, filterMaker> = {
  id: makeIDFilter,
  name: makeNameFilter,
  mana: makeCostFilter,
  type: makeTypeFilter,
  supertype: makeSupertypeFilter,
  cardtype: makeCardtypeFilter,
  subtype: makeSubtypeFilter,
  oracle: makeOracleFilter,
  flavor: makeFlavorFilter,
  lore: makeLoreFilter,
  creator: makeCreatorFilter,
  artist: makeArtistFilter,
  keyword: makeKeywordFilter,
  tag: makeTagFilter,
  number: makeCollectorNumberFilter,
  manavalue: makeManaValueFilter,
  power: makePowerFilter,
  toughness: makeToughnessFilter,
  loyalty: makeLoyaltyFilter,
  defense: makeDefenseFilter,
  legal: makeLegalFilter,
  notlegal: makeNotLegalFilter,
  banned: makeBannedFilter,
  is: makeIsFilter,
  has: makeHasFilter,
  layout: makeCardLayoutFilter,
  facelayout: makeFaceLayoutFilter,
  anylayout: makeAnyLayoutFilter,
  border: makeBorderFilter,
  cardframe: makeCardFrameFilter,
  frameeffect: makeFrameEffectFilter,
  frame: makeFrameFilter,
  showcase: makeShowcaseFilter,
  invalid: makeInvalidFilter,
  invalidsort: makeInvalidSortFilter,
  invalidkeyword: makeInvalidKeywordFilter,
  invalidcolor: makeInvalidColorFilter,
  include: makeIncludeFilter,
  set: makeSetFilter,
  tokenset: makeTokenSetFilter,
  block: makeBlockFilter,
};

export const invertedFilterNames: Record<string, string> = {
  not: 'is',
  exclude: 'include',
};

export const equivColorFilterNames: Record<string, string> = {
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
export const colorFilters: Record<string, colorFilterMaker> = {
  color: makeColorFilter,
  indicator: makeIndicatorFilter,
  identity: makeIdentityFilter,
  hybrid: makeHybridFilter,
  misccolor: makeMiscColorFilter,
  miscindicator: makeMiscIndicatorFilter,
  miscidentity: makeMiscIdentityFilter,
  mischybrid: makeMiscHybridFilter,
};
export const textIsQuote = (text: string) =>
  text.length > 1 &&
  text[0] == text.charAt(-1) &&
  ['"', "'"].includes(text[0]) &&
  text.charAt(-2) != '\\';
export const unescapeText = (text: string) => {
  const strippedText = textIsQuote(text) ? text : text.replaceAll(/[_-]/g, '');
  return strippedText
    .replaceAll(/^['"]/g, '')
    .replaceAll(/(?<!\\)['"]/g, '')
    .replaceAll(/\\(['"])/g, '$1');
};
/**
 * Splits a search term on its first operator
 * @param text search term to split
 * @returns keyword, op, and term, all with unescapeText applied. Defaults to returning a name search.
 */
export const splitOnFirstOp = (
  text: string
): { keyword: string; op: looseOpType; term: string } => {
  for (let i = 1; i < text.length - 1; i++) {
    if (looseOpList.includes(text.slice(i, i + 2) as looseOpType) && i < text.length - 2) {
      return {
        keyword: unescapeText(text.slice(0, i)),
        op: text.slice(i, i + 2) as looseOpType,
        term: unescapeText(text.slice(i + 2)),
      };
    }
    if (looseOpList.includes(text.charAt(i) as looseOpType)) {
      return {
        keyword: unescapeText(text.slice(0, i)),
        op: text.charAt(i) as looseOpType,
        term: unescapeText(text.slice(i + 1)),
      };
    }
    if (text.charAt(i) == '"' || text.charAt(i) == "'") {
      break;
    }
  }
  return { keyword: 'name', op: ':', term: unescapeText(text) };
};
const colorNicknames: Record<string, string> = {
  colorless: 'C',
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
  purple: 'P',
  azorius: 'WU',
  ojutai: 'WU',
  fatehold: 'WU',
  dimir: 'UB',
  silumgar: 'UB',
  theorix: 'UB',
  rakdos: 'BR',
  kolaghan: 'BR',
  stingerquill: 'BR',
  gruul: 'RG',
  atarka: 'RG',
  konstrari: 'RG',
  selesnya: 'GW',
  dromoka: 'GW',
  vigorbloom: 'GW',
  orzhov: 'WB',
  silverquill: 'WB',
  golgari: 'BG',
  witherbloom: 'BG',
  simic: 'GU',
  quandrix: 'GU',
  izzet: 'UR',
  prismari: 'UR',
  boros: 'RW',
  lorehold: 'RW',
  bant: 'GWU',
  esper: 'WUB',
  grixis: 'UBR',
  jund: 'BRG',
  naya: 'RGW',
  abzan: 'WBG',
  jeskai: 'URW',
  sultai: 'BGU',
  mardu: 'RWB',
  temur: 'GUR',
  chaos: 'UBRG',
  aggression: 'BRGW',
  altruism: 'RGWU',
  growth: 'GWUB',
  artifice: 'WUBR',
};

const parseColorText = (text: string): string[] | number | undefined => {
  if (isInteger(text)) {
    return parseInt(text);
  }
  const colorList: string[] = [];
  let currentText = text.toLowerCase();
  if (currentText in colorNicknames) {
    currentText = colorNicknames[currentText];
  } else {
    HCMiscColors.forEach(color => {
      if (text.includes(color.toLowerCase())) {
        colorList.push(color);
        currentText = currentText.replaceAll(color.toLowerCase(), '');
      }
    });
    if (text.includes('misc')) {
      colorList.push('Misc');
      currentText = currentText.replaceAll('misc', '');
    }
  }
  const finalText = currentText.toUpperCase();
  const validColors = ['W', 'U', 'B', 'R', 'G', 'P', 'C'];
  for (const color of finalText) {
    if (!validColors.includes(color)) {
      return undefined;
    }
    if (!colorList.includes(color)) {
      colorList.push(color);
    }
  }
  return colorList;
};

export const filterIsInverted = (text: string, invert: boolean = false): boolean => {
  if (text[0] == '-') {
    return filterIsInverted(text.slice(1), !invert);
  }
  return false;
};
// make sure the thing doesn't strip quotes when passing text in to this from start and end of string when
export const parseFilter = (text: string, invert: boolean = false): filterObject<any, any> => {
  const correctOp = (filter: filterObject<any, any>) => {
    if (invert) {
      switch (filter.filter.invertOption) {
        case 'flip': {
          filter.op = invertOp(filter.op);
          break;
        }
        case 'negate': {
          filter.inverted = !filter.inverted;
          break;
        }
      }
    }
    return filter;
  };
  if (!text) {
    return makeInvalidFilter('', '=');
  }
  if (text[0] == '-') {
    return parseFilter(text.slice(1), !invert);
  }
  if (text[0] == '"' || text[0] == "'" || !looseOpList.some(op => text.includes(op))) {
    return correctOp(makeNameFilter(unescapeText(text), ':'));
  }
  const { keyword, op, term } = splitOnFirstOp(text);
  if (keyword in equivFilterNames || keyword in filters) {
    const correctKeyword = keyword in filters ? keyword : equivFilterNames[keyword];
    return correctOp(filters[correctKeyword](term, op));
  }
  if (keyword in invertedFilterNames) {
    return parseFilter(`${invertedFilterNames[keyword]}${op}${term}`, !invert);
  }
  if (keyword in equivColorFilterNames || keyword in colorFilters) {
    const correctKeyword = keyword in colorFilters ? keyword : equivColorFilterNames[keyword];
    const parsedColors = parseColorText(term);
    if (parsedColors == undefined) {
      return makeInvalidColorFilter(term, ':');
    }
    // using misc as a color automatically shunts the color search into a misc search
    if (
      Array.isArray(parsedColors) &&
      correctKeyword.slice(0, 4) != 'misc' &&
      parsedColors.includes('Misc')
    ) {
      return correctOp(colorFilters['misc' + correctKeyword](parsedColors, op));
    }
    return correctOp(colorFilters[correctKeyword](parsedColors, op));
  }
  if (term) {
    return makeInvalidKeywordFilter(keyword, ':');
  }
  return correctOp(makeNameFilter(unescapeText(text), ':'));
};
