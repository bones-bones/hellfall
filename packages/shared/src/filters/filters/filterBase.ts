import {
  listsShare,
  textContains,
  textEquals,
  textListContains,
  textListIncludes,
  toNumber,
} from '@hellfall/shared/utils';
import {
  numFilterFunction,
  numSearch,
  numSearchFilterFunction,
  numSearchListFilterFunction,
  opType,
  regexFilterFunction,
  regexListFilterFunction,
  summaryFunction,
  textFilterFunction,
  textListFilterFunction,
  textListsFilterFunction,
} from '../types';
import {
  includeEqualsOp,
  invertOpStrict,
  opAsBool,
  opToDoesnt,
  opToDont,
  opXorInvert,
  regexErrorMessage,
} from '../utils';

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

/**
 * Compares text from a card with a regex from a search
 * @param value1 text from the card
 * @param operator operator to use
 * @param value2 regex from the search
 */
export const regexFilter: regexFilterFunction = (
  value1: string,
  operator: opType,
  value2: RegExp
) => opAsBool(value2.test(value1), operator);

/**
 * Compares a text list from a card with a regex from a search
 * @param value1 text list from the card
 * @param operator operator to use
 * @param value2 regex from the search
 */
export const regexListFilter: regexListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: RegExp
) =>
  opAsBool(
    value1.some(value => value2.test(value)),
    operator
  );

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
 * Gives a chunk of a singular regex summary
 * @param operator operator to use
 * @param value value to use
 * @param invert whether the filter is inverted
 */
export const regexSummarySingular: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) => {
  const errorMessage = regexErrorMessage(value);
  if (errorMessage) {
    return `!Invalid regular expression: ${errorMessage}`;
  }
  return `${opToDoesnt(operator, invert)} match${
    opXorInvert(operator, invert) ? 'es' : ''
  } the regex /${value}/`;
};

/**
 * Gives a chunk of a plural regex summary
 * @param operator operator to use
 * @param value value to use
 * @param invert whether the filter is inverted
 */
export const regexSummaryPlural: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) => {
  const errorMessage = regexErrorMessage(value);
  if (errorMessage) {
    return `!Invalid regular expression: ${errorMessage}`;
  }
  return `${opToDont(operator, invert)} match the regex /${value}/`;
};

/**
 * Returns the appropriate summary for a prop filter.
 * @param isPlural whether the prop is plural
 * @param isRegex whether the value is a regex
 */
export const propSummary = (isPlural?: boolean, isRegex?: boolean): summaryFunction<string> =>
  isRegex
    ? isPlural
      ? regexSummaryPlural
      : regexSummarySingular
    : isPlural
    ? includeSummaryPlural
    : includeSummarySingular;

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
