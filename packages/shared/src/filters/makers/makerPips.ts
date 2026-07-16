import { HCCardSymbol } from '../../types';
import { getCostsFromFaces, pipMap, pipSearch } from '../../utils';
import { manaSummary, pipListFilter } from '../filters';
import { looseOpType } from '../types';
import { PipFilter, pipFilterMaker } from '../utils';

const fixCosts = (value: string[]) => {
  const filtered = value.filter(Boolean);
  if (filtered.length) {
    return filtered;
  }
  return [''];
};

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
    (card, dropFaces) => fixCosts(getCostsFromFaces(card, dropFaces)).map(pipMap.getPipsFromText)
  );
};
