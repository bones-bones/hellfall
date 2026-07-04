import {
  colorSearch,
  isShorthandType,
  looseOpType,
  numFilterFunction,
  numSearch,
  numSearchFilterFunction,
  numSearchListFilterFunction,
  opType,
  shorthandType,
  summaryFunction,
} from '../types';
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

/**
 * Inverts an operator
 * @param op operator to invert
 * @returns the logical inverse of the operator
 */
export const invertOp = (op: looseOpType) => invertedOps[op];

/**
 * Inverts an operator (no loose)
 * @param op operator to invert
 * @returns the logical inverse of the operator
 */
export const invertOpStrict = (op: opType): opType => invertedOps[op] as opType;

/**
 * Get the actual operator, given a loose op and the default op
 * @param operator loose op to use
 * @param defaultOp default op to use
 */
export const getActualOp = (operator: looseOpType, defaultOp: opType): opType => {
  if (operator == ':') {
    return defaultOp;
  }
  if (operator == '!:') {
    return invertOp(defaultOp) as opType;
  }
  return operator;
};
/**
 * Converts an op to a boolean (those that include equals give true; others give false)
 * @param op op to convert
 */
export const opIsNegative = (op: looseOpType) => ['<', '>', '!=', '!:'].includes(op);

type NotFunctionOrObject<T> = T extends Function ? never : T extends object ? never : T;
/**
 * Evaluates a condition using an operator as a boolean
 * @param condition condition to use (excludes functions and objects to prevent syntax mistakes)
 * @param op operator to use
 */
export const opAsBool = <T>(condition: NotFunctionOrObject<T>, op: opType): boolean =>
  !condition != !opIsNegative(op);

/**
 * Given an op, returns `'not'` if it's negative and `''` otherwise
 * @param op op to use
 */
export const opToNot = (op: looseOpType) => (opIsNegative(op) ? 'not' : '');
/**
 * Given an op, returns `"don't"` if it's negative and `''` otherwise
 * @param op op to use
 */
export const opToDont = (op: looseOpType) => (opIsNegative(op) ? "don't" : '');
/**
 * Given an op, returns `"n't"` if it's negative and `''` otherwise
 * @param op op to use
 */
export const opToNt = (op: looseOpType) => (opIsNegative(op) ? "n't" : '');
const opToIncludeSingularRecord: Record<opType, string> = {
  '<': 'excludes',
  '<=': 'excludes or equals',
  '=': 'equals',
  '>=': 'includes',
  '>': "includes but doesn't equal",
  '!=': "doesn't equal",
};
/**
 * Gives a chunk of a singular inclusion summary
 * @param operator operator to use
 * @param value value to use
 * @param invert whether the filter is inverted
 */
export const includeSummarySingular: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) => `${opToIncludeSingularRecord[invert ? invertOpStrict(operator) : operator]} "${value}"`;
const opToIncludePluralRecord: Record<opType, string> = {
  '<': 'exclude',
  '<=': 'exclude or include exactly',
  '=': 'include exactly',
  '>=': 'include',
  '>': 'include but not exactly',
  '!=': 'exclude exactly',
};
/**
 * Gives a chunk of a plural inclusion summary
 * @param operator operator to use
 * @param value value to use
 * @param invert whether the filter is inverted
 */
export const includeSummaryPlural: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) => `${opToIncludePluralRecord[invert ? invertOpStrict(operator) : operator]} "${value}"`;
const opToTaggedRecord: Record<opType, string> = {
  '<': 'not tagged',
  '<=': 'not tagged or tagged exactly',
  '=': 'tagged exactly',
  '>=': 'tagged',
  '>': 'tagged but not exactly',
  '!=': 'not tagged exactly',
};
/**
 * Gives a chunk of a tag summary
 * @param operator operator to use
 * @param value value to use
 * @param invert whether the filter is inverted
 */
export const taggedSummary: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) => `${opToTaggedRecord[invert ? invertOpStrict(operator) : operator]} "${value}"`;

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

/**
 * Gives a chunk of a shorthand summary
 * @param operator operator to use
 * @param value value to use
 */
export const opToShorthand: summaryFunction<shorthandType> = (
  operator: opType,
  value: shorthandType
) => (value == 'c' ? opToCRecord[operator] : opToMRecord[operator]);

const fixValue = <T>(value: T): T => {
  if (typeof value == 'string') {
    return unescapeText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(e => fixValue(e)) as T;
  }
  return value;
};

/**
 * Creates a corrected {@linkcode summaryFunction<T>}
 * @template T the type of the value to use
 * @param correctValue a function that takes the inputted search value and corrects it to one that can be displayed, or returns `undefined` if the value is invalid
 * @param validSummary a {@linkcode summaryFunction<T>} to be used when the value is valid
 * @param invalidSummary a {@linkcode summaryFunction<T>} to be used when the value is invalid; make sure that the first character is `!`
 */
