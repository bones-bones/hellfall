import { HCCard, HCLegalitiesField, HCMiscColors } from '@hellfall/shared/types';
import { getAllNames } from '../getNames';
import {
  colorMiscReduce,
  filterColorIdentity,
  filterColorIndicator,
  filterColors,
  filterHybridIdentity,
  hybridIdentityMiscReduce,
} from './filterColors';
import { filterNumberString, filterNumberStringList } from './filterNumber';
import { filterObject, CardStringFilter, SetFilter } from './filterObject';
import { filterSetBoth, filterSetCard, filterSetToken } from './filterSet';
import {
  filterEmpty,
  filterId,
  filterLore,
  filterTag,
  filterText,
  filterTextList,
} from './filterText';
import {
  colorFilterMaker,
  filterMaker,
  invertOp,
  looseOpList,
  looseOpType,
  setFilterMaker,
} from './types';
import { filterBanned, filterLegal, filterNotLegal } from './filterLegality';
import { filterHas, filterIs } from './filterIs';
import { filterAnyLayout, filterCardLayout, filterFaceLayout } from './values/filterLayout';
import { filterBorder } from './values/filterBorder';
import {
  filterCardFrame,
  filterFrame,
  filterFrameEffect,
  filterShowcase,
} from './values/filterFrame';
import { isInteger, isNumber } from '@hellfall/shared/utils/isInt';

export const makeSetFilter: setFilterMaker = (
  value: string,
  op: looseOpType,
  includeExtras: boolean
) => {
  return new SetFilter('set', filterSetCard, value, op, '=', includeExtras);
};
export const makeTokenSetFilter: setFilterMaker = (
  value: string,
  op: looseOpType,
  includeExtras: boolean
) => {
  return new SetFilter('tokenset', filterSetToken, value, op, '=', includeExtras);
};
export const makeBlockFilter: setFilterMaker = (
  value: string,
  op: looseOpType,
  includeExtras: boolean
) => {
  return new SetFilter('block', filterSetBoth, value, op, '=', includeExtras);
};
export const makeTrueFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>('true', filterEmpty, value, op, '=', card => '');
};
export const makeFalseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>('false', filterEmpty, value, op, '!=', card => '');
};

export const makeIDFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>('id', filterId, value, op, '>=', card => card.id);
};

export const makeNameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('name', filterTextList, value, op, '>=', card =>
    getAllNames(card)
  );
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('mana', filterTextList, value, op, '>=', card =>
    card.toFaces().map(e => e.mana_cost)
  );
};

export const makeTypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('type', filterTextList, value, op, '>=', card => [
    ...card.toFaces().flatMap(e => e.supertypes || []),
    ...card.toFaces().flatMap(e => e.types || []),
    ...card.toFaces().flatMap(e => e.subtypes || []),
    ...card.toFaces().map(e => e.type_line),
  ]);
};
export const makeSupertypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('supertype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.supertypes || []),
        ...(e.supertypes && e.supertypes.length > 1 ? [e.supertypes.join(' ')] : []),
      ])
  );
};
export const makeCardtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('cardtype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.types || []),
        ...(e.types && e.types.length > 1 ? [e.types.join(' ')] : []),
      ])
  );
};
export const makeSubtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('subtype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.subtypes || []),
        ...(e.subtypes && e.subtypes.length > 1 ? [e.subtypes.join(' ')] : []),
      ])
  );
};
export const makeOracleFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('oracle', filterTextList, value, op, '>=', card =>
    card.toFaces().map(e => e.oracle_text)
  );
};
export const makeFlavorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('flavor', filterTextList, value, op, '>=', card =>
    card.toFaces().flatMap(e => e.flavor_text ?? [])
  );
};
export const makeLoreFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('lore', filterLore, value, op, '=');
};

