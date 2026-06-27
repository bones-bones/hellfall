import { invertCompOp } from '../filters';
import {
  makeCompFilter,
  makeInvalidColorFilter,
  makeInvalidFilter,
  makeInvalidKeywordFilter,
  makeNameFilter,
} from '../makers';
import {
  filterObject,
  looseOpList,
  otherPrintGetterType,
  colorFilterNameType,
  equivColorFilterNames,
  equivFilterNames,
  equivPrintsFilterNames,
  filterNameType,
  invertedFilterNames,
  printsFilterNameType,
} from '../types';
import { invertOp, isCompKeyword, splitOnFirstOp, unescapeText } from '../utils';
import { parseColorText } from './parseColors';
import { colorFilters, filters, printsFilters } from './parseMaps';

// make sure the thing doesn't strip quotes when passing text in to this from start and end of string when
export const parseFilter = (
  text: string,
  invert: boolean = false,
  getOtherPrints: otherPrintGetterType
): filterObject<any, any> => {
  const correctOp = (filter: filterObject<any, any>) => {
    if (invert) {
      switch (filter.filter.invertOption) {
        case 'flip': {
          if (filter.queryName == 'comp') {
            filter.value = invertCompOp(filter.value);
          }
          filter.op = invertOp(filter.op);
          break;
        }
        case 'negate': {
          filter.inverted = !filter.inverted;
          break;
        }
      }
    }
    return filter;
  };
  if (!text) {
    return makeInvalidFilter('', '=');
  }
  if (text[0] == '-') {
    return parseFilter(text.slice(1), !invert, getOtherPrints);
  }
  if (text[0] == '"' || text[0] == "'" || !looseOpList.some(op => text.includes(op))) {
    return correctOp(makeNameFilter(text, ':'));
  }
  const { keyword, op, term } = splitOnFirstOp(text);
  if (isCompKeyword(keyword) && isCompKeyword(term)) {
    return correctOp(makeCompFilter(keyword, op, unescapeText(term)));
  }
  if (keyword in equivFilterNames || keyword in filters) {
    const correctKeyword = keyword in filters ? keyword : equivFilterNames[keyword];
    return correctOp(filters[correctKeyword as filterNameType](term, op));
  }
  if (keyword in invertedFilterNames) {
    return parseFilter(`${invertedFilterNames[keyword]}${op}${term}`, !invert, getOtherPrints);
  }
  if (keyword in equivPrintsFilterNames || keyword in printsFilters) {
    const correctKeyword = keyword in printsFilters ? keyword : equivPrintsFilterNames[keyword];
    return correctOp(
      printsFilters[correctKeyword as printsFilterNameType](term, op, getOtherPrints)
    );
  }
  if (keyword in equivColorFilterNames || keyword in colorFilters) {
    const correctKeyword = keyword in colorFilters ? keyword : equivColorFilterNames[keyword];
    const parsedColors = parseColorText(term);
    if (parsedColors == undefined) {
      return makeInvalidColorFilter(term, ':');
    }
    // using misc as a color automatically shunts the color search into a misc search
    if (
      Array.isArray(parsedColors) &&
      correctKeyword.slice(0, 4) != 'misc' &&
      parsedColors.includes('Misc')
    ) {
      return correctOp(
        colorFilters[('misc' + correctKeyword) as colorFilterNameType](parsedColors, op)
      );
    }
    return correctOp(colorFilters[correctKeyword as colorFilterNameType](parsedColors, op));
  }
  if (term) {
    return makeInvalidKeywordFilter(keyword, ':');
  }
  return correctOp(makeNameFilter(unescapeText(text), ':'));
};
