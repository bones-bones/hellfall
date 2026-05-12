import { HCCard } from '@hellfall/shared/types';
import { filterObject, IncludeFilter, sortObject } from './filterObject';
import {
  filterIsInverted,
  makeIncludeFilter,
  makeSort,
  parseFilter,
  splitOnFirstOp,
  unescapeText,
} from './filterBuilder';
import { dirType, dirs, sorts, sortType, inclusionOptions } from './types';
import { filterIncludeExtras } from './filterSet';

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

export type FilterNode =
  | { type: 'filter'; filter: filterObject<any, any> }
  | { type: 'not'; child: FilterNode }
  | { type: 'and'; children: FilterNode[] }
  | { type: 'or'; children: FilterNode[] };
const tokenList = ['(', ')', 'or', '-'];
const charBreakList = ['(', ')', ' '];

const isSortFilter = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isSortFilter(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(text);
  return ['sort', 'order', 'dir', 'direction'].includes(keyword);
};

const isSort = (text: string): boolean => sorts.includes(text as sortType) || text in sortRedirects;
const isDir = (text: string): boolean => dirs.includes(text as dirType) || text in dirRedirects;
const sortIsValid = (text: string): boolean => {
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
const isInclude = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isInclude(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(text);
  return keyword == 'include' || keyword == 'exclude';
};
const includeIsValid = (text: string): boolean => {
  const { term } = splitOnFirstOp(text);
  return term in inclusionOptions;
};
const tokenize = (query: string): { tokens: string[]; sortList: string[] } => {
  const tokens: string[] = [];
  const len = query.length;
  let currentTerm = '';
  for (let i = 0; i < len; ) {
    const char = query[i];
    if (char == ' ') {
      if (currentTerm) {
        tokens.push(currentTerm);
        currentTerm = '';
      }
      i++;
      continue;
    }
    if (char == '-' && (i == query.length - 1 || charBreakList.includes(query[i + 1]))) {
      tokens.push(char);
      i++;
      continue;
    }
    if (['(', ')'].includes(char)) {
      if (currentTerm) {
        tokens.push(currentTerm);
        currentTerm = '';
      }
      tokens.push(char);
      i++;
      continue;
    }
    if (i < len - 1 && query.slice(i, i + 2).toLowerCase() == 'or') {
      if (
        (i == 0 || charBreakList.includes(query.charAt(i - 1))) &&
        (i == len - 2 || charBreakList.includes(query.charAt(i + 2)))
      ) {
        tokens.push('or');
        i += 2;
        continue;
      }
    }
    if (i < len - 2 && query.slice(i, i + 3).toLowerCase() == 'and') {
      if (
        (i == 0 || charBreakList.includes(query.charAt(i - 1))) &&
        (i == len - 3 || charBreakList.includes(query.charAt(i + 3)))
      ) {
        i += 3;
        continue;
      }
    }
    if ((char === '"' || char === "'") && query.at(i - 1) != '\\') {
      const quoteStart = i;
      let foundQuote = false;
      const quoteChar = char;
      i++; // Move past opening quote
      let quotedContent = '';

      while (i < len) {
        if (query.slice(i, i + 2) === '\\' + quoteChar) {
          quotedContent += query.slice(i, i + 2);
          i += 2;
          continue;
        }

        if (query[i] === quoteChar) {
          foundQuote = true;
          i++; // Move past closing quote
          break;
        }

        quotedContent += query[i];
        i++;
      }
      if (foundQuote) {
        currentTerm += `${quoteChar}${quotedContent}${quoteChar}`;
        tokens.push(currentTerm);
        currentTerm = '';
        continue;
      } else {
        i = quoteStart;
      }
    }
    currentTerm += char;
    i++;
  }
  if (currentTerm) {
    tokens.push(currentTerm);
  }
  const sortList: string[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (isSortFilter(token)) {
      if (sortIsValid(token)) {
        sortList.unshift(splitOnFirstOp(tokens.splice(i, 1)[0]).term);
        // } else {
        //   tokens[i] = `invalidsort:${token}`;
      }
    }
    // if (isInclude(token)) {
    //   includeList.unshift(splitOnFirstOp(tokens.splice(i, 1)[0]).term);
    // }
  }
  return { tokens, sortList };
};

const correctSort = (text: string): sortType => {
  if (text in sortRedirects) {
    return sortRedirects[text];
  }
  return text as sortType;
};
const correctDir = (text: string): dirType => {
  if (text in dirRedirects) {
    return dirRedirects[text];
  }
  return text as dirType;
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

const bucketers = ['set', 'color', 'manavalue', 'colormanavalue'];
export const winnowSortObjects = (
  sortList: sortObject[]
): { sortList: sortObject[]; winnowed: sortObject[] } => {
  const winnowed: sortObject[] = [];
  const winnow = (index: number) => winnowed.unshift(...sortList.splice(index, 1));
  const hasConflict = (index: number) => {
    const sort = sortList[index].sort;
    if (!sorts.includes(sort) || !dirs.includes(sortList[index].dir)) {
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
  const sortst = sortList;
  const options = [...sorts];
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

const prepTag = (tag: string) => tag.replaceAll(/[\/\\'"\- _\.]/g, '').toLowerCase();

export const fixTags = (node: FilterNode, tagList: string[]) => {
  switch (node.type) {
    case 'filter':
      if (node.filter.queryName == 'tag') {
        const tag = prepTag(node.filter.value);
        const correctedTag = tagList.find(fixed => prepTag(fixed) == tag);
        if (correctedTag) {
          node.filter.value = correctedTag;
        }
      }
      break;
    case 'not':
      fixTags(node.child, tagList);
      break;
    case 'and':
    case 'or':
      node.children.forEach(child => fixTags(child, tagList));
      break;
  }
};

export const combineAndWinnowSorts = (
  querySorts: sortObject[],
  inputSorts: sortObject[]
): { sortList: sortObject[]; newInputs: sortObject[] } => {
  const newInputs: sortObject[] = [];
  const sortList: sortObject[] = [];
  for (let i = 0; i < Math.max(querySorts.length, inputSorts.length); i++) {
    if (i >= inputSorts.length) {
      sortList.push(querySorts[i]);
      newInputs.push(makeSort('auto', 'auto'));
      continue;
    }
    const input =
      sorts.includes(inputSorts[i].sort) && dirs.includes(inputSorts[i].dir)
        ? inputSorts[i]
        : makeSort(
            isSort(inputSorts[i].sort) ? correctSort(inputSorts[i].sort) : 'auto',
            isDir(inputSorts[i].dir) ? correctDir(inputSorts[i].dir) : 'auto'
          );
    newInputs.push(input);
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
    if (!sorts.includes(sort) || !dirs.includes(sortList[index].dir)) {
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
    const sort = sortList[i].sort;
    if (/* (sort == 'auto' && sortList.length> 1 ) || */ hasConflict(i)) {
      const winnowed = sortList.splice(i, 1)[0];
      if (i == newInputs.length - 1 && newInputs[i].sort == winnowed.sort) {
        newInputs.splice(i, 1);
      }
    }
  }

  return { sortList, newInputs };
};

export const parseSearchQuery = (
  query: string
): {
  node: FilterNode;
  sortObjects: sortObject[];
  includeList: IncludeFilter[];
  invalids: [string, filterObject<any, any>][];
  summary: string;
  winnowed: sortObject[];
  autoFilterExtras: boolean;
} => {
  const invalids: [string, filterObject<any, any>][] = [];
  const summaries: string[] = [];
  const includeList: IncludeFilter[] = [];
  let autoFilterExtras = true;
  const parseTokens = (
    tokens: string[],
    start: number = 0
  ): { node: FilterNode; nextPos: number } => {
    let i = start;
    let leftNode: FilterNode | null = null;
    const parseTerm = (): FilterNode | null => {
      while (i < tokens.length && tokens[i] === 'or') {
        i++;
      }
      if (i >= tokens.length) {
        return null;
      }
      const token = tokens[i];

      if (token === '(') {
        const { node, nextPos } = parseTokens(tokens, i + 1);
        i = nextPos;
        summaries.push(token);
        return node;
      }

      if (token === '-' && tokens.at(i + 1) == '(') {
        if (summaries.at(-1) != ' or ' && summaries.at(-1) != '(') {
          summaries.push(' and ');
        }
        summaries.push(' not ');
        i++;
        const { node, nextPos } = parseTokens(tokens, i + 1);
        i = nextPos;
        return { type: 'not', child: node };
      }

      // Regular filter term
      const filter = parseFilter(token);
      if (['set', 'tokenset', 'block'].includes(filter.queryName)) {
        autoFilterExtras = false;
      }
      i++;
      const summary = filter.toSummary(filterIsInverted(token));
      if (summary.at(0) == '!' || filter.queryName.startsWith('invalid')) {
        invalids.push([token, filter]);
        return parseTerm();
      }
      if (filter.queryName == 'include') {
        autoFilterExtras = false;
        includeList.push(filter);
        return parseTerm();
      }
      if (summaries.at(-1) != ' or ' && summaries.at(-1) != '(' && summaries.at(-1) != ' and ') {
        summaries.push(' and ');
      }
      summaries.push(summary);
      return { type: 'filter', filter };
    };
    leftNode = parseTerm();

    if (!leftNode) {
      return { node: { type: 'and', children: [] }, nextPos: i };
    }
    while (i < tokens.length) {
      const token = tokens[i];
      if (token == ')') {
        summaries.push(token);
        break;
      }
      if (token == 'or') {
        while (i < tokens.length && tokens[i] === 'or') {
          i++;
        }
        if (i >= tokens.length) break;
        summaries.push(` ${token} `);
        const rightNode = parseTerm();
        if (rightNode) {
          leftNode = { type: 'or', children: [leftNode, rightNode] };
        }
      } else {
        if (summaries.at(-1) != ' or ' && summaries.at(-1) != '(' && summaries.at(-1) != ' and ') {
          summaries.push(' and ');
        }
        const rightNode = parseTerm();
        if (rightNode) {
          leftNode = { type: 'and', children: [leftNode, rightNode] };
        }
      }
    }
    return { node: leftNode || { type: 'and', children: [] }, nextPos: i };
  };
  const { tokens, sortList } = tokenize(query);
  const { node } = parseTokens(tokens, 0);
  const { sortList: sortObjects, winnowed } = winnowSortObjects(parseSorts(sortList));
  while ([' not ', ' and ', ' or '].includes(summaries.at(-1) ?? '')) {
    summaries.pop();
  }
  while ([' and ', ' or '].includes(summaries.at(0) ?? '')) {
    summaries.shift();
  }
  const summary = summaries.length ?
    ('where ' + summaries.join('')).trimEnd() +
    (includeList.length ? `, ${includeList.map(filter => filter.toSummary()).join(' and ')}` : ''):'';
  return { node, sortObjects, includeList, invalids, summary, winnowed, autoFilterExtras };
};

export const evaluateFilter = (node: FilterNode, card: HCCard.Any): boolean => {
  switch (node.type) {
    case 'filter':
      return node.filter.cardPassesFilter(card);
    case 'not':
      return !evaluateFilter(node.child, card);
    case 'and':
      return node.children.every(child => evaluateFilter(child, card));
    case 'or':
      return node.children.some(child => evaluateFilter(child, card));
  }
};

export const searchCards = (
  cards: HCCard.Any[],
  query: string,
  tagList: string[]
): {
  cards: HCCard.Any[];
  sortObjects: sortObject[];
  summary: string;
  invalids: [string, filterObject<any, any>][];
  winnowed: sortObject[];
} => {
  const { node, sortObjects, includeList, invalids, summary, winnowed, autoFilterExtras } =
    parseSearchQuery(query);
  fixTags(node, tagList);
  const newCardsWithExtras = cards.filter(
    card => evaluateFilter(node, card) && includeList.every(filter => filter.cardPassesFilter(card))
  );
  const excludeExtras = makeIncludeFilter('extras', '!:');
  const newCardsWithoutExtras = newCardsWithExtras.filter(card =>
    excludeExtras.cardPassesFilter(card)
  );

  return {
    cards:
      autoFilterExtras && newCardsWithoutExtras.length ? newCardsWithoutExtras : newCardsWithExtras,
    sortObjects,
    summary,
    invalids,
    winnowed,
  };
};
