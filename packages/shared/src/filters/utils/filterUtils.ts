import {
  looseOpType,
  numFilterFunction,
  numSearch,
  numSearchFilterFunction,
  numSearchListFilterFunction,
  opType,
  summaryFunction,
  textFilterFunction,
  textListFilterFunction,
  textListsFilterFunction,
} from '../types';
import {
  colorSearch,
  isShorthandType,
  shorthandType,
  listsShare,
  textContains,
  textEquals,
  textListContains,
  textListIncludes,
  toNumber,
  xor,
  fixValue,
} from '@hellfall/shared/utils';
import { isFormat } from '@hellfall/shared/types';

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
 * @param operator operator to invert
 * @returns the logical inverse of the operator
 */
export const invertOpStrict = (operator: opType): opType => invertedOps[operator] as opType;

/**
 * Get the actual operator, given a loose op and the default op
 * @param operator loose op to use
 * @param defaultOp default op to use
 */
export const getActualOp = (op: looseOpType, defaultOp: opType): opType => {
  if (op == ':') {
    return defaultOp;
  }
  if (op == '!:') {
    return invertOp(defaultOp) as opType;
  }
  return op;
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
 * @param operator operator to use
 */
export const opAsBool = <T>(condition: NotFunctionOrObject<T>, operator: opType): boolean =>
  xor(condition, opIsNegative(operator));

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
const opToShorthand: summaryFunction<shorthandType> = (operator: opType, value: shorthandType) =>
  value == 'c' ? opToCRecord[operator] : opToMRecord[operator];

/**
 * Creates a corrected {@linkcode summaryFunction<T>}
 * @template T the type of the value to use
 * @param correctValue a function that takes the inputted search value and corrects
 * it to one that can be displayed, or returns `undefined` if the value is invalid
 * @param validSummary a {@linkcode summaryFunction<T>} to be used when the value is valid
 * @param invalidSummary a {@linkcode summaryFunction<T>} to be used when the value
 * is invalid; make sure that the first character is `!`
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
/**
 * Creates a corrected {@linkcode summaryFunction<T>}
 * @template T the type of the value to use
 * @param correctValue a function that takes the inputted search value and corrects
 * it to one that can be displayed, or returns `undefined` if the value is invalid
 * @param usingFirst a function that takes the inputted search value and outputs a value
 * that determines which of two summaries is used
 * @param validSummary a {@linkcode summaryFunction<T>} to be used when the value is valid
 * @param invalidSummary a {@linkcode summaryFunction<T>} to be used when the value
 * is invalid; make sure that the first character is `!`
 */

export const createCorrectedDoubleSummary =
  <T>(
    correctValue: (value: T) => T | undefined,
    usingFirst: (value: T) => boolean | undefined,
    validSummary: summaryFunction<T>,
    invalidSummary: summaryFunction<T>
  ): summaryFunction<T> =>
  (operator: opType, value: T) =>
    correctValue(fixValue(value)) != undefined
      ? validSummary(operator, correctValue(fixValue(value)) as T, usingFirst(fixValue(value)))
      : invalidSummary(operator, value);

/**
 * The base number summary function. Handles operators and invert
 * @param operator operator to use
 * @param value value to use
 * @param invert whether to invert it
 * @returns
 */
export const baseNumSummary: summaryFunction<numSearch> = (
  operator: opType,
  value: numSearch,
  invert?: boolean
) => `${invert ? 'not ' : ''}${operator} ${value}`;
/**
 * Creates a {@linkcode summaryFunction<numSearch>}
 * @param validSummary a string to be used at the start when the value is valid
 * @param forceValid whether to force the valid string to be used
 * @param invalidSummary a string to be used when the value is invalid; if
 * omitted, defaults to `'!The value must be a number (or convertible to one)'`
 */
export const createNumSummary =
  (
    validSummary: string,
    forceValid?: boolean,
    invalidSummary?: string
  ): summaryFunction<numSearch> =>
  (operator: opType, value: numSearch, invert?: boolean) =>
    toNumber(value) != undefined || forceValid
      ? `${validSummary} ${baseNumSummary(operator, value, invert)}`
      : invalidSummary ?? `!The value must be a number (or convertible to one)`;
/**
 * Creates a {@linkcode summaryFunction<string>} for use in invalid filter objects
 * @param summaryStart a string to be used at the start after `!Unknown`
 */
export const createInvalidSummary =
  (summaryStart?: string): summaryFunction<string> =>
  (operator: opType, value: string) =>
    `!Unknown ${summaryStart ? `${summaryStart} ` : ''} ${value}`;

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
    if (isShorthandType(value)) {
      return `the cards${shortSummary ? '' : ' are'}${
        invert ? (shortSummary ? " don't" : "n't") : ''
      }${
        shortSummary ? ` have ${opToShorthand(operator, value) == 'any color' ? '' : 'a'}` : ''
      } ${opToShorthand(operator, value)} ${shortSummary ?? ''}`;
    }
    if (!Array.isArray(value) && typeof value != 'number') {
      return `!Unknown color "${value}"`;
    }
    const isNum = typeof value == 'number';
    return createNumSummary(
      `the ${isNum ? `number of ${numberSummary}` : colorSummary} ${
        shortSummary || isNum ? 'is' : 'are'
      }`,
      true
    )(operator, isNum ? value : value.join(''), invert);
  };

