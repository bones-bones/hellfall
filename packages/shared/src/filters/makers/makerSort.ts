import { sortType, dirType } from '../types';
import { sortMaker, SortObject } from '../makerLib';

/**
 * Makes a {@linkcode SortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 * @param useTypes whether to use card types for color sort
 */
export const makeSort: sortMaker = (sort: sortType, dir: dirType, useTypes?:boolean) => {
  return new SortObject(sort, dir, useTypes);
};
