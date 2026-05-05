import { HCCard, HCLegalitiesField } from '@hellfall/shared/types';
import { getAllNames } from '../getNames';
import {
  filterColorIdentity,
  filterColorList,
  filterColors,
  filterHybridIdentity,
} from './filterColors';
import { filterNumberString, filterNumberStringList } from './filterNumber';
import { filterObject, CardStringFilter, SetFilter } from './filterObject';
import { filterSetBoth, filterSetCard, filterSetToken } from './filterSet';
import { filterId, filterLore, filterTag, filterText, filterTextList } from './filterText';
import { looseOpType } from './types';
import { filterBanned, filterLegal, filterNotLegal } from './filterLegality';
import { filterHas, filterIs } from './filterIs';
import { filterAnyLayout, filterCardLayout, filterFaceLayout } from './filterPropValue';

export const equivNames: Record<string, string> = {
  s: 'set',
  ts: 'tokenset',
  b: 'block',
  cardid: 'id',
  name: 'n',
  m: 'mana',
  cost: 'mana',
  manacost: 'mana',
  t: 'type',
  o: 'oracle',
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
  kw: 'keyword',
  // powtou:'pt',
  cardlayout: 'layout',
};

export const makeSetFilter = (value: string, op: looseOpType, includeExtras: boolean) => {
  return new SetFilter('set', filterSetCard, value, op, '=', includeExtras);
};
export const makeTokenSetFilter = (value: string, op: looseOpType, includeExtras: boolean) => {
  return new SetFilter('tokenset', filterSetToken, value, op, '=', includeExtras);
};
export const makeBlockFilter = (value: string, op: looseOpType, includeExtras: boolean) => {
  return new SetFilter('block', filterSetBoth, value, op, '=', includeExtras);
};

export const makeIDFilter = (value: string, op: looseOpType) => {
  return new filterObject<string, string>('id', filterId, value, op, '>=', card => card.id);
};

export const makeNameFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('name', filterTextList, value, op, '>=', card =>
    getAllNames(card)
  );
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('mana', filterTextList, value, op, '>=', card =>
    card.toFaces().map(e => e.mana_cost)
  );
};

export const makeTypeFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('type', filterTextList, value, op, '>=', card => [
    ...card.toFaces().flatMap(e => e.supertypes || []),
    ...card.toFaces().flatMap(e => e.types || []),
    ...card.toFaces().flatMap(e => e.subtypes || []),
    ...card.toFaces().map(e => e.type_line),
  ]);
};
export const makeSupertypeFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('supertype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.supertypes || []),
        ...(e.supertypes && e.supertypes.length > 1 ? [e.supertypes.join(' ')] : []),
      ])
  );
};
export const makeMaintypeFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('maintype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.types || []),
        ...(e.types && e.types.length > 1 ? [e.types.join(' ')] : []),
      ])
  );
};
export const makeSubtypeFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('subtype', filterTextList, value, op, '>=', card =>
    card
      .toFaces()
      .flatMap(e => [
        ...(e.subtypes || []),
        ...(e.subtypes && e.subtypes.length > 1 ? [e.subtypes.join(' ')] : []),
      ])
  );
};
export const makeOracleFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('oracle', filterTextList, value, op, '>=', card =>
    card.toFaces().map(e => e.oracle_text)
  );
};
export const makeFlavorFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('flavor', filterTextList, value, op, '>=', card =>
    card.toFaces().flatMap(e => e.flavor_text ?? [])
  );
};
export const makeLoreFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('lore', filterLore, value, op, '=');
};

export const makeCreatorFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '>=',
    card => card.creators ?? []
  );
};
export const makeArtistFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'artist',
    filterTextList,
    value,
    op,
    '>=',
    card => card.artists ?? []
  );
};
export const makeKeywordFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '=',
    card => card.keywords
  );
};
export const makeTagFilter = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'tag',
    filterTag,
    value,
    op,
    '>=',
    card => card.tags ?? []
  );
};
export const makeCollectorNumberFilter = (value: string, op: looseOpType) => {
  return new filterObject<string | undefined, string>(
    'number',
    filterNumberString,
    value,
    op,
    '=',
    card => card.collector_number
  );
};
export const makeManaValueFilter = (value: string, op: looseOpType) => {
  return new filterObject<number, string>(
    'manavalue',
    filterNumberString,
    value,
    op,
    '=',
    card => card.mana_value
  );
};
export const makePowerFilter = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'power',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.power ?? [])
  );
};
export const makeToughnessFilter = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'toughness',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.toughness ?? [])
  );
};

export const makeLoyaltyFilter = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'loyalty',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.loyalty ?? [])
  );
};

export const makeDefenseFilter = (value: string, op: looseOpType) => {
  return new filterObject<(string | undefined)[], string>(
    'defense',
    filterNumberStringList,
    value,
    op,
    '=',
    card => card.toFaces().flatMap(e => e.defense ?? [])
  );
};

export const makeColorFilter = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[], string[] | number>(
    'color',
    filterColors,
    value,
    op,
    '=',
    card => card.colors
  );
};
export const makeIndicatorFilter = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[][] | undefined, string[] | number>(
    'indicator',
    filterColorList,
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
export const makeIdentityFilter = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[], string[] | number>(
    'identity',
    filterColorIdentity,
    value,
    op,
    '=',
    card => card.color_identity
  );
};
export const makeHybridFilter = (value: string[] | number, op: looseOpType) => {
  return new filterObject<string[][], string[] | number>(
    'hybrid',
    filterHybridIdentity,
    value,
    op,
    '=',
    card => card.color_identity_hybrid
  );
};

export const makeLegalFilter = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'legal',
    filterLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeNotLegalFilter = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'notlegal',
    filterNotLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeBannedFilter = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'banned',
    filterBanned,
    value,
    op,
    '=',
    card => card.legalities
  );
};
export const makeIsFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('is', filterIs, value, op, '=');
};
export const makeHasFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('has', filterHas, value, op, '=');
};
export const makeCardLayoutFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('layout', filterCardLayout, value, op, '=');
};
export const makeFaceLayoutFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('facelayout', filterFaceLayout, value, op, '=');
};
export const makeAnyLayoutFilter = (value: string, op: looseOpType) => {
  return new CardStringFilter('anylayout', filterAnyLayout, value, op, '=');
};
