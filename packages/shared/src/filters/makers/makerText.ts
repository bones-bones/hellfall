import { getAllNames, getFromAll, getFromFaces, isNumber, toFaces } from '@hellfall/shared/utils';
import {
  filterArtist,
  filterId,
  filterNumberString,
  filterOracleId,
  filterTag,
  filterText,
  filterTextList,
} from '../filters';
import {
  filterObject,
  NoteFilter,
  NumberPropSummaryFilter,
  PassThroughSummaryFilter,
  StringPropSummaryFilter,
  UUIDFilter,
  looseOpType,
  filterMaker,
  stringOrNumFilterMaker,
} from '../types';
import {
  opIsNegative,
  opToDont,
  opToIncludePlural,
  opToIncludeSingular,
  unescapeText,
} from '../utils';

export const makeIDFilter: filterMaker = (value: string, op: looseOpType) => {
  return new PassThroughSummaryFilter<string, string>(
    'id',
    filterId,
    value,
    op,
    '=',
    card => card.hcid
  );
};

export const makeOracleIDFilter: filterMaker = (value: string, op: looseOpType) => {
  return new UUIDFilter('oracleid', filterOracleId, value, op, '=', card => card.oracle_id);
};

export const makeNameFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'name',
    filterTextList,
    value,
    op,
    '>=',
    card => getAllNames(card).map(text => unescapeText(text)),
    'the name',
    opToIncludeSingular
  );
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'mana',
    filterTextList,
    value,
    op,
    '>=',
    card => getFromFaces(card, 'mana_cost'),
    'the cost',
    opToIncludeSingular
  );
};

export const makeTypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'type',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      [
        ...getFromFaces(card, 'supertypes'),
        ...getFromFaces(card, 'types'),
        ...getFromFaces(card, 'subtypes'),
        ...getFromAll(card, 'type_line'),
      ].map(text => unescapeText(text)),
    'the types',
    opToIncludePlural
  );
};
export const makeSupertypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'supertype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      [
        ...getFromFaces(card, 'supertypes'),
        ...toFaces(card).flatMap(e =>
          e.supertypes && e.supertypes?.length > 1 ? e.supertypes.join(' ') : []
        ),
      ].map(text => unescapeText(text)),
    'the supertypes',
    opToIncludePlural
  );
};
export const makeCardtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'cardtype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      [
        ...getFromFaces(card, 'types'),
        ...toFaces(card).flatMap(e => (e.types && e.types?.length > 1 ? e.types.join(' ') : [])),
      ].map(text => unescapeText(text)),
    'the card types',
    opToIncludePlural
  );
};
export const makeSubtypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'subtype',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      [
        ...getFromFaces(card, 'subtypes'),
        ...toFaces(card).flatMap(e =>
          e.subtypes && e.subtypes?.length > 1 ? e.subtypes.join(' ') : []
        ),
      ].map(text => unescapeText(text)),
    'the subtypes',
    opToIncludePlural
  );
};
export const makeOracleFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'oracle',
    filterTextList,
    value,
    op,
    '>=',
    card => getFromFaces(card, 'oracle_text').map(text => unescapeText(text)),
    'the oracle text',
    opToIncludeSingular
  );
};
export const makeFlavorFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'flavor',
    filterTextList,
    value,
    op,
    '>=',
    card => getFromFaces(card, 'flavor_text').map(text => unescapeText(text)),
    'the flavor text',
    opToIncludeSingular
  );
};

export const makeLoreFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'lore',
    filterTextList,
    value,
    op,
    '>=',
    card =>
      [
        ...getAllNames(card),
        ...getFromFaces(card, 'supertypes'),
        ...getFromFaces(card, 'types'),
        ...getFromFaces(card, 'subtypes'),
        ...getFromFaces(card, 'type_line'),
        ...getFromFaces(card, 'oracle_text'),
        ...getFromFaces(card, 'flavor_text'),
      ].map(text => unescapeText(text)),
    'the lore',
    opToIncludeSingular
  );
};

export const makeRulingFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string, string>(
    'ruling',
    filterText,
    value,
    op,
    '>=',
    card => card.rulings,
    'the rulings',
    opToIncludePlural
  );
};

export const makeCreatorFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new StringPropSummaryFilter<string[], string>(
      'creator',
      filterTextList,
      value,
      op,
      '>=',
      card => card.creators.map(text => unescapeText(text)),
      'the creators',
      opToIncludePlural
    );
  } else {
    return new NumberPropSummaryFilter<number, string>(
      'creator',
      filterNumberString,
      value,
      op,
      '=',
      card => card.creators.length,
      'the number of creators'
    );
  }
};

export const makeTagNoteFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'tagnote',
    filterTextList,
    value,
    op,
    '>=',
    card => Object.values(card.tag_notes ?? []).map(text => unescapeText(text)),
    'the tag note',
    opToIncludeSingular
  );
};

export const makeArtistFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new NoteFilter('artist', filterArtist, value, op, '>=', card => card);
  } else {
    return new NumberPropSummaryFilter<number, string>(
      'artist',
      filterNumberString,
      value,
      op,
      '=',
      card => card.artists?.length ?? 0,
      'the number of artists'
    );
  }
};

export const makeArtistNoteFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'artistnote',
    filterTextList,
    value,
    op,
    '>=',
    card => Object.values(card.artist_notes ?? []).map(text => unescapeText(text)),
    'the artist note',
    opToIncludeSingular
  );
};

export const makeTagFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NoteFilter('tag', filterTag, value, op, '>=', card => card);
};

export const makeWatermarkFilter: filterMaker = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'watermark',
    filterTextList,
    value,
    opIsNegative(op) ? '=' : '!=',
    '=',
    card => getFromFaces(card, 'watermark').map(text => unescapeText(text)),
    () => `the cards ${opToDont(op)} have the "${value}" watermark`
  );
};
export const makeKeywordFilter: filterMaker = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'creator',
    filterTextList,
    value,
    op,
    '=',
    card => card.keywords.map(text => unescapeText(text)),
    'the keywords',
    opToIncludePlural
  );
};
