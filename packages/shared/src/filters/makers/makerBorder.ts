import { borderFilter, borderSummary } from '../filters';
import { looseOpType, filterObject, filterMaker } from '../types';

export const makeBorderFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'border',
    borderFilter,
    borderSummary,
    value,
    op,
    card => card.border_color
  );
};
