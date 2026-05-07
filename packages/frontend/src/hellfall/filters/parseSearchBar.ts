import { HCCard } from '@hellfall/shared/types';
import { filterObject, SetFilter, sortObject } from './filterObject';
import { makeSort, parseFilter, splitOnFirstOp, unescapeText } from './filterBuilder';
import { dirType, dirs, invertOp, sorts, sortType, getActualOp } from './types';

export type FilterNode =
  | { type: 'filter'; filter: filterObject<any, any> }
  | { type: 'not'; child: FilterNode }
  | { type: 'and'; children: FilterNode[] }
  | { type: 'or'; children: FilterNode[] };
const tokenList = ['(', ')', 'or', '-'];
const charBreakList = ['(', ')', ' '];

const isSort = (text: string): boolean => {
  if (text.charAt(0) == '-') {
    return isSort(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(unescapeText(text));
  return ['sort', 'order', 'dir', 'direction'].includes(keyword);
};
const sortIsValid = (text: string): boolean => {
  const { term } = splitOnFirstOp(unescapeText(text));
  if (term.includes(',')) {
    const [sort, dir] = term.split(',', 2);
    return sorts.includes(sort as sortType) && dirs.includes(dir as dirType);
  }
  if (term == 'auto') {
    return false;
  }
  return sorts.includes(term as sortType) && dirs.includes(term as dirType);
};
const isInclude = (text: string): boolean => {
  if (text.charAt(0) == '-') {
    return isSort(text.slice(1));
  }
  const { keyword } = splitOnFirstOp(unescapeText(text));
  return keyword == 'include';
};
const includeIsValid = (text: string): boolean => {
  const { term } = splitOnFirstOp(unescapeText(text));
  return term == 'extras';
};
const tokenize = (
  query: string
): { tokens: string[]; sortList: string[]; includeExtras: boolean } => {
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
    if (char == '-' && (i == 0 || charBreakList.includes(query[i - 1]))) {
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
    if ((char === '"' || char === "'") && query.charAt(i - 1) != '\\') {
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
  const sortList = [];
  let includeExtras = false;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (isSort(token)) {
      if (sortIsValid(token)) {
        sortList.unshift(...tokens.splice(i, 1));
      } else {
        tokens[i] = `invalid:"${token}"`;
      }
    }
    if (isInclude(token)) {
      if (includeIsValid(token)) {
        includeExtras = true;
        tokens.splice(i, 1);
      } else {
        tokens[i] = `invalid:"${token}"`;
      }
    }
  }
  return { tokens, sortList, includeExtras };
};

const parseSorts = (sortList: string[]): sortObject[] => {
  const sortObs: sortObject[] = [];
  for (let i = 0; i < sortList.length; i++) {
    const { term } = splitOnFirstOp(unescapeText(sortList[i]));
    if (term.includes(',')) {
      const [sort, dir] = term.split(',', 2);
      sortObs.push(makeSort(sort as sortType, dir as dirType));
    } else if (sorts.includes(term as sortType)) {
      if (i < sortList.length - 1) {
        const { term: dir } = splitOnFirstOp(unescapeText(sortList[i + 1]));
        if (dirs.includes(dir as dirType)) {
          sortObs.push(makeSort(term as sortType, dir as dirType));
          i++;
          continue;
        }
      }
      sortObs.push(makeSort(term as sortType, 'auto'));
    } else {
      sortObs.push(makeSort('auto', term as dirType));
    }
  }
  return sortObs;
};
export const parseSearchQuery = (
  query: string
): {
  node: FilterNode;
  sortObjects: sortObject[];
  invalids: filterObject<any, any>[];
  summary: string;
  includeExtras: boolean;
} => {
  const invalids: filterObject<any, any>[] = [];
  const summaries: string[] = [];
  const parseTokens = (
    tokens: string[],
    start: number = 0
  ): { node: FilterNode; nextPos: number } => {
    // const children: FilterNode[] = [];
    // let currentMode: 'and' | 'or' = 'and';
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
      i++;
      const summary = filter.toSummary(getActualOp(filter.filter, filter.op), filter.value);
      if (summary.charAt(0) == '!' || filter.queryName == 'invalid') {
        invalids.push(filter);
        return parseTerm();
      }
      if (summaries.at(-1) != ' or ' && summaries.at(-1) != '(') {
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
        summaries.push(' and ');
        const rightNode = parseTerm();
        if (rightNode) {
          leftNode = { type: 'and', children: [leftNode, rightNode] };
        }
      }
    }
    return { node: leftNode || { type: 'and', children: [] }, nextPos: i };
  };
  const { tokens, sortList, includeExtras } = tokenize(query);
  const { node } = parseTokens(tokens, 0);
  const sortObjects = parseSorts(sortList);
  if ([' not ', ' and ', ' or '].includes(summaries.at(-1) ?? '')) {
    summaries.pop();
  }
  const summary = summaries.join('');
  return { node, sortObjects, invalids, summary, includeExtras };
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

export const setIncludeExtras = (node: FilterNode, includeExtras: boolean) => {
  switch (node.type) {
    case 'filter':
      if (node.filter instanceof SetFilter) {
        node.filter.includeExtras = includeExtras;
      }
      break;
    case 'not':
      setIncludeExtras(node.child, includeExtras);
      break;
    case 'and':
    case 'or':
      node.children.forEach(child => setIncludeExtras(child, includeExtras));
      break;
  }
};

export const searchCards = (
  cards: HCCard.Any[],
  query: string,
  includeExtrasIn: boolean = false
): {
  cards: HCCard.Any[];
  sortObjects: sortObject[];
  summary: string;
  invalids: filterObject<any, any>[];
} => {
  const { node, sortObjects, invalids, summary, includeExtras } = parseSearchQuery(query);
  if (includeExtrasIn || includeExtras) {
    setIncludeExtras(node, true);
  }

  return {
    cards: cards.filter(card => evaluateFilter(node, card)),
    sortObjects,
    summary,
    invalids,
  };
};
