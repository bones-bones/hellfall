import { getFromAll } from '@hellfall/shared/utils';
import { filterCardFrame, filterFrame, filterFrameEffect, filterShowcase } from '../filters';
import { PassThroughSummaryFilter, looseOpType, filterMaker } from '../types';

export const makeCardFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('cardframe', filterCardFrame, value, op, '=', card => [
    ...getFromAll(card, 'frame'),
    ...(card.frame ?? []),
  ]);
};
export const makeFrameEffectFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('frameeffect', filterFrameEffect, value, op, '=', card => [
    ...getFromAll(card, 'frame_effects'),
    ...(card.frame_effects ?? []),
  ]);
};
export const makeFrameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter('frame', filterFrame, value, op, '=', card =>
    [...getFromAll(card, 'frame'), ...(card.frame ?? [])].concat([
      ...getFromAll(card, 'frame_effects'),
      ...(card.frame_effects ?? []),
    ])
  );
};
export const makeShowcaseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter(
    'showcase',
    filterShowcase,
    value,
    op,
    '=',
    card => card.tag_notes?.['showcase-frame'].split(', ') ?? []
  );
};
