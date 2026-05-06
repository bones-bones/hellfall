import { HCCard } from '@hellfall/shared/types';
import { filterObject, SetFilter } from './filterObject';
import { parseFilter } from './filterBuilder';
import { invertOp } from './types';

export type FilterNode =
  | { type: 'filter'; filter: filterObject<any, any> }
  | { type: 'not'; child: FilterNode }
  | { type: 'and'; children: FilterNode[] }
  | { type: 'or'; children: FilterNode[] };
const tokenList = ['(', ')', 'or', '-'];
const charBreakList = ['(', ')', ' '];
const tokenize = (query: string): string[] => {
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
  return tokens;
};

const parseTokens = (
  tokens: string[],
  start: number = 0
): { node: FilterNode; nextPos: number } => {
  const children: FilterNode[] = [];
  let currentMode: 'and' | 'or' = 'and';
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i];
    switch (token) {
      case '(': {
        const { node, nextPos } = parseTokens(tokens, i + 1);
        i = nextPos;
        children.push(node);
        break;
      }
      case ')': {
        if (!children.length) {
          return { node: { type: 'and', children: [] }, nextPos: i + 1 };
        }
        let node: FilterNode;
        if (currentMode == 'or') {
          node = { type: 'or', children };
        } else {
          node = children.length == 1 ? children[0] : { type: 'and', children };
        }
        return { node, nextPos: i + 1 };
      }
      case 'or': {
        currentMode = 'or';
        i++;
        break;
      }
      case '-': {
        i++;
        if (i < tokens.length && tokens[i] == '(') {
          const { node, nextPos } = parseTokens(tokens, i + 1);
          i = nextPos;
          children.push({ type: 'not', child: node });
        } else {
          const filter = parseFilter(token);
          children.push({ type: 'filter', filter });
          i++;
        }
        break;
      }
      default: {
        const filter = parseFilter(token);
        children.push({ type: 'filter', filter });
        i++;
        break;
      }
    }
  }

  if (!children.length) {
    return { node: { type: 'and', children: [] }, nextPos: i };
  }
  let node: FilterNode;
  if (currentMode == 'or') {
    node = { type: 'or', children };
  } else {
    node = children.length == 1 ? children[0] : { type: 'and', children };
  }
  return { node, nextPos: i };
};

export const parseSearchQuery = (query: string): FilterNode => {
  if (!query || !query.trim()) {
    return { type: 'and', children: [] };
  }

  const tokens = tokenize(query);
  const { node } = parseTokens(tokens);
  return node;
};

export const evaluateFilter = (node: FilterNode, card: HCCard.Any): boolean => {
  switch (node.type) {
    case 'filter':
      return node.filter.cardPassesFilter(card);
    case 'not':
      return !evaluateFilter(node.child, card);
    case 'and':
      if (!node.children.length) return true;
      return node.children.every(child => evaluateFilter(child, card));
    case 'or':
      if (!node.children.length) return true;
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
  includeExtras: boolean = false
): HCCard.Any[] => {
  const ast = parseSearchQuery(query);
  if (includeExtras) {
    setIncludeExtras(ast, true);
  }

  return cards.filter(card => evaluateFilter(ast, card));
};
