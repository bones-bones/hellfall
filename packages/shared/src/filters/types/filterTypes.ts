import { HCCard, HCLegalitiesField, HCRelatedCard, SetCode } from '@hellfall/shared/types';
export const NOPRINT =
  'This should not ever print. Please report this as a bug on discord along with the search terms you used.';
/**
 * The type of an operator
 */
export type opType = '<' | '<=' | '=' | '>=' | '>' | '!=';
export const looseOpList: looseOpType[] = [':', '!:', '<', '<=', '=', '>=', '>', '!='];
/**
 * The type of an operator, including loose operators
 */
export type looseOpType = ':' | '!:' | opType;
export const invertOptions = ['ignore', 'flip', 'negate'] as const;
/**
 * The option for how to handle the inversion operator
 *
 * ignore: object ignores the inversion operator
 *
 * flip: object inverts the operator before passing it in
 *
 * negate: object negates the filter's output; filter requires `invert` to be passed to summary function
 */
export type invertOptionType = (typeof invertOptions)[number];

/**
 * A function that produces a summary for a filter
 */
export type summaryFunction<T> = (operator: opType, value: T, invert?: boolean) => string;

/**
 * Any filter
 */
export interface anyFilter<T = any, S = any> {
  /**
   * The result of calling this filter
   */
  (value1: T, operator: opType, value2: S): number | boolean | undefined;
  /**
   * How to handle inversion of this filter
   */
  invertOption: invertOptionType;
  /**
   * The function that produces a summary of this filter
   */
  toSummary: summaryFunction<S>;
}
export const dirs = ['asc', 'desc', 'auto'] as const;
/**
 * a sort direction option
 */
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
/**
 * a sort option
 */
export type sortType = (typeof sorts)[number];

/**
 * a sort filter
 */
export interface sortFilter extends anyFilter<HCCard.Any, HCCard.Any> {
  /**
   * The result of calling this. This is suitable to be used in a `.sort` function
   */
  (value1: HCCard.Any, operator: opType, value2: HCCard.Any): number;
  /**
   * The sort option to use
   */
  sort: sortType;
  /**
   * The direction to sort the cards
   */
  dir: dirType;
}

/**
 * Any card filter
 *
 * The first type is the type of the entry. The second type is the type from the search query.
 */
export interface cardFilter<T = any, S = any> extends anyFilter {
  (value1: T, operator: opType, value2: S): boolean | undefined;
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
export const inclusionOptions = [
  'extras',
  'nonextras',
  'all',
  'extracards',
  'tokens',
  'vetoed',
] as const;
export type inclusionType = (typeof inclusionOptions)[number];
export interface includeFilter extends cardFilter<HCCard.Any, string> {
  (value1: HCCard.Any, operator: opType, value2: string): boolean | undefined;
}
export interface legalFilter extends cardFilter<HCLegalitiesField, string> {}
export interface cardStringFilter extends cardFilter<HCCard.Any, string> {}
export interface printsFilter extends cardFilter<HCCard.Any[], string> {}
export interface setFilter extends cardFilter<HCCard.Any, SetCode> {}
export interface noteFilter extends cardFilter<HCCard.Any, string> {
  (value1: HCCard.Any, operator: opType, value2: string, note?: boolean | string):
    | boolean
    | undefined;
  toSummary: (operator: opType, value: string, invert?: boolean, note?: boolean | string) => string;
}

export interface relatedFilter extends cardFilter<HCRelatedCard[], string> {}