/**
 * Creates a {@linkcode summaryFunction<T>}
 * @template T the type of the value to use
 * @param valueIsCorrect a function that takes the inputted search value
 * and checks if it is valid
 * @param validSummary a {@linkcode summaryFunction<T>} to be used when the value is valid
 * @param invalidSummary a {@linkcode summaryFunction<T>} to be used when the value
 * is invalid; make sure that the first character is `!`
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
 * Creates a {@linkcode summaryFunction<string>} for use in a legality filter
 * @param legality legality to check for
 */
export const createLegalitySummary = (legality: string) =>
  createSummary(
    isFormat,
    (operator, value) => `it's ${opToNot(operator)} ${legality} in ${value}`,
    (operator, value) => `!Unknown format "${value}"`
  );

/**
 * Compares a value from a card with a value from a search
 * using an inclusion function and an equality function
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 * @param includes the inclusion function to use
 * @param equals the equality function to use
 * @param value1 the value from the card
 * @param value2 the value from the search
 */
export const includeEqualsOp = <T, S>(
  operator: opType,
  includes: (value1: T, value2: S) => boolean | undefined,
  equals: (value1: T, value2: S) => boolean | undefined,
  value1: T,
  value2: S
) => {
  switch (operator) {
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
 * Compares a value from a card with a value from a search
 * using a containment function
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 * @param operator the operator to use
 * @param contains the containment function to use
 * @param value1 the value from the card
 * @param value2 the value from the search
 */
export const containsOp = <T, S>(
  operator: opType,
  contains: (value1: T | S, value2: T | S) => boolean,
  value1: T,
  value2: S
) => {
  switch (operator) {
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
 * Compares a value from a card with a value from a search
 * using a containment function and an equality function
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 * @param contains the containment function to use
 * @param equals the equality function to use
 * @param value1 the value from the card
 * @param value2 the value from the search
 */
export const containEqualsOp = <T, S>(
  operator: opType,
  contains: (value1: T | S, value2: T | S) => boolean,
  equals: (value1: T, value2: S) => boolean | undefined,
  value1: T,
  value2: S
) => {
  switch (operator) {
    case '<':
      return containsOp(operator, contains, value1, value2);
    case '<=':
      return containsOp(operator, contains, value1, value2);
    case '=':
      return containsOp(operator, contains, value1, value2);
    case '>=':
      return containsOp(operator, contains, value1, value2);
    case '>':
      return containsOp(operator, contains, value1, value2);
    case '!=':
      return containsOp(operator, contains, value1, value2);
  }
};

/**
 * To use in filters when need to check a sharing function
 * @template T the type of the first value to check
 * @template S the type of the second value to check
 * @param operator operator to use
 * @param shares sharing function
 * @param value1 the first value to check
 * @param value2 the second value to check
 */
// export const shareOp = <T, S>(
//   operator: opType,
//   shares: (value1: T, value2: S) => boolean,
//   value1: T,
//   value2: S
// ): boolean => {
//   switch (op) {
//     case '<':
//       return !shares(value1, value2);
//     case '<=':
//       return shares(value1, value2);
//     case '=':
//       return shares(value1, value2);
//     case '>=':
//       return shares(value1, value2);
//     case '>':
//       return !shares(value1, value2);
//     case '!=':
//       return !shares(value1, value2);
//   }
// };

/**
 * Compares a number from a card with a number from a search
 * @param value1 number from the card
 * @param operator operator to use
 * @param value2 number from the search
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
 * Compares a value from a card with a value from a search
 * @param value1 value from the card
 * @param operator operator to use
 * @param value2 value from the search
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
 * Compares a list of values from a card with a value from a search
 * @param value1 list of values from the card
 * @param operator operator to use
 * @param value2 value from the search
 */
export const numSearchListFilter: numSearchListFilterFunction = (
  value1: numSearch[],
  operator: opType,
  value2: numSearch
) => value1.some(value => numSearchFilter(value, operator, value2));

/**
 * Compares text from a card with text from a search
 * @param value1 text from the card
 * @param operator operator to use
 * @param value2 text from the search
 */
export const textFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  includeEqualsOp(operator, textContains, textEquals, value1, value2);

/**
 * Compares a text list from a card with a text list from a search for equality
 * @param value1 text from the card
 * @param operator operator to use
 * @param value2 text from the search
 */
export const textEqualsFilter: textFilterFunction = (
  value1: string,
  operator: opType,
  value2: string
) => opAsBool(textEquals(value1, value2), operator);

/**
 * Compares a text list from a card with text from a search
 * @param value1 text list from the card
 * @param operator operator to use
 * @param value2 text from the search
 */
export const textListFilter: textListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: string
) => includeEqualsOp(operator, textListContains, textListIncludes, value1, value2);

/**
 * Compares a text list from a card with a text list from a search
 * to see if they share any members
 * @param value1 text list from the card
 * @param operator operator to use
 * @param value2 text list from the search
 */
export const shareFilter: textListsFilterFunction = <T extends string>(
  value1: string[],
  operator: opType,
  value2: T[]
) => opAsBool(listsShare(value1, value2), operator);

/**
 * Empty filter that always returns true for use in invalids
 * @param value1 dummy
 * @param operator dummy
 * @param value2 dummy
 * @returns `true`
 */
export const emptyFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  true;
