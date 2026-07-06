import {
  equivRelNames,
  hasFilter,
  hasSummary,
  isFilter,
  isSummary,
  toCardLayoutRecord,
  toFaceLayoutRecord,
  toSetType,
} from '../filters';
import { makeHasRelatedFilter, makeIsRelatedFilter } from './makerRelated';
import { StateFilter, looseOpType, stateFilterMaker } from '../types';
import { unescapeText } from '../utils';
import {
  makeCardFrameFilter,
  makeCardLayoutFilter,
  makeFaceLayoutFilter,
  makeFrameEffectFilter,
  makeSetTypeFilter,
} from './makerText';

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

/**
 * Makes a filter that checks if a card is a certain state
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeIsFilter: stateFilterMaker = (value: string, op: looseOpType) => {
  const correct = unescapeText(value);
  if (correct in equivRelNames) {
    return makeIsRelatedFilter(value, op);
  }
  if (toSetType(correct)) {
    return makeSetTypeFilter(value, op);
  }
  if (cardFramesToParse.includes(correct)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(correct)) {
    return makeFrameEffectFilter(value, op);
  }
  if (correct in toCardLayoutRecord && !layoutsToIgnore.includes(correct)) {
    return makeCardLayoutFilter(value, op);
  }
  return new StateFilter('is', isFilter, isSummary, value, op);
};
/**
 * Makes a filter that checks if a card has a certain state
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeHasFilter: stateFilterMaker = (value: string, op: looseOpType) => {
  const correct = unescapeText(value);
  if (correct in equivRelNames) {
    return makeHasRelatedFilter(value, op);
  }
  if (toSetType(correct)) {
    return makeSetTypeFilter(value, op);
  }
  if (cardFramesToParse.includes(correct)) {
    return makeCardFrameFilter(value, op);
  }
  if (frameEffectsToParse.includes(correct)) {
    return makeFrameEffectFilter(value, op);
  }
  if (correct in toFaceLayoutRecord && !layoutsToIgnore.includes(correct)) {
    return makeFaceLayoutFilter(value, op);
  }
  return new StateFilter('has', hasFilter, hasSummary, value, op);
};
