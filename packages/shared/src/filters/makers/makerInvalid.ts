import { summaryFunction } from '../types';
import { InvalidFilter, invalidMaker } from '../utils';

/**
 * Makes an invalid filter
 * @param value the value to display as unknown
 */
export const makeInvalidFilter: invalidMaker = (
  value: string,
  summaryStart?: string | summaryFunction<string>
) => {
  return new InvalidFilter('invalid', summaryStart, value);
};
/**
 * Makes an invalid unique filter
 * @param value the unique mode to display as unknown
 */
export const makeInvalidUniqueFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidunique', 'unique mode', `"${value}"`);
};
/**
 * Makes an invalid display filter
 * @param value the display mode to display as unknown
 */
export const makeInvalidDisplayFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invaliddisplay', 'display mode', `"${value}"`);
};
/**
 * Makes an invalid preference filter
 * @param value the preference mode to display as unknown
 */
export const makeInvalidPreferFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidprefer', 'preference mode', `"${value}"`);
};
/**
 * Makes an invalid sort filter
 * @param value the sort choice to display as unknown
 */
export const makeInvalidSortFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidsort', 'sort choice', `"${value}"`);
};
/**
 * Makes an invalid keyword filter
 * @param value the keyword to display as unknown
 */
export const makeInvalidKeywordFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidkeyword', 'keyword', `"${value}"`);
};
/**
 * Makes an invalid color filter
 * @param value the color to display as unknown
 */
export const makeInvalidColorFilter: invalidMaker = (value: string) => {
  return new InvalidFilter('invalidcolor', 'color', `"${value}"`);
};
// export const makeInvalidIncludeFilter: invalidMaker= (value: string, op: looseOpType) => {
//   return new InvalidFilter('invalidinclude', `"${value}"`, 'include');
// };
