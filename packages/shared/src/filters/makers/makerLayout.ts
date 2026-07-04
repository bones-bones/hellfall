import { getFromAll, getFromFaces } from '@hellfall/shared/utils';
import {
  anyLayoutFilter,
  anyLayoutSummary,
  cardLayoutFilter,
  cardLayoutSummary,
  faceLayoutFilter,
  faceLayoutSummary,
} from '../filters';
import { filterObject, looseOpType, filterMaker } from '../types';

export const makeCardLayoutFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'layout',
    cardLayoutFilter,
    cardLayoutSummary,
    value,
    op,
    card => [card.layout]
  );
};
export const makeFaceLayoutFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'facelayout',
    faceLayoutFilter,
    faceLayoutSummary,
    value,
    op,
    card => getFromFaces(card, 'layout')
  );
};
export const makeAnyLayoutFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'anylayout',
    anyLayoutFilter,
    anyLayoutSummary,
    value,
    op,
    card => getFromAll(card, 'layout')
  );
};
