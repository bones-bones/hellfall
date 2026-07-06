import { sortType, dirType } from '../types';
import { sortMaker, SortObject } from '../utils';

/**
 * Makes a {@linkcode SortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 */
export const makeSort: sortMaker = (sort: sortType, dir: dirType) => {
  return new SortObject(sort, dir);
};
