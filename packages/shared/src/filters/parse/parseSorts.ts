import { unescapeText } from '@hellfall/shared/utils';
import { makeSort } from '../makers';
import { dirTypeList, dirType, sortTypeList, sortType, equivSortAndFilterNames } from '../types';
import { splitOnFirstOp } from '../utils';
import { SortObject } from '../makerLib';

/**
 * This should only really have combo sorts explicitly declared here.
 * Single sorts almost certainly also have a corresponding filter,
 * so their redirects should go in {@linkcode equivSortAndFilterNames}
 */
const sortRedirects: Record<string, sortType> = {
  ...equivSortAndFilterNames,
  setcn: 'setnumber',
  setnum: 'setnumber',
  setao: 'setaccepted',
  setaccept: 'setaccepted',
  setacceptorder: 'setaccepted',
  setacceptedorder: 'setaccepted',
  colormv: 'colormanavalue',
  colorcmc: 'colormanavalue',
  review: 'colormanavalue',
  setreview: 'colormanavalue',
};
const dirRedirects: Record<string, dirType> = {
  a: 'asc',
  up: 'asc',
  u: 'asc',
  d: 'desc',
  down: 'desc',
};

const doubleRedirects: Record<string, { sort: sortType; dir: dirType }> = {
  newest: { sort: 'date', dir: 'desc' },
  new: { sort: 'date', dir: 'desc' },
  oldest: { sort: 'date', dir: 'asc' },
  old: { sort: 'date', dir: 'asc' },
};

const isSort = (text: string): text is sortType =>
  sortTypeList.includes(unescapeText(text) as sortType) || unescapeText(text) in sortRedirects;
const isDir = (text: string): text is dirType =>
  dirTypeList.includes(unescapeText(text) as dirType) || unescapeText(text) in dirRedirects;
const isValid = (term: string) => {
  // TODO: add multi in one term option?
  // if (term.includes('auto')) {
  //   return false;
  // }
  if (term.includes(',')) {
    const [sort, dir] = term.split(',', 2);
    return isSort(sort) && isDir(dir);
  }
  return isSort(term) || isDir(term) || unescapeText(term) in doubleRedirects;
};
const correctSort = (text: string): sortType => {
  if (unescapeText(text) in sortRedirects) {
    return sortRedirects[unescapeText(text)];
  }
  return unescapeText(text) as sortType;
};
const correctDir = (text: string): dirType => {
  if (unescapeText(text) in dirRedirects) {
    return dirRedirects[unescapeText(text)];
  }
  return unescapeText(text) as dirType;
};

const correctBoth = (text: string): { sort?: sortType; dir?: dirType } => {
  if (isSort(text)) {
    return { sort: correctSort(text) };
  }
  if (isDir(text)) {
    return { dir: correctDir(text) };
  }
  if (text.includes(',')) {
    const [sort, dir] = text.split(',', 2);
    return { sort: correctSort(sort), dir: correctDir(dir) };
  }
  return doubleRedirects[unescapeText(text)];
};
/**
 * Checks whether text can produce a sort filter (regardless of validity)
 * @param text text to check
 */
export const isSortFilter = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isSortFilter(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(text);
  return ['sort', 'order', 'dir', 'direction'].includes(keyword);
};

/**
 * Checks whether text can produce a valid sort filter, given that it passed {@linkcode isSortFilter}
 * @param text text to check
 */
export const sortIsValid = (text: string): boolean => {
  const { term } = splitOnFirstOp(text);
  return isValid(term);
};

/**
 * Parses a list of strings into a list of {@linkcode SortObject | SortObjects}.
 * This is not for use with a query, but rather for use with inputs on the frontend
 * @param sortList a list of strings to parse; they must have already passed {@linkcode sortIsValid}
 */
export const parseSorts = (sortList: string[]): SortObject[] => {
  const sortObs: SortObject[] = [];
  for (let i = 0; i < sortList.length; i++) {
    const term = sortList[i];
    const { sort, dir } = correctBoth(term);
    if (sort && dir) {
      sortObs.push(makeSort(sort, dir));
    } else if (sort) {
      if (i < sortList.length - 1) {
        const dir = sortList[i + 1];
        if (isDir(dir)) {
          sortObs.push(makeSort(sort, correctDir(dir)));
          i++;
          continue;
        }
      }
      sortObs.push(makeSort(sort, 'auto'));
    } else if (dir) {
      if (i < sortList.length - 1) {
        const sort = sortList[i + 1];
        if (isSort(sort)) {
          sortObs.push(makeSort(correctSort(sort), dir));
          i++;
          continue;
        }
      }
      sortObs.push(makeSort('auto', dir));
    }
  }
  return sortObs;
};

