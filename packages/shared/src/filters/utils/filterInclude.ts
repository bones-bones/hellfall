import { HCCard } from '@hellfall/shared/types';
import { canBeInDecks, extraSetList, unescapeText } from '@hellfall/shared/utils';
import {
  includeFilterFunction,
  inclusionType,
  isInclusionType,
  opType,
  summaryFunction,
} from '../types';
import { createCorrectedSummary } from './filterUtils';

const inclusionNicknames: Record<string, inclusionType> = {
  a: 'all',
  e: 'extras',
  extra: 'extras',
  ec: 'extracards',
  extracard: 'extracards',
  t: 'tokens',
  token: 'tokens',
  ne: 'nonextras',
  nonextra: 'nonextras',
  v: 'vetoed',
  veto: 'vetoed',
  d: 'drop',
  dropped: 'drop',
};

const includeToSummary: Record<inclusionType, string> = {
  all: 'all cards',
  extras: 'all extras',
  extracards: 'extra cards',
  tokens: 'tokens',
  nonextras: 'nonextras',
  vetoed: 'vetoed cards',
  drop: 'dropped faces',
};

export const correctInclude = (value: string): string | undefined =>
  isInclusionType(value) ? value : inclusionNicknames[value];
const validSummary: summaryFunction<string> = (operator, value, invert) =>
  `${invert ? 'ex' : 'in'}cluding ${includeToSummary[value as inclusionType]}`;
const invalidSummary: summaryFunction<string> = (operator, value, invert) =>
  `!Unknown ${invert ? 'ex' : 'in'}clusion option "${value}"`;

/**
 * The summary for an inclusion filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const includeSummary: summaryFunction<string> = createCorrectedSummary(
  correctInclude,
  validSummary,
  invalidSummary
);

/**
 * Compares a card with an inclusion criterion
 * @param value1 card to use
 * @param operator dummy
 * @param value2 inclusion criterion
 */
export const includeFilter: includeFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string
) => {
  switch (correctInclude(unescapeText(value2))) {
    case 'all':
      return true;
    case 'extras':
      return extraSetList.includes(value1.set);
    case 'extracards':
      return extraSetList.includes(value1.set) && canBeInDecks(value1);
    case 'tokens':
      return !canBeInDecks(value1);
    case 'nonextras':
      return !extraSetList.includes(value1.set);
    case 'vetoed':
      return value1.set.includes('HCV');
  }
  return true;
};
