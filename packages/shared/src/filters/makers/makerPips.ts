import { HCCardSymbol } from '@hellfall/shared/types';
import { getFixedCostsFromFaces, pipMap, pipSearch } from '@hellfall/shared/utils';
import { manaSummary, manaListFilter } from '../filters';
import { looseOpType } from '../types';
import { DevotionFilter, devotionFilterMaker, PipFilter, pipFilterMaker } from '../makerLib';

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
 * Makes a {@linkcode DevotionFilter}
 * @param value1 the first value from the search
 * @param op the operator from the search
 * @param value2 the second value from the search, if any
 */
export const makeDevotionFilter: devotionFilterMaker = (
  value1: string,
  op: looseOpType,
  value2?: string
) => {
  return new DevotionFilter(value1, op, value2);
};
