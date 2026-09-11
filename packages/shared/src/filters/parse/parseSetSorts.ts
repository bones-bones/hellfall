import { unescapeText } from '@hellfall/shared/utils';
import { makeSetSort } from '../makers';
import { dirTypeList, dirType, setSortType, setSortTypeList } from '../types';
import { SetSortObject } from '../makerLib';

const isSort = (text: string): text is setSortType => setSortTypeList.includes(text as setSortType);
const isDir = (text: string): text is dirType =>
  dirTypeList.includes(unescapeText(text) as dirType);
const parseSetSort = (text: string): { sort?: setSortType; dir?: dirType } => {
  if (isSort(text)) {
    return { sort: text };
  }
  if (isDir(text)) {
    return { dir: text };
  }
  if (text.includes(',')) {
    const [sort, dir] = text.split(',', 2);
    if (isSort(sort) && isDir(dir)) return { sort, dir };
  }
  return {};
};

/**
 * Parses a list of strings into a list of {@linkcode SetSortObject | SetSortObjects}.
 * This is not for use with a query, but rather for use with inputs on the frontend
 * @param sortList a list of strings to parse; they must have already passed {@linkcode sortIsValid}
 */
export const parseSetSorts = (sortList: string[]): SetSortObject[] => {
  const sortObs: SetSortObject[] = [];
  for (let i = 0; i < sortList.length; i++) {
    const term = sortList[i];
    const { sort, dir } = parseSetSort(term);
    if (sort && dir) {
      sortObs.push(makeSetSort(sort, dir));
    } else if (sort) {
      if (i < sortList.length - 1) {
        const dir = sortList[i + 1];
        if (isDir(dir)) {
          sortObs.push(makeSetSort(sort, dir));
          i++;
          continue;
        }
      }
      sortObs.push(makeSetSort(sort, 'auto'));
    } else if (dir) {
      if (i < sortList.length - 1) {
        const sort = sortList[i + 1];
        if (isSort(sort)) {
          sortObs.push(makeSetSort(sort, dir));
          i++;
          continue;
        }
      }
      sortObs.push(makeSetSort('auto', dir));
    }
  }
  return sortObs;
};

const bucketers = ['date', 'block'];

const isConflict = (sort: string, other: string) => sort == other; // if they are the same

/**
 * Winnows a list of {@linkcode SetSortObject | SetSortObjects} by removing those that can't have any effect
 * @param sortList a list of sort objects to winnow
 */
export const winnowSetSortObjects = (
  sortList: SetSortObject[]
): {
  /**
   * The portion of the `sortList` parameter that can actually have an effect
   */
  sortList: SetSortObject[];
  /**
   * The portion of the `sortList` parameter that can't actually have an effect
   */
  winnowed: SetSortObject[];
} => {
  const winnowed: SetSortObject[] = [];
  const winnow = (index: number) => winnowed.unshift(...sortList.splice(index, 1));
  const hasConflict = (index: number) => {
    const sort = sortList[index].sort;
    if (!setSortTypeList.includes(sort) || !dirTypeList.includes(sortList[index].dir)) {
      return true;
    }
    for (let i = index - 1; i >= 0; i--) {
      const other = sortList[i].sort;
      if (other == 'auto') {
        continue;
      }
      // if the other has a conflict, winnow it
      if (isConflict(sort, other)) {
        return true;
      }
      if (!bucketers.includes(other)) {
        return true;
      }
    }
    return false;
  };
  for (let i = sortList.length - 1; i >= 0; i--) {
    const sort = sortList[i].sort;
    if ((sort == 'auto' && sortList.length > 1) || hasConflict(i)) {
      winnow(i);
    }
  }
  return { sortList, winnowed };
};

/**
 * Given a list of {@linkcode SetSortObject | SetSortObjects}, returns the options
 * for {@linkcode setSortType} that can have an effect, if any
 * @param sortList list of sort objects to use
 */
export const getWinnowedSetSortOptions = (sortList: SetSortObject[]): setSortType[] => {
  const options = [...setSortTypeList];
  const hasConflict = (sort: string, other: string) => {
    // if the other has a conflict, winnow it
    if (isConflict(sort, other)) {
      return true;
    }
    if (!bucketers.includes(sort)) {
      return true;
    }
    return false;
  };
  sortList.forEach(obj => {
    const sort = obj.sort;
    for (let i = options.length - 1; i >= 0; i--) {
      if (hasConflict(sort, options[i])) {
        options.splice(i, 1);
      }
    }
  });
  return options;
};

/**
 * Parses input sorts and removes ones that can't have an effect
 * @param inputSorts strings for sorts from inputs; must be formatted as `sort,dir`
 */
export const parseAndWinnowSetSorts = (
  inputSorts: string[]
): {
  /**
   * The sort list to use
   */
  sortList: SetSortObject[];
  /**
   * The new list for `inputSorts`; used when syncing the url
   */
  newInputs: string[];
} => {
  const inputs = parseSetSorts(inputSorts);
  const { sortList } = winnowSetSortObjects(inputs);
  const newInputs = sortList.map(input => `${input.sort},${input.dir}`);
  return { sortList, newInputs };
};
