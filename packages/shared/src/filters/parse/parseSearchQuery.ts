import { HCCard } from '@hellfall/shared/types';
import { FilterNode, allPrintsGetterType } from '../types';
import { parseFilter } from './parseFilter';
import { CardMap } from '@hellfall/shared/utils';
import { isSortFilter, parseSorts, sortIsValid, winnowSortObjects } from './parseSorts';
import { splitOnFirstOp, IncludeFilter, SortObject } from '../utils';

const tokenList = ['(', ')', 'or', '-', '~'];
const charBreakList = ['(', ' '];

// const isInclude = (text: string): boolean => {
//   if (text.at(0) == '-') {
//     return isInclude(text.slice(1));
//   }
//   const { keyword } = splitOnFirstOp(text);
//   return keyword == 'include' || keyword == 'exclude';
// };
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
      const quotedContent: string[] = [];

      while (i < len) {
        if (query.slice(i, i + 2) === '\\' + quoteChar) {
          quotedContent.push(query.slice(i, i + 2));
          i += 2;
          continue;
        }

        if (query[i] === quoteChar) {
          foundQuote = true;
          i++; // Move past closing quote
          break;
        }

        quotedContent.push(query[i]);
        i++;
      }
      if (foundQuote) {
        currentTerm += `${quoteChar}${quotedContent.join('')}${quoteChar}`;
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

const noAndList = [' or ', '(', ' and ', ' not (', 'the cards have related cards where '];
const consumeList = [' or ', '(', ' and ', ' not (', ')'];
/**
 * Parses a search query into everything needed to process it
 * @param query the search query
 * @param cardMap the {@linkcode CardMap} that contains all cards
 */
export const parseSearchQuery = (
  query: string,
  cardMap: CardMap
  // getOtherPrints?: otherPrintGetterType
): {
  /**
   * The root node of the AST
   */
  node: FilterNode;
  /**
   * A list of the {@linkcode SortObject | SortObjects} from the query
   */
  sortObjects: SortObject[];
  /**
   * A list of the {@linkcode IncludeFilter | IncludeFilters} that add cards to the search
   */
  includeList: IncludeFilter[];
  /**
   * A list of the {@linkcode IncludeFilter | IncludeFilters} that remove cards from the search
   */
  excludeList: IncludeFilter[];
  /**
   * A list of invalid filters; the first element is the text of the filter,
   * while the second is an explanation for why it is invalid
   */
  invalids: [string, string][];
  /**
   * A summary of the AST
   */
  summary: string;
  /**
   * A list of {@link winnowSortObjects winnowed} {@linkcode SortObject | SortObjects} from the query
   */
  winnowed: SortObject[];
  /**
   * Whether or not to filter extras automatically; set to false if the filters include any that check for sets or prints
   */
  autoFilterExtras: boolean;
} => {
  const invalids: [string, string][] = [];
  const cludeList: IncludeFilter[] = [];
  let autoFilterExtras = true;
  const getOtherPrints: allPrintsGetterType = (card: HCCard.Any) =>
    cardMap.getAllPrints(card.oracle_id).cards();

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
      if (['set', 'tokenset', 'block', 'in', 'sets'].includes(filter.queryName)) {
        autoFilterExtras = false;
      }
      i++;
      const summary = filter.toSummary();
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
