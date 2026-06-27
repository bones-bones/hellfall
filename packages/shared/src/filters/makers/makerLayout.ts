import { getFromAll, getFromFaces } from '@hellfall/shared/utils';
import { filterAnyLayout, filterCardLayout, filterFaceLayout } from '../filters';
import { PassThroughSummaryFilter, looseOpType, filterMaker } from '../types';

export const makeCardLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('layout', filterCardLayout, value, op, '=', card => [
    card.layout,
  ]);
};
export const makeFaceLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('facelayout', filterFaceLayout, value, op, '=', card =>
    getFromFaces(card, 'layout')
  );
};
export const makeAnyLayoutFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('anylayout', filterAnyLayout, value, op, '=', card =>
    getFromAll(card, 'layout')
  );
};