const bucketers = ['set', 'color', 'manavalue', 'colormanavalue', 'auto'];

const isConflict = (sort: string, other: string) =>
  sort == other || // if they are the same
  sort.slice(0, 3) == other.slice(0, 3) || // if they are both set
  sort.slice(0, 5) == other.slice(0, 5) || // if they are both color
  sort.slice(-6) == other.slice(-6) || // if they are both number
  sort.slice(-8) == other.slice(-8) || // if they are both accepted
  sort.slice(-9) == other.slice(-9); // if they are both manavalue

/**
 * Winnows a list of {@linkcode SortObject | SortObjects} by removing those that can't have any effect
 * @param sortList a list of sort objects to winnow
 */
export const winnowSortObjects = (
  sortList: SortObject[]
): {
  /**
   * The portion of the `sortList` parameter that can actually have an effect
   */
  sortList: SortObject[];
  /**
   * The portion of the `sortList` parameter that can't actually have an effect
   */
  winnowed: SortObject[];
} => {
  const winnowed: SortObject[] = [];
  const winnow = (index: number) => winnowed.unshift(...sortList.splice(index, 1));
  const hasConflict = (index: number) => {
    const sort = sortList[index].sort;
    if (!sortTypeList.includes(sort) || !dirTypeList.includes(sortList[index].dir)) {
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
 * Given a list of {@linkcode SortObject | SortObjects}, returns the options
 * for {@linkcode sortType} that can have an effect, if any
 * @param sortList list of sort objects to use
 */
export const getWinnowedSortOptions = (sortList: SortObject[]): sortType[] => {
  const options = [...sortTypeList];
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
 * Combines {@linkcode SortObject | SortObjects} from a query with input sorts
 * and removes ones that can't have an effect
 * @param querySorts sort objects from a query; will try to compress this as much as possible before combining it with inputs
 * @param inputSorts strings for sorts from inputs; must be formatted as `sort,dir`
 */
export const combineAndWinnowSorts = (
  querySorts: SortObject[],
  inputSorts: string[]
): {
  /**
   * The sort list to use
   */
  sortList: SortObject[];
  /**
   * The new list for `inputSorts`; used when syncing the url
   */
  newInputs: string[];
} => {
  const inputs = parseSorts(inputSorts);
  const newInputList: SortObject[] = [];
  const sortList: SortObject[] = [];
  for (let i = 0; i < Math.max(querySorts.length, inputs.length); i++) {
    if (i >= inputs.length) {
      sortList.push(querySorts[i]);
      newInputList.push(makeSort('auto', 'auto'));
      continue;
    }
    const input =
      sortTypeList.includes(inputs[i].sort) && dirTypeList.includes(inputs[i].dir)
        ? inputs[i]
        : makeSort(
            isSort(inputs[i].sort) ? correctSort(inputs[i].sort) : 'auto',
            isDir(inputs[i].dir) ? correctDir(inputs[i].dir) : 'auto'
          );
    newInputList.push(input);
    if (i >= querySorts.length) {
      sortList.push(input);
      continue;
    }
    const sort = (querySorts[i].sort == 'auto' ? input : querySorts[i]).sort;
    const dir = (querySorts[i].dir == 'auto' ? input : querySorts[i]).dir;
    sortList.push(makeSort(sort, dir));
  }
  const hasConflict = (index: number) => {
    const sort = sortList[index].sort;
    if (!sortTypeList.includes(sort) || !dirTypeList.includes(sortList[index].dir)) {
      return true;
    }
    for (let i = index - 1; i >= 0; i--) {
      const other = sortList[i].sort;
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
    // const sort = sortList[i].sort;
    if (/* (sort == 'auto' && sortList.length> 1 ) || */ hasConflict(i)) {
      const winnowed = sortList.splice(i, 1)[0];
      if (i == newInputList.length - 1 && newInputList[i].sort == winnowed.sort) {
        newInputList.splice(i, 1);
      }
    }
  }
  const newInputs = newInputList.map(input => `${input.sort},${input.dir}`);
  return { sortList, newInputs };
};