export const makeCreatorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '>=',
    card => card.creators ?? []
  );
};
export const makeArtistFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'artist',
    filterTextList,
    value,
    op,
    '>=',
    card => card.artists ?? []
  );
};
export const makeKeywordFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '=',
    card => card.keywords
  );
};
export const makeTagFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'tag',
    filterTag,
    value,
    op,
    '>=',
    card => card.tags ?? []
  );
};
export const makeCollectorNumberFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string | undefined, string>(
    'number',
    filterNumberString,
    value,
    op,
    '=',
    card => card.collector_number
  );
};
export const makeManaValueFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<number, string>(
    'manavalue',
    filterNumberString,
    value,
    op,
    '=',
    card => card.mana_value
  );
};
export const makePowerFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'power',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.power ?? [])
  );
};
export const makeToughnessFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'toughness',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.toughness ?? [])
  );
};

export const makeLoyaltyFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'loyalty',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.loyalty ?? [])
  );
};

export const makeDefenseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'defense',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.defense ?? [])
  );
};

export const makeColorFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[], string[] | number>(
    'color',
    filterColors,
    value,
    op,
    '=',
    card => card.colors
  );
};
export const makeIndicatorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  return new filterObject<string[][] | undefined, string[] | number>(
    'indicator',
    filterColorIndicator,
    value,
    op,
    '=',
    // Can't do a flatmap here because that would miss Purple Pick Picker
    card =>
      /** !filterHas(card,'=','indicator') ? undefined : */ card
        .toFaces()
        .filter(face => face.color_indicator)
        .map(face => face.color_indicator!)
  );
};
export const makeIdentityFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[], string[] | number>(
    'identity',
    filterColorIdentity,
    value,
    op,
    '=',
    card => card.color_identity
  );
};
export const makeHybridFilter: colorFilterMaker = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[][], string[] | number>(
    'hybrid',
    filterHybridIdentity,
    value,
    op,
    '=',
    card => card.color_identity_hybrid
  );
};

export const makeMiscColorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  return new filterObject<string[], string[] | number>(
    'misccolor',
    filterColors,
    value,
    op,
    '=',
    card => colorMiscReduce(card.colors)
  );
};

export const makeMiscIndicatorFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  return new filterObject<string[][] | undefined, string[] | number>(
    'miscindicator',
    filterColorIndicator,
    value,
    op,
    '=',
    // Can't do a flatmap here because that would miss Purple Pick Picker
    card =>
      /** !filterHas(card,'=','indicator') ? undefined : */ card
        .toFaces()
        .filter(face => face.color_indicator)
        .map(face => colorMiscReduce(face.color_indicator!))
  );
};

export const makeMiscIdentityFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  return new filterObject<string[], string[] | number>(
    'miscidentity',
    filterColorIdentity,
    value,
    op,
    '=',
    card => colorMiscReduce(card.color_identity)
  );
};
export const makeMiscHybridFilter: colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => {
  return new filterObject<string[][], string[] | number>(
    'hybrid',
    filterHybridIdentity,
    value,
    op,
    '=',
    card => hybridIdentityMiscReduce(card.color_identity_hybrid)
  );
};

export const makeLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'legal',
    filterLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeNotLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'notlegal',
    filterNotLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeBannedFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'banned',
    filterBanned,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeIsFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('is', filterIs, value, op, '=');
};
export const makeNotFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('is', filterIs, value, invertOp(op), '=');
};
export const makeHasFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('has', filterHas, value, op, '=');
};
export const makeCardLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('layout', filterCardLayout, value, op, '=');
};
export const makeFaceLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('facelayout', filterFaceLayout, value, op, '=');
};
export const makeAnyLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('anylayout', filterAnyLayout, value, op, '=');
};
export const makeBorderFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'border',
    filterBorder,
    value,
    op,
    '>=',
    card => card.border_color
  );
};
export const makeCardFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('cardframe', filterCardFrame, value, op, '=');
};
export const makeFrameEffectFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('frameeffect', filterFrameEffect, value, op, '=');
};
export const makeFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('frame', filterFrame, value, op, '=');
};
export const makeShowcaseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('showcase', filterShowcase, value, op, '=');
};

