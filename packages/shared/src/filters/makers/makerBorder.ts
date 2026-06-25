import { filterBorder } from '../filters';
import { looseOpType, PassThroughSummaryFilter, filterMaker } from '../types';

export const makeBorderFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string, string>(
    'border',
    filterBorder,
    value,
    op,
    '=',
    card => card.border_color
  );
};