export const createCorrectedSummary =
  <T>(
    correctValue: (value: T) => T | undefined,
    validSummary: summaryFunction<T>,
    invalidSummary: summaryFunction<T>
  ): summaryFunction<T> =>
  (operator: opType, value: T, invert?: boolean) =>
    correctValue(fixValue(value)) != undefined
      ? validSummary(operator, correctValue(fixValue(value)) as T, invert)
      : invalidSummary(operator, value, invert);

export const baseNumSummary: summaryFunction<numSearch> = (
  operator: opType,
  value: numSearch,
  invert?: boolean
) => `${invert ? 'not ' : ''}${operator} ${value}`;
/**
 * Creates a {@linkcode summaryFunction<numSearch>}
 * @param validSummary a string to be used at the start when the value is valid; if omitted, defaults to `''`
 * @param invalidSummary a string to be used when the value is invalid; if omitted, defaults to `'!The value must be a number (or convertible to one)'`
 */
export const createNumSummary =
  (validSummary?: string, invalidSummary?: string): summaryFunction<numSearch> =>
  (operator: opType, value: numSearch, invert?: boolean) =>
    toNumber(value) != undefined
      ? `${validSummary ? `${validSummary} ` : ''}${baseNumSummary(operator, value, invert)}`
      : invalidSummary ?? `!The value must be a number (or convertible to one)`;

/**
 * Creates a {@linkcode summaryFunction<colorSearch>}
 * @param colorSummary a string to be used at the start when the value is an array
 * @param numberSummary a string to be used at the start when the value is a number
 * @param shortSummary a string to be used at the end when the value is a shorthand
 */
export const createColorSummary =
  (
    colorSummary: string,
    numberSummary: string,
    shortSummary?: string
  ): summaryFunction<colorSearch> =>
  (operator: opType, value: colorSearch, invert?: boolean) => {
    if (Array.isArray(value)) {
      return `the ${colorSummary} ${shortSummary ? 'is' : 'are'} ${
        invert ? 'not ' : ''
      }${operator} ${value.join('')}`;
    }
    if (typeof value == 'number') {
      return `the number of ${numberSummary} is ${invert ? 'not ' : ''}${operator} ${value}`;
    }
    if (isShorthandType(value)) {
      return `the cards${invert ? (shortSummary ? " don't" : "n't") : ''}${
        shortSummary ? ` have ${opToShorthand(operator, value) == 'any color' ? '' : 'a'}` : ''
      } ${opToShorthand(operator, value)} ${shortSummary}`;
    }
    return `!Unknown color "${value}"`;
  };

/**
 * Creates a {@linkcode summaryFunction<T>}
 * @template T the type of the value to use
 * @param valueIsCorrect a function that takes the inputted search value and checks if it is valid
 * @param validSummary a {@linkcode summaryFunction<T>} to be used when the value is valid
 * @param invalidSummary a {@linkcode summaryFunction<T>} to be used when the value is invalid; make sure that the first character is `!`
 */
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
 * @template T the type of the first value to check
 * @template S the type of the second value to check
 * @param op operator to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
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
 * @template T the type of the first value to check
 * @template S the type of the second value to check
 * @param op operator to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const containsOp = <T, S>(
  op: opType,
  contains: (value1: T | S, value2: T | S) => boolean,
  value1: T,
  value2: S
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
 * To use in filters when need to check a sharing function
 * @template T the type of the first value to check
 * @template S the type of the second value to check
 * @param op operator to use
 * @param shares sharing function
 * @param value1 the first value to check
 * @param value2 the second value to check
 */
export const shareOp = <T, S>(
  op: opType,
  shares: (value1: T, value2: S) => boolean,
  value1: T,
  value2: S
): boolean => {
  switch (op) {
    case '<':
      return !shares(value1, value2);
    case '<=':
      return shares(value1, value2);
    case '=':
      return shares(value1, value2);
    case '>=':
      return shares(value1, value2);
    case '>':
      return !shares(value1, value2);
    case '!=':
      return !shares(value1, value2);
  }
};

/**
 * To use in filters when need to compare two numbers
 * @param value1 the first value to check
 * @param operator operator to use
 * @param value2 the second value to check
 */
export const numFilter: numFilterFunction = (value1: number, operator: opType, value2: number) => {
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

/**
 * To use in filters when need to compare two numbers or values that can be converted to them
 * @param value1 the first value to check
 * @param operator operator to use
 * @param value2 the second value to check
 */
export const numSearchFilter: numSearchFilterFunction = (
  value1: numSearch,
  operator: opType,
  value2: numSearch
) => {
  const num1 = toNumber(value1);
  const num2 = toNumber(value2);
  if (num1 == undefined || num2 == undefined) {
    return false;
  }
  return numFilter(num1, operator, num2);
};

/**
 * To use in filters when need to compare a list of numbers or values that can be converted to them and a value of that kind
 * @param value1 the first value to check
 * @param operator operator to use
 * @param value2 the second value to check
 */
export const numSearchListFilter: numSearchListFilterFunction = (
  value1: numSearch[],
  operator: opType,
  value2: numSearch
) => value1.some(value => numSearchFilter(value, operator, value2));
