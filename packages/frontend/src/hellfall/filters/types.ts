import { HCCard, HCColors, HCLegalitiesField } from '@hellfall/shared/types';
import { filterObject, SetFilter } from './filterObject';

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
export const invertOp = (op: looseOpType) => {
  return op == ':' ? op : invertedOps[op];
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
export interface legalFilter extends cardFilter<HCLegalitiesField, string> {}
export interface setListFilter extends cardFilter<HCCard.Any, string[]> {
  (value1: HCCard.Any, operator: looseOpType, value2: string[], includeExtraSets: boolean): boolean;
}
export interface cardStringFilter extends cardFilter<HCCard.Any, string> {}
export interface tagFilter extends cardFilter<string[], string> {
  (
    value1: string[],
    operator: looseOpType,
    value2: string,
    tag_notes?: Record<string, string>
  ): boolean;
}
/**
 * To use in filters when need to check a function with one value
 * @param op operation to use
 * @param func function
 * @param value the value to check
 * @returns
 */
export const funcOp = <T>(op: opType, func: (value: T) => boolean, value: T) => {
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
 * To use in filters when need to check a function with two values
 * @param op operation to use
 * @param func function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const funcOpTwo = <T, S>(
  op: opType,
  func: (value1: T, value2: S) => boolean,
  value1: T,
  value2: S
) => {
  switch (op) {
    case '<':
      return !func(value1, value2);
    case '<=':
      return func(value1, value2);
    case '=':
      return func(value1, value2);
    case '>=':
      return func(value1, value2);
    case '>':
      return !func(value1, value2);
    case '!=':
      return !func(value1, value2);
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
export const includeEqualsOp = <T, S>(
  op: opType,
  includes: (value1: T, value2: S) => boolean,
  equals: (value1: T, value2: S) => boolean,
  value1: T,
  value2: S
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
export const containsOp = <T>(
  op: opType,
  contains: (value1: T, value2: T) => boolean,
  value1: T,
  value2: T
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

const share = (value1: string | string[], value2: string | string[]) => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.some(value => value2.includes(value));
  } else if (Array.isArray(value1) && typeof value2 == 'string') {
    return value1.includes(value2);
  } else if (Array.isArray(value2) && typeof value1 == 'string') {
    return value2.includes(value1);
  } else {
    return value1 == value2;
  }
};

/**
 * To use in filters when need to check if two lists share a value
 * @param op operation to use
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const shareOp = (op: opType, value1: string | string[], value2: string | string[]) => {
  switch (op) {
    case '<':
      return !share(value1, value2);
    case '<=':
      return share(value1, value2);
    case '=':
      return share(value1, value2);
    case '>=':
      return share(value1, value2);
    case '>':
      return !share(value1, value2);
    case '!=':
      return !share(value1, value2);
  }
};
export type filterMaker = (value: string, op: looseOpType) => filterObject<any, string>;
export type setFilterMaker = (value: string, op: looseOpType, includeExtras: boolean) => SetFilter;
export type colorFilterMaker = (
  value: string[] | number,
  op: looseOpType
) => filterObject<any, string[] | number>;
