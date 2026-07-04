import { emptyFilter, emptySummary } from '../filters';
import { looseOpType, filterMaker, InvalidFilter } from '../types';

export const makeInvalidFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalid', emptyFilter, '!Unknown', value, op);
};
export const makeInvalidSortFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidsort', emptyFilter, '!Unknown sort choice', value, op);
};
export const makeInvalidKeywordFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidkeyword', emptyFilter, '!Unknown keyword', value, op);
};
export const makeInvalidColorFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidcolor', emptyFilter, '!Unknown color', value, op);
};
// export const makeInvalidIncludeFilter: filterMaker<string>= (value: string, op: looseOpType) => {
//   return new InvalidFilter(
//     'invalidinclude',
//     filterEmpty,
//     '!Unknown include',
//     value,
//     op,
//   );
// };
