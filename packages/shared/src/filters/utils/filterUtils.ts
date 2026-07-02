import { looseOpType, opType, shorthandType, summaryFunction } from '../types';
import { listsOrValuesShare, toNumber } from '@hellfall/shared/utils';
import { unescapeText } from './parseUtils';

const invertedOps: Record<looseOpType, looseOpType> = {
  '<': '>=',
  '<=': '>',
  '=': '!=',
  ':': '!:',
  '>=': '<',
  '>': '<=',
  '!=': '=',
  '!:': ':',
};

export const invertOp = (op: looseOpType) => {
  return invertedOps[op];
};

export const getActualOp = (operator: looseOpType, defaultOp: opType): opType => {
  if (operator == ':') {
    return defaultOp;
  }
  if (operator == '!:') {
    return invertOp(defaultOp) as opType;
  }
  return operator;
};
export const opIsNegative = (op: looseOpType) => ['<', '>', '!=', '!:'].includes(op);

export const opAsBool = (condition: any, op: opType): boolean => !condition != !opIsNegative(op);

export const opToNot = (op: looseOpType) => (opIsNegative(op) ? 'not' : '');
export const opToDont = (op: looseOpType) => (opIsNegative(op) ? "don't" : '');
export const opToNt = (op: looseOpType) => (opIsNegative(op) ? "n't" : '');
const opToIncludeSingularRecord: Record<opType, string> = {
  '<': 'excludes',
  '<=': 'excludes or equals',
  '=': 'equals',
  '>=': 'includes',
  '>': "includes but doesn't equal",
  '!=': "doesn't equal",
};
export const opToIncludeSingular = (op: opType, value: string, invert?: boolean) => {
  return `${opToIncludeSingularRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};
const opToIncludePluralRecord: Record<opType, string> = {
  '<': 'exclude',
  '<=': 'exclude or include exactly',
  '=': 'include exactly',
  '>=': 'include',
  '>': 'include but not exactly',
  '!=': 'exclude exactly',
};
export const opToIncludePlural = (op: opType, value: string, invert?: boolean) => {
  return `${opToIncludePluralRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};
const opToTaggedRecord: Record<opType, string> = {
  '<': 'not tagged',
  '<=': 'not tagged or tagged exactly',
  '=': 'tagged exactly',
  '>=': 'tagged',
  '>': 'tagged but not exactly',
  '!=': 'not tagged exactly',
};
export const opToTagged = (op: opType, value: string, invert?: boolean) => {
  return `${opToTaggedRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};

const opToMRecord: Record<opType, string> = {
  '<': 'monocolored',
  '<=': 'any color',
  '=': 'multicolored',
  '>=': 'multicolored',
  '>': 'supermulticolored',
  '!=': 'monocolored',
};
const opToCRecord: Record<opType, string> = {
  '<': 'negative color',
  '<=': 'colorless',
  '=': 'colorless',
  '>=': 'any color',
  '>': 'colored',
  '!=': 'colored',
};

export const opToShorthand = (op: opType, value: shorthandType) => {
  return value == 'c' ? opToCRecord[op] : opToMRecord[op];
};
const fixValue = <T>(value: T): T => {
  if (typeof value == 'string') {
    return unescapeText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(e => fixValue(e)) as T;
  }
  return value;
};
export const createCorrectedSummary =
  <T>(
    correctValue: (value: T) => T | undefined,
    validSummary: summaryFunction<T>,
    invalidSummary: summaryFunction<T>
  ): summaryFunction<T> =>
  (operator: opType, value: T, invert?: boolean) =>
    correctValue(fixValue(value))
      ? validSummary(operator, correctValue(fixValue(value)) as T, invert)
      : invalidSummary(operator, value, invert);
export const createNumSummary =
  (validSummary?: string, invalidSummary?: string): summaryFunction<number | string | undefined> =>
  (operator: opType, value: number | string | undefined, invert?: boolean) =>
    toNumber(value) != undefined
      ? `${validSummary ? `${validSummary} ` : ''}${invert ? 'not ' : ''}${operator} ${value}`
      : invalidSummary ?? `!The value must be a number (or convertible to one)`;
export const createSummary =
  <T>(
    valueIsCorrect: (value: T) => boolean | undefined,
    validSummary: summaryFunction<T>,
    invalidSummary: summaryFunction<T>
  ): summaryFunction<T> =>
  (operator: opType, value: T, invert?: boolean) =>
    (valueIsCorrect(fixValue(value)) ? validSummary : invalidSummary)(operator, value, invert);

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
  includes: (value1: T, value2: S) => boolean | undefined,
  equals: (value1: T, value2: S) => boolean | undefined,
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

/**
 * To use in filters when need to check a containment function
 * @param op operation to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const canContainOp = <T>(
  op: opType,
  contains: (value1: T | T[], value2: T | T[]) => boolean,
  value1: T | T[],
  value2: T | T[]
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

/**
 * To use in filters when need to check if two lists share a value
 * @param op operation to use
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const shareOp = <T = any>(op: opType, value1: T | T[], value2: T | T[]): boolean => {
  switch (op) {
    case '<':
      return !listsOrValuesShare(value1, value2);
    case '<=':
      return !!listsOrValuesShare(value1, value2);
    case '=':
      return !!listsOrValuesShare(value1, value2);
    case '>=':
      return !!listsOrValuesShare(value1, value2);
    case '>':
      return !listsOrValuesShare(value1, value2);
    case '!=':
      return !listsOrValuesShare(value1, value2);
  }
};

export const numOp = (value1: number, operator: opType, value2: number): boolean => {
  switch (operator) {
    case '<':
      return value1 < value2;
    case '<=':
      return value1 <= value2;
    case '=':
      return value1 == value2;
    case '>=':
      return value1 >= value2;
    case '>':
      return value1 > value2;
    case '!=':
      return value1 != value2;
  }
};
export const numStringOp = (
  value1: number | string | undefined,
  operator: opType,
  value2: number | string | undefined
): boolean => {
  const num1 = toNumber(value1);
  const num2 = toNumber(value2);
  if (num1 == undefined || num2 == undefined) {
    return false;
  }
  return numOp(num1, operator, num2);
};
