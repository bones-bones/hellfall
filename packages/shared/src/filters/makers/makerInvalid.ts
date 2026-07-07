import { looseOpType } from '../types';
import { filterMaker, InvalidFilter } from '../utils';

/**
 * Makes an invalid filter
 * @param value the value to display as unknown
 * @param op dummy
 */
export const makeInvalidFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalid', undefined, value);
};
/**
 * Makes an invalid sort filter
 * @param value the sort choice to display as unknown
 * @param op dummy
 */
export const makeInvalidSortFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidsort', 'sort choice', value);
};
/**
 * Makes an invalid keyword filter
 * @param value the keyword to display as unknown
 * @param op dummy
 */
export const makeInvalidKeywordFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidkeyword', 'keyword', value);
};
/**
 * Makes an invalid color filter
 * @param value the color to display as unknown
 * @param op dummy
 */
export const makeInvalidColorFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidcolor', 'color', value);
};
// export const makeInvalidIncludeFilter: filterMaker<string>= (value: string, op: looseOpType) => {
//   return new InvalidFilter('invalidinclude', value, 'include');
// };
