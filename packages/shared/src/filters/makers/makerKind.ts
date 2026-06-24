import { filterKind } from '../filters';
import { PassThroughSummaryFilter, looseOpType, filterMaker } from '../types';

export const makeKindFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string, string>(
    'kind',
    filterKind,
    value,
    op,
    '=',
    card => card.kind
  );
};
