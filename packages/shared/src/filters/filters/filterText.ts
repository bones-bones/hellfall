import {
  textEquals,
  textContains,
  isNumber,
  textListContains,
  textListIncludes,
  isValidV4UUID,
} from '@hellfall/shared/utils';
import {
  looseOpType,
  opType,
  noteFilterFunction,
  textFilterFunction,
  textListFilterFunction,
  summaryFunction,
  noteSummaryFunction,
} from '../types';
import {
  includeSummarySingular,
  taggedSummary,
  includeEqualsOp,
  opIsNegative,
  includeSummaryPlural,
  opAsBool,
  opToNot,
  prepTag,
  numSearchFilter,
  baseNumSummary,
} from '../utils';
import { HCCard } from '@hellfall/shared/types';

export const emptyFilter: textFilterFunction = (
  value1: string,
  operator: looseOpType,
  value2: string
) => true;
export const emptySummary: summaryFunction<string> = (operator: opType, value: string) => '!';

export const textFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  includeEqualsOp(operator, textContains, textEquals, value1, value2);

export const oracleIdFilter: textFilterFunction = (
  value1: string,
  operator: opType,
  value2: string
) => opAsBool(value1 == value2, operator);
export const oracleIdSummary: summaryFunction<string> = (operator: opType, value: string) => {
  if (isValidV4UUID(value.toLowerCase())) {
    return `the Oracle ID is ${opToNot(operator)} ${value}`;
  }
  return `!You must provide a valid v4 UUID.`;
};

export const idFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  (isNumber(value2) ? numSearchFilter : textFilter)(value1, operator, value2);
export const idSummary: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) =>
  `the id is ${(isNumber(value) ? baseNumSummary : includeSummarySingular)(
    operator,
    value,
    invert
  )}`;

export const textListFilter: textListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: string
) => includeEqualsOp(operator, textListContains, textListIncludes, value1, value2);

export const artistFilter: noteFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  note?: boolean | string
) => {
  if (note && typeof note != 'string') {
    const artist = value2.slice(0, -1);
    return (
      value1.artist_notes && textListFilter(Object.keys(value1.artist_notes), operator, artist)
    );
  }
  if (note) {
    if (!value1.artist_notes) {
      return false;
    }
    return includeEqualsOp(operator, textContains, textEquals, value1.artist_notes[value2], note);
  }
  if (!value1.artists) return false;
  return includeEqualsOp(
    operator,
    textListContains,
    textListIncludes,
    value1.artists.map(artist => prepTag(artist)),
    prepTag(value2)
  );
};
export const artistSummary: noteSummaryFunction = (
  operator: opType,
  value: string,
  invert?: boolean,
  note?: boolean | string
) =>
  `the artists ${includeSummaryPlural(operator, value, invert)} ${
    note
      ? ` and that artist${
          typeof note == 'string'
            ? `'s note ${includeSummarySingular(operator, note, invert)}`
            : ` ${opIsNegative(operator) != !invert ? 'does not have' : 'has'} a note`
        }`
      : ''
  }`;

export const tagFilter: noteFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  note?: boolean | string
) => {
  if (note && typeof note != 'string') {
    const tag = value2.slice(0, -1);
    return value1.tag_notes && textListFilter(Object.keys(value1.tag_notes), operator, tag);
  }
  if (note) {
    if (!value1.tag_notes) {
      return false;
    }
    return includeEqualsOp(operator, textContains, textEquals, value1.tag_notes[value2], note);
  }
  if (!value1.tags) return false;
  return includeEqualsOp(
    operator,
    textListContains,
    textListIncludes,
    value1.tags.map(tag => prepTag(tag)),
    prepTag(value2)
  );
};
export const tagSummary: noteSummaryFunction = (
  operator: opType,
  value: string,
  invert?: boolean,
  note?: boolean | string
) =>
  `the card is ${taggedSummary(operator, value, invert)} ${
    note
      ? ` and that tag${
          typeof note == 'string'
            ? `'s note ${includeSummarySingular(operator, note, invert)}`
            : ` ${opIsNegative(operator) != !invert ? 'does not have' : 'has'} a note`
        }`
      : ''
  }`;
