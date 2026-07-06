import { filterSort } from '../filters';
import { SortObject, sortType, dirType, sortMaker } from '../types';

/**
 * Makes a {@linkcode SortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 */
export const makeSort: sortMaker = (sort: sortType, dir: dirType) => {
  return new SortObject('sort', filterSort, sort, dir);
};