export const equivFilterNames: Record<string, string> = {
  cardid: 'id',
  name: 'n',
  m: 'mana',
  cost: 'mana',
  manacost: 'mana',
  t: 'type',
  o: 'oracle',
  super: 'supertype',
  supert: 'supertype',
  ct: 'cardtype',
  ctype: 'cardtype',
  sub: 'subtype',
  subt: 'subtype',
  ft: 'flavor',
  oracletext: 'oracle',
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
  not: makeNotFilter,
  has: makeHasFilter,
  layout: makeCardLayoutFilter,
  facelayout: makeFaceLayoutFilter,
  anylayout: makeAnyLayoutFilter,
  border: makeBorderFilter,
  cardframe: makeCardFrameFilter,
  frameeffect: makeFrameEffectFilter,
  frame: makeFrameFilter,
  showcase: makeShowcaseFilter,
};
export const equivSetFilterNames: Record<string, string> = {
  s: 'set',
  ts: 'tokenset',
  b: 'block',
};
export const setFilters: Record<string, setFilterMaker> = {
  set: makeSetFilter,
  tokenset: makeTokenSetFilter,
  block: makeBlockFilter,
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
  const strippedText = textIsQuote(text) ? text.replaceAll(/[_-]/g, '') : text;
  return strippedText
    .replaceAll(/^['"]/g, '')
    .replaceAll(/(?<!\\)['"]/g, '')
    .replaceAll(/\\(['"])/g, '$1');
};
const splitOnFirstOp = (text: string): { keyword: string; op: looseOpType; term: string } => {
  for (let i = 1; i < text.length - 1; i++) {
    if (looseOpList.includes(text.slice(i, i + 2)) && i < text.length - 2) {
      return {
        keyword: unescapeText(text.slice(0, i)),
        op: text.slice(i, i + 2) as looseOpType,
        term: unescapeText(text.slice(i + 2)),
      };
    }
    if (looseOpList.includes(text.charAt(i))) {
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
// make sure the thing doesn't strip quotes when passing text in to this from start and end of string when
export const parseFilter = (text: string, invert: boolean = false): filterObject<any, any> => {
  const fop = (op: looseOpType) => {
    return invert ? invertOp(op) : op;
  };
  if (!text) {
    return makeTrueFilter('', '=');
  }
  if (text[0] == '-') {
    return parseFilter(text.slice(1), !invert);
  }
  if (text[0] == '"' || text[0] == "'" || !looseOpList.some(op => text.includes(op))) {
    return makeNameFilter(unescapeText(text), fop(':'));
  }
  const { keyword, op, term } = splitOnFirstOp(text);
  if (keyword in equivFilterNames || keyword in filters) {
    const correctKeyword = keyword in filters ? keyword : equivFilterNames[keyword];
    return filters[correctKeyword](term, fop(op));
  }
  if (keyword in equivSetFilterNames || keyword in setFilters) {
    const correctKeyword = keyword in setFilters ? keyword : equivSetFilterNames[keyword];
    return setFilters[correctKeyword](term, fop(op), false);
  }
  if (keyword in equivColorFilterNames || keyword in colorFilters) {
    const correctKeyword = keyword in colorFilters ? keyword : equivColorFilterNames[keyword];
    const parsedColors = parseColorText(term);
    if (parsedColors == undefined) {
      return makeTrueFilter('', '=');
    }
    // using misc as a color automatically shunts the color search into a misc search
    if (
      Array.isArray(parsedColors) &&
      correctKeyword.slice(0, 4) != 'misc' &&
      parsedColors.includes('Misc')
    ) {
      return colorFilters['misc' + correctKeyword](parsedColors, fop(op));
    }
    return colorFilters[correctKeyword](parsedColors, fop(op));
  }
  return makeNameFilter(unescapeText(text), fop(':'));
};

// TODO: add include:extras handling in the end (going to use checkmark under bar for now)
// todo: add a toSummary method prop to filterObject
