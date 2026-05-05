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
import { colorFilterMaker, filterMaker, invertOp, looseOpType, setFilterMaker } from './types';
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
export const makeMaintypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>('maintype', filterTextList, value, op, '>=', card =>
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
  return new CardStringFilter('is', filterIs, value, invertOp(op), '!=');
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
