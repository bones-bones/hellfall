import { makeSort } from '../makers';
import { dirTypeList, dirType, sortObject, sortTypeList, sortType } from '../types';
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
export const isSortFilter = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isSortFilter(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(text);
  return ['sort', 'order', 'dir', 'direction'].includes(keyword);
};

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

export const parseSorts = (sortList: string[]): sortObject[] => {
  const sortObs: sortObject[] = [];
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
export const winnowSortObjects = (
  sortList: sortObject[]
): { sortList: sortObject[]; winnowed: sortObject[] } => {
  const winnowed: sortObject[] = [];
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

export const getWinnowedSortOptions = (sortList: sortObject[]): sortType[] => {
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
export const combineAndWinnowSorts = (
  querySorts: sortObject[],
  inputSorts: string[]
): { sortList: sortObject[]; newInputs: string[] } => {
  const inputs = parseSorts(inputSorts);
  const newInputList: sortObject[] = [];
  const sortList: sortObject[] = [];
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
