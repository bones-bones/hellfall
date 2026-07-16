import { HCCardSymbol } from '../../types';
import { getCostsFromFaces, pipMap, pipSearch } from '../../utils';
import { manaSummary, pipListFilter } from '../filters';
import { looseOpType } from '../types';
import { PipFilter, pipFilterMaker } from '../utils';

/**
 * Makes a color filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCostFilter: pipFilterMaker<HCCardSymbol[][]> = (
  value: pipSearch,
  op: looseOpType
) => {
  return new PipFilter<HCCardSymbol[][]>(
    'mana',
    pipListFilter,
    manaSummary,
    value,
    op,
    (card, dropFaces) =>
      getCostsFromFaces(card, dropFaces).filter(Boolean).map(pipMap.getPipsFromText)
  );
};
