import { isCompKeyword } from '../filters';
import {
  makeCompFilter,
  makeInvalidColorFilter,
  makeInvalidFilter,
  makeInvalidKeywordFilter,
  makeIsUniqueFilter,
  makeNameFilter,
} from '../makers';
import {
  FilterObject,
  looseOpList,
  allPrintsGetterType,
  colorFilterNameType,
  invertedFilterNames,
  toFilterName,
  toPrintsFilterName,
  toColorFilterName,
} from '../types';
import { splitOnFirstOp, unescapeText } from '../utils';
import { parseColorText } from './parseColors';
import { colorFilters, filters, printsFilters } from './parseMaps';

// make sure the thing doesn't strip quotes when passing text in to this from start and end of string when
/**
 * Parses text into a filter object
 * @param text text to parse
 * @param invert whether to invert this filter; used to recursively handle inversion
 * @param getAllPrints a function that gets all prints of a card
 * @returns the appropriate {@linkcode FilterObject}
 */
export const parseFilter = (
  text: string,
  invert: boolean = false,
  getAllPrints: allPrintsGetterType
): FilterObject<any, any> => {
  const correctOp = (filter: FilterObject<any, any>) => {
    if (invert) {
      filter.invert();
    }
    return filter;
  };
  if (!text) {
    return makeInvalidFilter('', '=');
  }
  if (text[0] == '-') {
    return parseFilter(text.slice(1), !invert, getAllPrints);
  }
  if (text[0] == '"' || text[0] == "'" || !looseOpList.some(op => text.includes(op))) {
    return correctOp(makeNameFilter(text, ':'));
  }
  const { keyword, op, term } = splitOnFirstOp(text);
  const colorFilterName = toColorFilterName(keyword);
  if (colorFilterName) {
    const parsedColors = parseColorText(term);
    if (parsedColors == undefined) {
      if (isCompKeyword(term)) {
        return correctOp(makeCompFilter(keyword, op, unescapeText(term)));
      }
      return makeInvalidColorFilter(term, ':');
    }
    // using misc as a color automatically shunts the color search into a misc color search
    if (
      Array.isArray(parsedColors) &&
      colorFilterName.slice(0, 4) != 'misc' &&
      parsedColors.includes('Misc')
    ) {
      return correctOp(
        colorFilters[('misc' + colorFilterName) as colorFilterNameType](parsedColors, op)
      );
    }
    return correctOp(colorFilters[colorFilterName](parsedColors, op));
  }
  if (isCompKeyword(keyword) && isCompKeyword(term)) {
    return correctOp(makeCompFilter(keyword, op, unescapeText(term)));
  }
  if (unescapeText(term) == 'unique' && ['is', 'has'].includes(keyword)) {
    return correctOp(makeIsUniqueFilter(term, op, getAllPrints));
  }
  const filterName = toFilterName(keyword);
  if (filterName) {
    return correctOp(filters[filterName](term, op));
  }
  if (keyword in invertedFilterNames) {
    return parseFilter(`${invertedFilterNames[keyword]}${op}${term}`, !invert, getAllPrints);
  }
  const printsFilterName = toPrintsFilterName(keyword);
  if (printsFilterName) {
    return correctOp(printsFilters[printsFilterName](term, op, getAllPrints));
  }
  if (term) {
    return makeInvalidKeywordFilter(keyword, ':');
  }
  return correctOp(makeNameFilter(unescapeText(text), ':'));
};
