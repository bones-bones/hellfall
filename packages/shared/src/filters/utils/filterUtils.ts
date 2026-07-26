import { looseOpType, numSearch, opType, summaryFunction } from '../types';
import {
  colorSearch,
  isShorthandType,
  shorthandType,
  toNumber,
  xor,
  fixValue,
  xnor,
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

/**
 * Converts an op and an invert to a boolean (those that include equals give true; others give false)
 * @param op op to convert
 * @param invert invert to convert
 */
export const opXorInvert = (op: looseOpType, invert?: boolean) => xnor(opIsNegative(op), invert);

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
 * Given an op and possibly an invert, returns `"don't"` if it's negative and `''` otherwise
 * @param op op to use
 * @param inver whether the filter is inverted
 */
export const opToDont = (op: looseOpType, invert?: boolean) =>
  opXorInvert(op, invert) ? '' : "don't";
/**
 * Given an op, returns `"n't"` if it's negative and `''` otherwise
 * @param op op to use
 */
export const opToNt = (op: looseOpType) => (opIsNegative(op) ? "n't" : '');
/**
 * Given an op and possibly an invert, returns `"doesn't"` if it's negative and `''` otherwise
 * @param op op to use
 * @param inver whether the filter is inverted
 */
export const opToDoesnt = (operator: opType, invert?: boolean) =>
  opXorInvert(operator, invert) ? '' : "doesn't";
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
