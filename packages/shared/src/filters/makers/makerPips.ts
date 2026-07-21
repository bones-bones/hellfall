import { HCCardSymbol } from '@hellfall/shared/types';
import { getFixedCostsFromFaces, pipMap, pipSearch } from '@hellfall/shared/utils';
import { manaSummary, manaListFilter, devotionFilter, devotionSummary } from '../filters';
import { looseOpType } from '../types';
import { ComparisonFilter, comparisonFilterMaker, PipFilter, pipFilterMaker } from '../utils';

/**
 * Makes a color filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeManaFilter: pipFilterMaker<HCCardSymbol[][]> = (
  value: pipSearch,
  op: looseOpType
) => {
  return new PipFilter<HCCardSymbol[][]>(
    'mana',
    manaListFilter,
    manaSummary,
    value,
    op,
    (card, dropFaces) => getFixedCostsFromFaces(card, dropFaces).map(pipMap.getPipsFromText)
  );
};

/**
 * Makes a {@linkcode ComparisonFilter} for a devotion search
 * @param value1 the first value from the search
 * @param op the operator from the search
 * @param value2 the second value from the search, if any
 */
export const makeDevotionFilter: comparisonFilterMaker = (
  value1: string,
  op: looseOpType,
  value2?: string
) => {
  return new ComparisonFilter(
    'devotion',
    devotionFilter,
    devotionSummary,
    value1,
    op,
    value2,
    '>='
  );
};
