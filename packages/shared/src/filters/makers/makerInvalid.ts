import { looseOpType, filterMaker, InvalidFilter } from '../types';

/**
 * Makes an invalid filter
 * @param value dummy
 * @param op dummy
 */
export const makeInvalidFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalid');
};
/**
 * Makes an invalid sort filter
 * @param value dummy
 * @param op dummy
 */
export const makeInvalidSortFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidsort', 'sort choice');
};
/**
 * Makes an invalid keyword filter
 * @param value dummy
 * @param op dummy
 */
export const makeInvalidKeywordFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidkeyword', 'keyword');
};
/**
 * Makes an invalid color filter
 * @param value dummy
 * @param op dummy
 */
export const makeInvalidColorFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidcolor', 'color');
};
// export const makeInvalidIncludeFilter: filterMaker<string>= (value: string, op: looseOpType) => {
//   return new InvalidFilter('invalidinclude', value, 'include');
// };
