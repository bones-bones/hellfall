import { getFromAll } from '@hellfall/shared/utils';
import {
  cardFrameFilter,
  frameFilter,
  frameEffectFilter,
  showcaseFilter,
  cardFrameSummary,
  frameEffectSummary,
  frameSummary,
  showcaseSummary,
} from '../filters';
import { filterObject, looseOpType, filterMaker } from '../types';

export const makeCardFrameFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject('cardframe', cardFrameFilter, cardFrameSummary, value, op, card => [
    ...getFromAll(card, 'frame'),
    ...(card.frame ?? []),
  ]);
};
export const makeFrameEffectFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'frameeffect',
    frameEffectFilter,
    frameEffectSummary,
    value,
    op,
    card => [...getFromAll(card, 'frame_effects'), ...(card.frame_effects ?? [])]
  );
};
export const makeFrameFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject('frame', frameFilter, frameSummary, value, op, card =>
    [...getFromAll(card, 'frame'), ...(card.frame ?? [])].concat([
      ...getFromAll(card, 'frame_effects'),
      ...(card.frame_effects ?? []),
    ])
  );
};
export const makeShowcaseFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject(
    'showcase',
    showcaseFilter,
    showcaseSummary,
    value,
    op,
    card => card.tag_notes?.['showcase-frame'].split(', ') ?? []
  );
};
