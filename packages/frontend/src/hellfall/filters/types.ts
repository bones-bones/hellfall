import { HCCard, HCColors } from '@hellfall/shared/types';

export type opType = '<' | '<=' | '=' | '>=' | '>' | '!=';
export type looseOpType = ':' | opType;

/**
 * The first type is the type of the entry. The second type is the type from the search query.
 */
export interface cardFilter<T = any, S = any> {
  (value1: T, operator: looseOpType, value2: S): boolean;
  defaultOp: opType;
}
export interface textFilter extends cardFilter<string, string> {}
export interface textListFilter extends cardFilter<string[], string> {}
export interface textRecordFilter extends cardFilter<Record<string, string>, [string, string]> {}
const invertedOps: Record<opType, opType> = {
  '<': '>=',
  '<=': '>',
  '=': '!=',
  '>=': '<',
  '>': '<=',
  '!=': '=',
};
export const invertOp = (op: opType) => {
  return invertedOps[op];
};
export interface numFilter extends cardFilter<number, number> {}
export interface numStringFilter
  extends cardFilter<number | string | undefined, number | string | undefined> {}
export interface numStringListFilter
  extends cardFilter<(number | string | undefined)[], number | string> {}
export interface colorContentFilter extends cardFilter<string[], string[]> {}
export interface colorFilter extends cardFilter<string[], string[] | number> {}
export interface colorContentListFilter extends cardFilter<string[][] | undefined, string[]> {}
export interface colorListFilter extends cardFilter<string[][] | undefined, string[] | number> {}
export interface hybridContentFilter extends cardFilter<string[][], string[]> {}
export interface hybridFilter extends cardFilter<string[][], string[] | number> {}
// export interface setFilter extends cardFilter<string[],HCCard.Any> {}
export interface setFilter extends cardFilter<HCCard.Any, string> {
  (value1: HCCard.Any, operator: looseOpType, value2: string, includeExtraSets: boolean): boolean;
}
export interface setListFilter extends cardFilter<HCCard.Any, string[]> {
  (value1: HCCard.Any, operator: looseOpType, value2: string[], includeExtraSets: boolean): boolean;
}
export interface tagFilter extends cardFilter<string[], string> {
  (
    value1: string[],
    operator: looseOpType,
    value2: string,
    tag_notes?: Record<string, string>
  ): boolean;
}
/**
 * To use in filters when need to check a function
 * @param op operation to use
 * @param func function
 * @param value the value to check
 * @returns
 */
export const funcOp = (op: opType, func: (value: any) => boolean, value: any) => {
  switch (op) {
    case '<':
      return !func(value);
    case '<=':
      return func(value);
    case '=':
      return func(value);
    case '>=':
      return func(value);
    case '>':
      return !func(value);
    case '!=':
      return !func(value);
  }
};

/**
 * To use in filters when need to check an inclusion function and an equality function
 * @param op operation to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const includeEqualsOp = (
  op: opType,
  includes: (value1: any, value2: any) => boolean,
  equals: (value1: any, value2: any) => boolean,
  value1: any,
  value2: any
) => {
  switch (op) {
    case '<':
      return !includes(value1, value2) && !equals(value1, value2);
    case '<=':
      return !includes(value1, value2) || equals(value1, value2);
    case '=':
      return includes(value1, value2) && equals(value1, value2);
    case '>=':
      return includes(value1, value2) || equals(value1, value2);
    case '>':
      return includes(value1, value2) && !equals(value1, value2);
    case '!=':
      return !includes(value1, value2) || !equals(value1, value2);
  }
};
/**
 * To use in filters when need to check a containment function
 * @param op operation to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const containsOp = (
  op: opType,
  contains: (value1: any, value2: any) => boolean,
  value1: any,
  value2: any
) => {
  switch (op) {
    case '<': {
      return !contains(value1, value2) && contains(value2, value1);
    }
    case '<=': {
      return contains(value2, value1);
    }
    case '=': {
      return contains(value1, value2) && contains(value2, value1);
    }
    case '>=': {
      return contains(value1, value2);
    }
    case '>': {
      return contains(value1, value2) && !contains(value2, value1);
    }
    case '!=': {
      return !contains(value1, value2) || !contains(value2, value1);
    }
  }
};
