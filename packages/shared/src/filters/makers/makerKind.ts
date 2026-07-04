import { kindFilter, kindSummary } from '../filters';
import { filterObject, looseOpType, filterMaker } from '../types';

export const makeKindFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'kind',
    kindFilter,
    kindSummary,
    value,
    op,
    card => card.kind
  );
};
