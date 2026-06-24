import { filterSort } from '../filters';
import { sortObject, sortType, dirType, sortMaker } from '../types';

export const makeSort: sortMaker = (sort: sortType, dir: dirType) => {
  return new sortObject('sort', filterSort, sort, dir);
};
