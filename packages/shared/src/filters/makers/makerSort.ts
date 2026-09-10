import { sortType, dirType, setSortType } from '../types';
import { setSortMaker, SetSortObject, sortMaker, SortObject } from '../makerLib';

/**
 * Makes a {@linkcode SortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 */
export const makeSort: sortMaker = (sort: sortType, dir: dirType) => {
  return new SortObject(sort, dir);
};

/**
 * Makes a {@linkcode SetSortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 */
export const makeSetSort: setSortMaker = (sort: setSortType, dir: dirType) => {
  return new SetSortObject(sort, dir);
};
