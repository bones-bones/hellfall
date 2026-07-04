import { looseOpList, looseOpType, FilterNode } from '../types';

const textIsQuote = (text: string) =>
  text.length > 1 && text[0] == text.at(-1) && ['"', "'"].includes(text[0]) && text.at(-2) != '\\';

export const unescapeText = (text: string) => {
  const strippedText = textIsQuote(text) ? text : text.replaceAll(/[_-]/g, '');
  return strippedText
    .toLowerCase()
    .replaceAll(/^['"]/g, '')
    .replaceAll(/(?<!\\)['"]/g, '')
    .replaceAll(/\\(['"])/g, '$1');
};

/**
 * Splits a search term on its first operator
 * @param text search term to split
 * @returns keyword, op, and term, all with unescapeText applied. Defaults to returning a name search.
 */
export const splitOnFirstOp = (
  text: string
): { keyword: string; op: looseOpType; term: string } => {
  for (let i = 1; i < text.length - 1; i++) {
    if (looseOpList.includes(text.slice(i, i + 2) as looseOpType) && i < text.length - 2) {
      return {
        keyword: unescapeText(text.slice(0, i)),
        op: text.slice(i, i + 2) as looseOpType,
        term: text.slice(i + 2),
      };
    }
    if (looseOpList.includes(text.at(i) as looseOpType)) {
      return {
        keyword: unescapeText(text.slice(0, i)),
        op: text.at(i) as looseOpType,
        term: text.slice(i + 1),
      };
    }
    if (text.at(i) == '"' || text.at(i) == "'") {
      break;
    }
  }
  return { keyword: 'name', op: ':', term: text };
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
