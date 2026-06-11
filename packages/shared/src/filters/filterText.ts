import {
  textEquals,
  textSearchIncludes,
  isNumber,
  textListIncludes,
  textListEquals,
  isValidV4UUID,
} from '@hellfall/shared/utils';
import {
  invertOptionType,
  looseOpType,
  NOPRINT,
  opType,
  noteFilter,
  textFilter,
  textListFilter,
} from './types';
import {
  opToIncludeSingular,
  opToTagged,
  includeEqualsOp,
  opIsNegative,
  opToIncludePlural,
  opAsBool,
} from './filterUtils';
import { filterNumber } from './filterNumber';
import { HCCard } from '@hellfall/shared/types';
import { prepTag } from './parseSearchBar';

export const filterEmpty: textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => true,
  {
    invertOption: 'ignore' as invertOptionType,
    toSummary: (operator: opType, value: string) => '!',
  }
);

export const filterText: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) =>
    includeEqualsOp(operator, textSearchIncludes, textEquals, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string) => NOPRINT,
  }
);

export const filterOracleId: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) => opAsBool(value1 == value2, operator),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean) => {
      if (isValidV4UUID(value)) {
        return `the Oracle ID is ${filterNumber.toSummary(operator, parseInt(value), invert)}`;
      }
      return `!You must provide a valid v4 UUID.`;
    },
  }
);
export const filterId: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) => {
    if (isNumber(value2)) {
      return isNumber(value1) ? filterNumber(parseInt(value1), operator, parseInt(value2)) : false;
    }
    return filterText(value1, operator, value2);
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean) => {
      if (isNumber(value)) {
        return `the id is ${filterNumber.toSummary(operator, parseInt(value), invert)}`;
      }
      return `the id ${opToIncludeSingular(operator, value, invert)}`;
    },
  }
);

export const filterTextList: textListFilter = Object.assign(
  (value1: string[], operator: opType, value2: string) =>
    includeEqualsOp(operator, textListIncludes, textListEquals, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string) => NOPRINT,
  }
);

export const parseNote = (text: string): { name: string; note?: boolean | string } => {
  if (text.endsWith('<')) {
    return { name: text.slice(0, -1), note: true };
  }
  if (text.endsWith('>') && text.includes('<')) {
    const [name, note] = [text.split('<')[0], text.split('<')[1].slice(0, -1)];
    return { name, note };
  }
  return { name: text };
};

export const filterArtist: noteFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string, note?: boolean | string) => {
    if (note && typeof note != 'string') {
      const artist = value2.slice(0, -1);
      return (
        value1.artist_notes && filterTextList(Object.keys(value1.artist_notes), operator, artist)
      );
    }
    if (note) {
      if (!value1.artist_notes) {
        return false;
      }
      return includeEqualsOp(
        operator,
        textSearchIncludes,
        textEquals,
        value1.artist_notes[value2],
        note
      );
    }
    return value1.artists
      ? includeEqualsOp(
          operator,
          textListIncludes,
          textListEquals,
          value1.artists.map(artist => prepTag(artist)),
          prepTag(value2)
        )
      : false;
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean, note?: boolean | string) =>
      `the artists ${opToIncludePlural(operator, value, invert)} ${
        note
          ? ` and that artist${
              typeof note == 'string'
                ? `'s note ${opToIncludeSingular(operator, note, invert)}`
                : ` ${opIsNegative(operator) ? 'does not have' : 'has'} a note`
            }`
          : ''
      }`,
  }
);

export const filterTag: noteFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string, note?: boolean | string) => {
    if (note && typeof note != 'string') {
      const tag = value2.slice(0, -1);
      return value1.tag_notes && filterTextList(Object.keys(value1.tag_notes), operator, tag);
    }
    if (note) {
      if (!value1.tag_notes) {
        return false;
      }
      return includeEqualsOp(
        operator,
        textSearchIncludes,
        textEquals,
        value1.tag_notes[value2],
        note
      );
    }
    return value1.tags
      ? includeEqualsOp(
          operator,
          textListIncludes,
          textListEquals,
          value1.tags.map(tag => prepTag(tag)),
          prepTag(value2)
        )
      : false;
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean, note?: boolean | string) =>
      `the card is ${opToTagged(operator, value, invert)} ${
        note
          ? ` and that tag${
              typeof note == 'string'
                ? `'s note ${opToIncludeSingular(operator, note, invert)}`
                : ` ${opIsNegative(operator) != !invert ? 'does not have' : 'has'} a note`
            }`
          : ''
      }`,
  }
);
