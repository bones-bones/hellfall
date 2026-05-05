import { textEquals, textSearchIncludes } from '@hellfall/shared/utils/textHandling';
import {
  cardStringFilter,
  includeEqualsOp,
  looseOpType,
  opType,
  tagFilter,
  textFilter,
  textListFilter,
  textRecordFilter,
} from './types';
import { isNumber } from '@hellfall/shared/utils/isInt';
import { filterNumber } from './filterNumber';
import { HCCard } from '@hellfall/shared/types';
import { getAllNames } from '../getNames';

export const filterId: textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;
    if (isNumber(value2)) {
      return isNumber(value1) ? filterNumber(parseInt(value1), operator, parseInt(value2)) : false;
    }
    return includeEqualsOp(actualOp, textSearchIncludes, textEquals, value1, value2);
  },
  { defaultOp: '>=' as opType }
);

export const filterText: textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;
    return includeEqualsOp(actualOp, textSearchIncludes, textEquals, value1, value2);
  },
  { defaultOp: '>=' as opType }
);
const textListIncludes = (value1: string[], value2: string) =>
  value1.some(text => textSearchIncludes(text, value2));
const textListEquals = (value1: string[], value2: string) =>
  value1.some(text => textEquals(text, value2));
export const filterTextList: textListFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;
    return includeEqualsOp(actualOp, textListIncludes, textListEquals, value1, value2);
  },
  { defaultOp: '>=' as opType }
);
export const filterTag: tagFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string, tag_notes?: Record<string, string>) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;
    if (value2.endsWith('<')) {
      const tag = value2.slice(0, -1);
      return Boolean(tag_notes && filterTextList(Object.keys(tag_notes), actualOp, tag));
    }

    if (value2.endsWith('>') && value2.includes('<')) {
      if (!tag_notes) {
        return false;
      }
      const [tag, note] = [value2.split('<')[0], value2.split('<')[1].slice(0, -1)];
      // return tag_notes && textEquals(tag_notes[tag], note);
      return includeEqualsOp(actualOp, textSearchIncludes, textEquals, tag_notes[tag], note);
    }
    return includeEqualsOp(actualOp, textListIncludes, textListEquals, value1, value2);
  },
  { defaultOp: '>=' as opType }
);

const getLore = (card: HCCard.Any) => {
  return [
    ...getAllNames(card),
    ...card.toFaces().flatMap(e => e.supertypes || []),
    ...card.toFaces().flatMap(e => e.types || []),
    ...card.toFaces().flatMap(e => e.subtypes || []),
    ...card.toFaces().map(e => e.type_line),
    ...card.toFaces().map(e => e.oracle_text),
    ...card.toFaces().flatMap(e => e.flavor_text ?? []),
  ];
};
export const filterLore: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterLore.defaultOp : operator;
    return includeEqualsOp(actualOp, textListIncludes, textListEquals, getLore(value1), value2);
  },
  { defaultOp: '>=' as opType }
);
