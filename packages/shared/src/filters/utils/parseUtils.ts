import { textIsQuote } from '@hellfall/shared/utils';
import { looseOpList, looseOpType, FilterNode } from '../types';

/**
 * Unescapes and strips text so that it can be used in comparisons
 * @param text text to unescape
 */
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
 */
export const splitOnFirstOp = (
  text: string
): {
  /**
   * The keyword from the search term. Has {@linkcode unescapeText} applied to it.
   * Also includes any prefixes. If omitted, will return `'name'`
   */
  keyword: string;
  /**
   * The operator from the search term. If omitted, will return `':'`
   */
  op: looseOpType;
  /**
   * The term from the search term. Note: Does not have {@linkcode unescapeText} applied to it.
   */
  term: string;
} => {
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
/**
 * Fixes a tag so that it can be used in comparisons
 * @param tag tag to prep
 */
export const prepTag = (tag: string) => tag.replaceAll(/[/\\'"\- _.]/g, '').toLowerCase();
// /**
//  * Fixes tag filter values
//  * @param node the root node of the AST
//  * @param tagList The list of tags (from `tags.json`)
//  */
// export const fixTags = (node: FilterNode, tagList: string[]) => {
//   switch (node.type) {
//     case 'filter':
//       if (node.filter.queryName == 'tag') {
//         const tag = prepTag(node.filter.value);
//         const correctedTag = tagList.find(fixed => prepTag(fixed) == tag);
//         if (correctedTag) {
//           node.filter.value = correctedTag;
//         }
//       }
//       break;
//     case 'not':
//     case 'related':
//       fixTags(node.child, tagList);
//       break;
//     case 'and':
//     case 'or':
//       node.children.forEach(child => fixTags(child, tagList));
//       break;
//   }
// };

/**
 * Fixes `dropFaces`
 * @param node the root node of the AST
 */
export const fixDrop = (node: FilterNode) => {
  switch (node.type) {
    case 'filter':
      node.filter.keepFaces();
      break;
    case 'not':
    case 'related':
      fixDrop(node.child);
      break;
    case 'and':
    case 'or':
      node.children.forEach(child => fixDrop(child));
      break;
  }
};
