import { isNumber } from '@hellfall/shared/utils';
import {
  anyLayoutSummary,
  artistFilter,
  artistSummary,
  borderSummary,
  cardFrameSummary,
  cardLayoutSummary,
  faceLayoutSummary,
  frameEffectSummary,
  frameSummary,
  idFilter,
  idSummary,
  keywordSummary,
  kindSummary,
  oracleIdFilter,
  oracleIdSummary,
  showcaseSummary,
  tagFilter,
  tagSummary,
  toAnyLayout,
  toBorder,
  toCardFrame,
  toCardLayout,
  toFaceLayout,
  toFrame,
  toFrameEffect,
  toShowcaseFrame,
  watermarkSummary,
} from '../filters';
import {
  NoteFilter,
  NumberPropFilter,
  FilterObject,
  PropFilter,
  UUIDFilter,
  looseOpType,
  filterMaker,
  stringOrNumFilterMaker,
  propFilterMaker,
  propConvertFilterMaker,
  PropConvertFilter,
} from '../types';
import { includeSummaryPlural, includeSummarySingular, numSearchFilter } from '../utils';
import { HCCard } from '@hellfall/shared/types';

export const makeIDFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new FilterObject<string, string>(
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

export const makeNameFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('name', includeSummarySingular, value, op, 'the name');
};
// TODO: Make cost search act more like number than string (and more like scryfall)
export const makeCostFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('mana', includeSummarySingular, value, op, 'the cost');
};

export const makeTypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('type', includeSummaryPlural, value, op, 'the types');
};
export const makeSupertypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('supertype', includeSummaryPlural, value, op, 'the supertypes');
};
export const makeCardtypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('cardtype', includeSummaryPlural, value, op, 'the card types');
};
export const makeSubtypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('subtype', includeSummaryPlural, value, op, 'the subtypes');
};
export const makeOracleFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('oracle', includeSummarySingular, value, op, 'the oracle text');
};
export const makeFlavorFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('flavor', includeSummarySingular, value, op, 'the flavor text');
};

export const makeLoreFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('lore', includeSummarySingular, value, op, 'the lore');
};

export const makeRulingFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('ruling', includeSummaryPlural, value, op, 'the rulings');
};

export const makeCreatorFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new PropFilter('creator', includeSummaryPlural, value, op, 'the creators');
  } else {
    return new NumberPropFilter<number, string>(
      'creator',
      numSearchFilter,
      value,
      op,
      card => card.creators.length,
      'the number of creators'
    );
  }
};

export const makeTagFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new NoteFilter('tag', tagFilter, tagSummary, value, op);
};

export const makeTagNoteFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('tagnote', includeSummarySingular, value, op, 'the tag note');
};

export const makeArtistFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new NoteFilter('artist', artistFilter, artistSummary, value, op);
  } else {
    return new NumberPropFilter<number, string>(
      'artist',
      numSearchFilter,
      value,
      op,
      card => card.artists?.length ?? 0,
      'the number of artists'
    );
  }
};

export const makeArtistNoteFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('artistnote', includeSummarySingular, value, op, 'the artist note');
};

export const makeWatermarkFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('watermark', watermarkSummary, value, op);
};
export const makeKeywordFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('keyword', keywordSummary, value, op);
};

export const makeBorderFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('border', borderSummary, value, op, toBorder);
};
export const makeCardFrameFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('cardframe', cardFrameSummary, value, op, toCardFrame);
};
export const makeFrameEffectFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('frameeffect', frameEffectSummary, value, op, toFrameEffect);
};
export const makeFrameFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('frame', frameSummary, value, op, toFrame);
};
export const makeShowcaseFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('showcase', showcaseSummary, value, op, toShowcaseFrame);
};

export const makeKindFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('kind', kindSummary, value, op);
};
export const makeCardLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('layout', cardLayoutSummary, value, op, toCardLayout);
};
export const makeFaceLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('facelayout', faceLayoutSummary, value, op, toFaceLayout);
};
export const makeAnyLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('anylayout', anyLayoutSummary, value, op, toAnyLayout);
};
