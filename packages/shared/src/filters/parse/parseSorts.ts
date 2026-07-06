import { makeSort } from '../makers';
import { dirTypeList, dirType, SortObject, sortTypeList, sortType } from '../types';
import { splitOnFirstOp, unescapeText } from '../utils';

const sortRedirects: Record<string, sortType> = {
  mv: 'manavalue',
  cmc: 'manavalue',
  cn: 'number',
  num: 'number',
  setcn: 'setnumber',
  setnum: 'setnumber',
  colormv: 'colormanavalue',
  colorcmc: 'colormanavalue',
  setreview: 'colormanavalue',
};
const dirRedirects: Record<string, dirType> = {
  a: 'asc',
  up: 'asc',
  u: 'asc',
  d: 'desc',
  down: 'desc',
};
const isSort = (text: string): text is sortType =>
  sortTypeList.includes(unescapeText(text) as sortType) || unescapeText(text) in sortRedirects;
const isDir = (text: string): text is dirType =>
  dirTypeList.includes(unescapeText(text) as dirType) || unescapeText(text) in dirRedirects;
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
  // TODO: add multi in one term option?
  if (term.includes('auto')) {
    return false;
  }
  if (term.includes(',')) {
    const [sort, dir] = term.split(',', 2);
    return isSort(sort) && isDir(dir);
  }
  return isSort(term) || isDir(term);
};

/**
 * Parses a list of strings into a list of {@linkcode SortObject | SortObjects}.
 * This is not for use with a query, but rather for use with inputs on the frontend
 * @param sortList a list of strings to parse; they must be formatted as `sort,dir`
 */
export const parseSorts = (sortList: string[]): SortObject[] => {
  const sortObs: SortObject[] = [];
  for (let i = 0; i < sortList.length; i++) {
    const term = sortList[i];
    if (term.includes(',')) {
      const [sort, dir] = term.split(',', 2);
      sortObs.push(makeSort(correctSort(sort), correctDir(dir)));
    } else if (isSort(term)) {
      if (i < sortList.length - 1) {
        const dir = sortList[i + 1];
        if (isDir(dir)) {
          sortObs.push(makeSort(correctSort(term), correctDir(dir)));
          i++;
          continue;
        }
      }
      sortObs.push(makeSort(correctSort(term), 'auto'));
    } else {
      if (i < sortList.length - 1) {
        const sort = sortList[i + 1];
        if (isSort(sort)) {
          sortObs.push(makeSort(correctSort(sort), correctDir(term)));
          i++;
          continue;
        }
      }
      sortObs.push(makeSort('auto', correctDir(term)));
    }
  }
  return sortObs;
};

const bucketers = ['set', 'color', 'manavalue', 'colormanavalue', 'auto'];
/**
 * Winnows a list of {@linkcode SortObject | SortObjects} by removing those that can't have any effect and
 * @param sortList a list of strings to parse; they must have already passed {@linkcode isSortFilter} and {@linkcode sortIsValid}
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
      if (
        sort == other ||
        sort.slice(0, 3) == other.slice(0, 3) ||
        sort.slice(0, 5) == other.slice(0, 5) ||
        sort.slice(-6) == other.slice(-6) ||
        sort.slice(-9) == other.slice(-9)
      ) {
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
 * Given a list of {@linkcode SortObject | SortObjects}, returns the options for {@linkcode sortType} that can have an effect, if any
 * @param sortList list of sort objects to use
 */
export const getWinnowedSortOptions = (sortList: SortObject[]): sortType[] => {
  const options = [...sortTypeList];
  const hasConflict = (sort: string, other: string) => {
    if (
      sort == other ||
      sort.slice(0, 3) == other.slice(0, 3) ||
      sort.slice(0, 5) == other.slice(0, 5) ||
      sort.slice(-6) == other.slice(-6) ||
      sort.slice(-9) == other.slice(-9)
    ) {
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
      if (
        sort == other ||
        sort.slice(0, 3) == other.slice(0, 3) ||
        sort.slice(0, 5) == other.slice(0, 5) ||
        sort.slice(-6) == other.slice(-6) ||
        sort.slice(-9) == other.slice(-9)
      ) {
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
