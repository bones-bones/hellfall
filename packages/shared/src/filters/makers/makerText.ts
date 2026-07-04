import { getAllNames, getFromAll, getFromFaces, isNumber, toFaces } from '@hellfall/shared/utils';
import {
  artistFilter,
  artistSummary,
  idFilter,
  idSummary,
  oracleIdFilter,
  oracleIdSummary,
  tagFilter,
  tagSummary,
  textFilter,
  textListFilter,
} from '../filters';
import {
  NoteFilter,
  NumberPropSummaryFilter,
  filterObject,
  StringPropSummaryFilter,
  UUIDFilter,
  looseOpType,
  filterMaker,
  stringOrNumFilterMaker,
} from '../types';
import {
  opIsNegative,
  opToDont,
  includeSummaryPlural,
  includeSummarySingular,
  unescapeText,
  numSearchFilter,
} from '../utils';
import { HCCard } from '@hellfall/shared/types';

export const makeIDFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new filterObject<string, string>(
    'id',
    idFilter,
    idSummary,
    value,
    op,
    card => card.hcid,
    '=',
    'negate'
  );
};

export const makeOracleIDFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new UUIDFilter(
    'oracleid',
    oracleIdFilter,
    oracleIdSummary,
    value,
    op,
    card => card.oracle_id
  );
};

export const makeNameFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'name',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => getAllNames(card).map(text => unescapeText(text)),
    'the name'
  );
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'mana',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => getFromFaces(card, 'mana_cost'),
    'the cost'
  );
};

export const makeTypeFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'type',
    textListFilter,
    includeSummaryPlural,
    value,
    op,
    card =>
      [
        ...getFromFaces(card, 'supertypes'),
        ...getFromFaces(card, 'types'),
        ...getFromFaces(card, 'subtypes'),
        ...getFromAll(card, 'type_line'),
      ].map(text => unescapeText(text)),
    'the types'
  );
};
export const makeSupertypeFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'supertype',
    textListFilter,
    includeSummaryPlural,
    value,
    op,
    card =>
      [
        ...getFromFaces(card, 'supertypes'),
        ...toFaces(card).flatMap(e =>
          e.supertypes && e.supertypes?.length > 1 ? e.supertypes.join(' ') : []
        ),
      ].map(text => unescapeText(text)),
    'the supertypes'
  );
};
export const makeCardtypeFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'cardtype',
    textListFilter,
    includeSummaryPlural,
    value,
    op,
    card =>
      [
        ...getFromFaces(card, 'types'),
        ...toFaces(card).flatMap(e => (e.types && e.types?.length > 1 ? e.types.join(' ') : [])),
      ].map(text => unescapeText(text)),
    'the card types'
  );
};
export const makeSubtypeFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'subtype',
    textListFilter,
    includeSummaryPlural,
    value,
    op,
    card =>
      [
        ...getFromFaces(card, 'subtypes'),
        ...toFaces(card).flatMap(e =>
          e.subtypes && e.subtypes?.length > 1 ? e.subtypes.join(' ') : []
        ),
      ].map(text => unescapeText(text)),
    'the subtypes'
  );
};
export const makeOracleFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'oracle',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => getFromFaces(card, 'oracle_text').map(text => unescapeText(text)),
    'the oracle text'
  );
};
export const makeFlavorFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'flavor',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => getFromFaces(card, 'flavor_text').map(text => unescapeText(text)),
    'the flavor text'
  );
};

export const makeLoreFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'lore',
    textListFilter,
    includeSummarySingular,
    value,
    op,
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
    'the lore'
  );
};

export const makeRulingFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string, string>(
    'ruling',
    textFilter,
    includeSummaryPlural,
    value,
    op,
    card => card.rulings,
    'the rulings'
  );
};

export const makeCreatorFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new StringPropSummaryFilter<string[], string>(
      'creator',
      textListFilter,
      includeSummaryPlural,
      value,
      op,
      card => card.creators.map(text => unescapeText(text)),
      'the creators'
    );
  } else {
    return new NumberPropSummaryFilter<number, string>(
      'creator',
      numSearchFilter,
      value,
      op,
      card => card.creators.length,
      'the number of creators'
    );
  }
};

export const makeTagNoteFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'tagnote',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => Object.values(card.tag_notes ?? []).map(text => unescapeText(text)),
    'the tag note'
  );
};

export const makeArtistFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new NoteFilter('artist', artistFilter, artistSummary, value, op);
  } else {
    return new NumberPropSummaryFilter<number, string>(
      'artist',
      numSearchFilter,
      value,
      op,
      card => card.artists?.length ?? 0,
      'the number of artists'
    );
  }
};

export const makeArtistNoteFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'artistnote',
    textListFilter,
    includeSummarySingular,
    value,
    op,
    card => Object.values(card.artist_notes ?? []).map(text => unescapeText(text)),
    'the artist note'
  );
};

export const makeTagFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new NoteFilter('tag', tagFilter, tagSummary, value, op);
};

export const makeWatermarkFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new filterObject<string[], string>(
    'watermark',
    textListFilter,
    () => `the cards ${opToDont(op)} have the "${value}" watermark`,
    value,
    opIsNegative(op) ? '=' : '!=',
    card => getFromFaces(card, 'watermark').map(text => unescapeText(text))
  );
};
export const makeKeywordFilter: filterMaker<string[]> = (value: string, op: looseOpType) => {
  return new StringPropSummaryFilter<string[], string>(
    'creator',
    textListFilter,
    includeSummaryPlural,
    value,
    op,
    card => card.keywords.map(text => unescapeText(text)),
    'the keywords',
    '='
  );
};
