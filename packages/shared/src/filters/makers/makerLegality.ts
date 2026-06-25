import { HCLegalitiesField } from '@hellfall/shared/types';
import { PassThroughSummaryFilter, looseOpType, filterMaker } from '../types';
import { filterBanned, filterLegal, filterNotLegal } from '../filters';

export const makeLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'legal',
    filterLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};

export const makeNotLegalFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'notlegal',
    filterNotLegal,
    value,
    op,
    '=',
    card => card.legalities
  );
};

export const makeBannedFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<HCLegalitiesField, string>(
    'banned',
    filterBanned,
    value,
    op,
    '=',
    card => card.legalities
  );
};
