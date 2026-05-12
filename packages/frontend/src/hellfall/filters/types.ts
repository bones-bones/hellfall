import { HCCard, HCColor, HCColors, HCLegalitiesField } from '@hellfall/shared/types';
import { filterObject, IncludeFilter, sortObject } from './filterObject';
export const NOPRINT =
  'This should not ever print. Please report this as a bug on discord along with the search terms you used.';
export type opType = '<' | '<=' | '=' | '>=' | '>' | '!=';
export const looseOpList: looseOpType[] = [':', '!:', '<', '<=', '=', '>=', '>', '!='];
export type looseOpType = ':' | '!:' | opType;
export const invertOptions = ['ignore', 'flip', 'negate'] as const;
/**
 * ignore: object ignores the inversion operator
 *
 * flip: object inverts the operator before passing it in
 *
 * negate: object negates the filter's output; filter requires `invert` to be passed to summary function
 */
export type invertOptionType = (typeof invertOptions)[number];
export interface anyFilter<T = any, S = any> {
  (value1: T, operator: opType, value2: S): number | boolean;
  invertOption: invertOptionType;
  toSummary: (operator: opType, value: S, invert?: boolean) => string;
}
export const dirs = ['asc', 'desc', 'auto'] as const;
export type dirType = (typeof dirs)[number];
export const sorts = [
  'set',
  'color',
  'manavalue',
  'name',
  'id',
  'number',
  'setnumber',
  'colormanavalue',
  'auto',
] as const;
export type sortType = (typeof sorts)[number];

export interface sortFilter extends anyFilter<HCCard.Any, HCCard.Any> {
  (value1: HCCard.Any, operator: opType, value2: HCCard.Any): number;
  sort: sortType;
  dir: dirType;
}

/**
 * The first type is the type of the entry. The second type is the type from the search query.
 */
export interface cardFilter<T = any, S = any> extends anyFilter {
  (value1: T, operator: opType, value2: S): boolean;
}

export interface textFilter extends cardFilter<string, string> {}
export interface textListFilter extends cardFilter<string[], string> {}
export interface textRecordFilter extends cardFilter<Record<string, string>, [string, string]> {}
export interface numFilter extends cardFilter<number, number> {}
export interface numStringFilter
  extends cardFilter<number | string | undefined, number | string | undefined> {}
export interface numStringListFilter
  extends cardFilter<(number | string | undefined)[], number | string> {}
export const shorthandList = ['c', 'm'] as const;
export type shorthandType = (typeof shorthandList)[number];
const multiOpToNum: Record<opType, number> = {
  '<': 2,
  '<=': 0,
  '=': 2,
  '>=': 2,
  '>': 5,
  '!=': 2,
};
export const shortToNum = (op: opType, value: shorthandType) => {
  if (value == 'c') {
    return 0;
  } else {
    return multiOpToNum[op];
  }
};
export const shortToOp: Record<shorthandType, opType> = {
  c: '=',
  m: '>=',
};
export interface colorContentFilter extends cardFilter<string[], string[]> {}
export interface colorNumFilter extends cardFilter<string[], number> {}
export interface colorShortFilter extends cardFilter<string[], shorthandType> {}
export interface colorContentListFilter extends cardFilter<string[][], string[]> {}
export interface colorNumListFilter extends cardFilter<string[][], number> {}
export interface colorShortListFilter extends cardFilter<string[][], shorthandType> {}
export interface hybridContentFilter extends cardFilter<string[][], string[]> {}
export interface hybridNumFilter extends cardFilter<string[][], number> {}
export interface hybridShortFilter extends cardFilter<string[][], shorthandType> {}
// export interface setFilter extends cardFilter<string[],HCCard.Any> {}
export const inclusionOptions = ['extras', 'nonextras', 'all'] as const;
export type inclusionType = (typeof inclusionOptions)[number];
export interface includeFilter extends cardFilter<HCCard.Any, string> {
  (value1: HCCard.Any, operator: opType, value2: string): boolean;
}
export interface legalFilter extends cardFilter<HCLegalitiesField, string> {}
export interface cardStringFilter extends cardFilter<HCCard.Any, string> {}
export interface tagFilter extends cardFilter<string[], string> {
  (value1: string[], operator: opType, value2: string, tag_notes?: Record<string, string>): boolean;
}

export type filterMaker = (value: string, op: looseOpType) => filterObject<any, string>;
export type includeFilterMaker = (value: string, op: looseOpType) => IncludeFilter;
export type colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => filterObject<any, string[]> | filterObject<any, number> | filterObject<any, shorthandType>;
export type sortMaker = (sort: sortType, dir: dirType) => sortObject;
