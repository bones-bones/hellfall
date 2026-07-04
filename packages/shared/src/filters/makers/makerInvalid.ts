import { looseOpType, filterMaker, InvalidFilter } from '../types';

export const makeInvalidFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalid', '!Unknown', value, op);
};
export const makeInvalidSortFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidsort', '!Unknown sort choice', value, op);
};
export const makeInvalidKeywordFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidkeyword', '!Unknown keyword', value, op);
};
export const makeInvalidColorFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new InvalidFilter('invalidcolor', '!Unknown color', value, op);
};
// export const makeInvalidIncludeFilter: filterMaker<string>= (value: string, op: looseOpType) => {
//   return new InvalidFilter('invalidinclude', '!Unknown include', value, op);
// };
