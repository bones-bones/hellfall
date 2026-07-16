import { summaryFunction } from '../types';
import { InvalidFilter, invalidMaker } from '../utils';

/**
 * Makes an invalid filter
 * @param value the value to display as unknown
 * @param op dummy
 */
export const makeInvalidFilter: invalidMaker = (
  value: string,
  summaryStart?: string | summaryFunction<string>
) => {
  return new InvalidFilter('invalid', summaryStart, value);
};
/**
 * Makes an invalid sort filter
 * @param value the sort choice to display as unknown
 * @param op dummy
 */
export const makeInvalidSortFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidsort', 'sort choice', `"${value}"`);
};
/**
 * Makes an invalid keyword filter
 * @param value the keyword to display as unknown
 * @param op dummy
 */
export const makeInvalidKeywordFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidkeyword', 'keyword', `"${value}"`);
};
/**
 * Makes an invalid color filter
 * @param value the color to display as unknown
 * @param op dummy
 */
export const makeInvalidColorFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidcolor', 'color', `"${value}"`);
};
// export const makeInvalidIncludeFilter: invalidMaker= (value: string, op: looseOpType) => {
//   return new InvalidFilter('invalidinclude', `"${value}"`, 'include');
// };
