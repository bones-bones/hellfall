import { HCCard, HCColors } from '@hellfall/shared/types';
import { filterObject, IncludeFilter, sortObject } from './filterObject';
import {
  filterIsInverted,
  makeIncludeFilter,
  makeSort,
  otherPrintGetterType,
  parseFilter,
  splitOnFirstOp,
  unescapeText,
} from './filterBuilder';
import { dirType, dirs, sorts, sortType, inclusionOptions, includeFilter } from './types';
import { CardMap, getAllRelated } from '../utils';

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
  | { type: 'related'; child: FilterNode }
  | { type: 'and'; children: FilterNode[] }
  | { type: 'or'; children: FilterNode[] };
const tokenList = ['(', ')', 'or', '-', '~'];
const charBreakList = ['(', ' '];

const isSortFilter = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isSortFilter(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(text);
  return ['sort', 'order', 'dir', 'direction'].includes(keyword);
};

const isSort = (text: string): boolean =>
  sorts.includes(text.toLowerCase() as sortType) || text.toLowerCase() in sortRedirects;
const isDir = (text: string): boolean =>
  dirs.includes(text.toLowerCase() as dirType) || text.toLowerCase() in dirRedirects;
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
    if (char == '~' && i < query.length - 1 && query.at(i + 1) != ' ' && query.at(i + 1) != ')') {
      tokens.push(char);
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
  if (text.toLowerCase() in sortRedirects) {
    return sortRedirects[text.toLowerCase()];
  }
  return text.toLowerCase() as sortType;
};
const correctDir = (text: string): dirType => {
  if (text.toLowerCase() in dirRedirects) {
    return dirRedirects[text.toLowerCase()];
  }
  return text.toLowerCase() as dirType;
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

export const prepTag = (tag: string) => tag.replaceAll(/[/\\'"\- _.]/g, '').toLowerCase();

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
      sorts.includes(inputs[i].sort) && dirs.includes(inputs[i].dir)
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

const noAndList = [' or ', '(', ' and ', ' not (', 'the cards have related cards where '];
const consumeList = [' or ', '(', ' and ', ' not (', ')'];
export const parseSearchQuery = (
  query: string,
  getOtherPrints: otherPrintGetterType
): {
  node: FilterNode;
  sortObjects: sortObject[];
  includeList: IncludeFilter[];
  excludeList: IncludeFilter[];
  invalids: [string, string][];
  summary: string;
  winnowed: sortObject[];
  autoFilterExtras: boolean;
} => {
  const invalids: [string, string][] = [];
  const cludeList: IncludeFilter[] = [];
  let autoFilterExtras = true;

  const parseTokens = (
    tokens: string[],
    start: number = 0,
    summaries: string[],
    inRelated?: boolean
  ): { node: FilterNode; nextPos: number; summaries: string[] } => {
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

      if (token === '(' && tokens.at(i + 1) === ')') {
        i += 2;
        return null; // Skip empty parentheses entirely
      }
      if (token === '(') {
        summaries.push(token);
        const { node, nextPos } = parseTokens(tokens, i + 1, summaries);
        i = nextPos;
        if (i < tokens.length && tokens[i] === ')') {
          i++;
        }
        summaries.push(')');
        if ((node.type == 'and' || node.type == 'or') && !node.children.length) {
          return null;
        }
        return node;
      }

      if (token === ')') {
        return null;
      }
      if (token == '~' && i < tokens.length - 1) {
        if (summaries.length && !noAndList.includes(summaries.at(-1)!)) {
          summaries.push(' and ');
        }
        summaries.push('the cards have related cards where ');
        const { node, nextPos } = parseTokens(tokens, i + 1, summaries, true);
        i = nextPos;
        if ((node.type == 'and' || node.type == 'or') && !node.children.length) {
          return null;
        }
        return { type: 'related', child: node };
      }

      if (token === '-' && tokens.at(i + 1) == '(') {
        if (summaries.length && !noAndList.includes(summaries.at(-1)!)) {
          summaries.push(' and ');
        }
        summaries.push(' not (');
        i++;
        const { node, nextPos } = parseTokens(tokens, i + 1, summaries);
        i = nextPos;
        if (i < tokens.length && tokens[i] === ')') {
          i++;
        }
        summaries.push(')');
        if ((node.type == 'and' || node.type == 'or') && !node.children.length) {
          return null;
        }
        return { type: 'not', child: node };
      }

      // Regular filter term
      const filter = parseFilter(token, undefined, getOtherPrints);
      if (['set', 'tokenset', 'block', 'in', 'sets', 'prints'].includes(filter.queryName)) {
        autoFilterExtras = false;
      }
      i++;
      const summary = filter.toSummary(filterIsInverted(token));
      if (summary.at(0) == '!' || filter.queryName.startsWith('invalid')) {
        invalids.push([token, filter.toSummary().slice(1)]);
        // while (summaries.length && consumeList.includes(summaries.at(-1)!)) {
        //   summaries.pop()
        // }
        return null;
      }
      if (filter.queryName == 'include') {
        // autoFilterExtras = false;
        cludeList.push(filter);
        // while (summaries.length && consumeList.includes(summaries.at(-1)!)) {
        //   summaries.pop()
        // }
        return null;
      }
      if (summaries.length && !noAndList.includes(summaries.at(-1)!)) {
        summaries.push(' and ');
      }
      summaries.push(summary);
      return { type: 'filter', filter };
    };
    leftNode = parseTerm();

    if (!leftNode) {
      // Try parsing more terms until we find a valid one or hit ')'
      while (i < tokens.length && tokens[i] !== ')') {
        const nextNode = parseTerm();
        if (nextNode) {
          leftNode = nextNode;
          break;
        }
      }
    }

    if (!leftNode) {
      return { node: { type: 'and', children: [] }, nextPos: i, summaries };
    }

    if (inRelated) {
      return { node: leftNode || { type: 'and', children: [] }, nextPos: i, summaries };
    }

    while (i < tokens.length) {
      const token = tokens[i];
      if (token == ')') {
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
          if (leftNode) {
            leftNode = { type: 'or', children: [leftNode, rightNode] };
          } else {
            leftNode = rightNode;
          }
        }
        continue;
      } else {
        if (summaries.length && !noAndList.includes(summaries.at(-1)!)) {
          summaries.push(' and ');
        }
        const rightNode = parseTerm();
        if (rightNode) {
          if (leftNode) {
            leftNode = { type: 'and', children: [leftNode, rightNode] };
          } else {
            leftNode = rightNode;
          }
        }
      }
    }
    return { node: leftNode || { type: 'and', children: [] }, nextPos: i, summaries };
  };
  const { tokens, sortList } = tokenize(query);
  const { node, summaries } = parseTokens(tokens, 0, []);
  const { sortList: sortObjects, winnowed } = winnowSortObjects(parseSorts(sortList));
  while ([' not ', ' and ', ' or ', '('].includes(summaries.at(-1) ?? '')) {
    summaries.pop();
  }
  while ([' and ', ' or '].includes(summaries.at(0) ?? '')) {
    summaries.shift();
  }
  const { includeList, excludeList, cludeSummary } = splitCludes(cludeList);
  const summary = `${summaries.length ? ('where ' + summaries.join('')).trimEnd() : ''}${
    summaries.length && cludeSummary ? ', ' : ''
  }${cludeSummary}`;
  return {
    node,
    sortObjects,
    includeList,
    excludeList,
    invalids,
    summary,
    winnowed,
    autoFilterExtras,
  };
};

const splitCludes = (
  cludeList: IncludeFilter[]
): { includeList: IncludeFilter[]; excludeList: IncludeFilter[]; cludeSummary: string } => {
  const includeList: IncludeFilter[] = [];
  const excludeList: IncludeFilter[] = [];
  cludeList.forEach(include => {
    if (include.inverted) {
      excludeList.push(include);
    } else {
      includeList.push(include);
    }
  });
  const includeSummary = includeList.map(include => include.toSummary()).join(' and ');
  const excludeSummary = excludeList.map(exclude => exclude.toSummary()).join(' and ');
  const cludeSummary = `${includeSummary}${
    includeSummary && excludeSummary ? ' but ' : ''
  }${excludeSummary}`;
  return { includeList, excludeList, cludeSummary };
};

export const evaluateRelatedFilter = (
  node: FilterNode,
  card: HCCard.Any,
  cardMap: CardMap
): boolean => getAllRelated(card, cardMap).some(related => evaluateFilter(node, related, cardMap));

export const evaluateFilter = (node: FilterNode, card: HCCard.Any, cardMap: CardMap): boolean => {
  switch (node.type) {
    case 'filter':
      return node.filter.cardPassesFilter(card);
    case 'related':
      return evaluateRelatedFilter(node.child, card, cardMap);
    case 'not':
      return !evaluateFilter(node.child, card, cardMap);
    case 'and':
      return node.children.every(child => evaluateFilter(child, card, cardMap));
    case 'or':
      return node.children.some(child => evaluateFilter(child, card, cardMap));
  }
};

export const searchCards = (cardMap: CardMap, query: string, tagList: string[]): CardMap => {
  const getOtherPrints: otherPrintGetterType = (card: HCCard.Any) =>
    cardMap.getAllPrints(card.oracle_id).cards();
  const { node, includeList, excludeList, autoFilterExtras } = parseSearchQuery(
    query,
    getOtherPrints
  );
  const usingClusion = Boolean(includeList.length + excludeList.length);
  // so when do I want include to default to true? when includelist.length == 0, and when the only include is the default? then why default?
  fixTags(node, tagList);
  if (includeList.length) {
    const defaultInclude = makeIncludeFilter('nonextras', ':');
    includeList.push(defaultInclude);
  }
  const newCardsWithExtras = cardMap.filter(
    card =>
      evaluateFilter(node, card, cardMap) &&
      (includeList.length ? includeList.some(filter => filter.cardPassesFilter(card)) : true) &&
      (excludeList.length ? excludeList.some(filter => filter.cardPassesFilter(card)) : true)
  );
  // const includeNonExtras = makeIncludeFilter('nonextras', ':');
  const excludeExtras = makeIncludeFilter('nonextras', ':');
  const newCardsWithoutExtras = newCardsWithExtras.filter(card =>
    excludeExtras.cardPassesFilter(card)
  );

  return autoFilterExtras && !usingClusion && newCardsWithoutExtras.size()
    ? newCardsWithoutExtras
    : newCardsWithExtras;
};
