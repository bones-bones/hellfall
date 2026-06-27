import { HCCard, isSetType } from '@hellfall/shared/types';
import {
  equivRelNames,
  equivSetTypes,
  filterHas,
  filterIs,
  toCardLayout,
  toFaceLayout,
} from '../filters';
import { makeHasRelatedFilter, makeIsRelatedFilter } from './makerRelated';
import { makeIsUniqueFilter } from './makerPrints';
import { makeSetTypeFilter } from './makerSet';
import { CardStringFilter, looseOpType, stateFilterMaker } from '../types';
import { makeCardFrameFilter, makeFrameEffectFilter } from './makerFrame';
import { makeCardLayoutFilter, makeFaceLayoutFilter } from './makerLayout';
import { unescapeText } from '../utils';

const cardFramesToParse = ['old', 'new'];
const frameEffectsToParse = [
  'full',
  'fullart',
  'extended',
  'extendedart',
  'vertical',
  'verticalart',
  'noart',
  'showcase',
  'etched',
  'borderless',
  'colorshifted',
  'ub',
  'universesbeyond',
];
const layoutsToIgnore = ['modal', 'token', 'meld_part', 'meld_result', 'meld', 'draftpartner'];

export const makeIsFilter: stateFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  const correct = unescapeText(value);
  if (correct in equivRelNames) {
    return makeIsRelatedFilter(value, op);
  }
  if (correct == 'unique') {
    return makeIsUniqueFilter(value, op, getValueToCompare);
  }
  if (isSetType(correct) || isSetType(equivSetTypes[correct])) {
    return makeSetTypeFilter(value, op);
  }
  if (cardFramesToParse.includes(correct)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(correct)) {
    return makeFrameEffectFilter(value, op);
  }
  if (value in toCardLayout && !layoutsToIgnore.includes(correct)) {
    return makeCardLayoutFilter(value, op);
  }
  return new CardStringFilter('is', filterIs, value, op, '=');
};
export const makeHasFilter: stateFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  const correct = unescapeText(value);
  if (correct in equivRelNames) {
    return makeHasRelatedFilter(value, op);
  }
  if (correct == 'unique') {
    return makeIsUniqueFilter(value, op, getValueToCompare);
  }
  if (isSetType(correct) || isSetType(equivSetTypes[correct])) {
    return makeSetTypeFilter(value, op);
  }
  if (cardFramesToParse.includes(correct)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(correct)) {
    return makeFrameEffectFilter(value, op);
  }
  if (value in toFaceLayout && !layoutsToIgnore.includes(correct)) {
    return makeFaceLayoutFilter(value, op);
  }
  return new CardStringFilter('has', filterHas, value, op, '=');
};
