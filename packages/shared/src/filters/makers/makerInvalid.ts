import { filterEmpty } from '../filters';
import { filterObject, looseOpType, filterMaker } from '../types';

export const makeInvalidFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalid',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown "${value}"`
  );
};
export const makeInvalidSortFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidsort',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown sort choice "${value}"`
  );
};
export const makeInvalidKeywordFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidkeyword',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown keyword "${value}"`
  );
};
export const makeInvalidColorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'invalidcolor',
    filterEmpty,
    value,
    op,
    '>=',
    card => '',
    () => `!Unknown color "${value}"`
  );
};
// export const makeInvalidIncludeFilter: filterMaker = (value: string, op: looseOpType) => {
//   return new filterObject<string, string>(
//     'invalidinclude',
//     filterEmpty,
//     value,
//     op,
//     '>=',
//     card => '',
//     () => `!Unknown include "${value}"`
//   );
// };
