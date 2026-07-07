import {
  getBlockSets,
  getGroupSets,
  getSetAndDirectChildSets,
  isNumber,
} from '@hellfall/shared/utils';
import {
  anyLayoutSummary,
  artistFilter,
  artistSummary,
  blockSummary,
  borderSummary,
  cardFrameSummary,
  cardLayoutSummary,
  faceLayoutSummary,
  frameEffectSummary,
  frameSummary,
  groupSummary,
  idFilter,
  idSummary,
  keywordSummary,
  kindSummary,
  oracleIdFilter,
  oracleIdSummary,
  setSummary,
  setTypeSummary,
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
  toSetType,
  toShowcaseFrame,
  watermarkSummary,
} from '../filters';
import { looseOpType } from '../types';
import {
  includeSummaryPlural,
  includeSummarySingular,
  NoteFilter,
  NumberPropFilter,
  FilterObject,
  PropFilter,
  NoUnescapeFilter,
  filterMaker,
  stringOrNumFilterMaker,
  propFilterMaker,
  propConvertFilterMaker,
  PropConvertFilter,
  LegalityFilter,
  legalityFilterMaker,
  stateFilterMaker,
} from '../utils';

// TODO: Should this be a `stringOrNumFilterMaker`?
/**
 * Makes an hcid filter
 * @param value the value from the search
 * @param op the operator from the search
 */
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

/**
 * Makes an oracle id filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeOracleIDFilter: filterMaker<string> = (value: string, op: looseOpType) => {
  return new NoUnescapeFilter(
    'oracleid',
    oracleIdFilter,
    oracleIdSummary,
    value,
    op,
    card => card.oracle_id
  );
};

/**
 * Makes a name filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeNameFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('name', includeSummarySingular, value, op);
};
// TODO: Make cost search act more like number than string (and more like scryfall)
/**
 * Makes a mana cost filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCostFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('mana', includeSummarySingular, value, op);
};

/**
 * Makes a type line filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeTypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('type', includeSummaryPlural, value, op, 'types');
};
/**
 * Makes a supertype filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeSupertypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('supertype', includeSummaryPlural, value, op);
};
/**
 * Makes a card type filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCardtypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('cardtype', includeSummaryPlural, value, op, 'card types');
};
/**
 * Makes a subtype filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeSubtypeFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('subtype', includeSummaryPlural, value, op);
};
/**
 * Makes an oracle text filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeOracleFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('oracle', includeSummarySingular, value, op);
};
/**
 * Makes a flavor text filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeFlavorFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('flavor', includeSummarySingular, value, op);
};

/**
 * Makes a lore filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeLoreFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('lore', includeSummarySingular, value, op);
};

/**
 * Makes a ruling filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeRulingFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('ruling', includeSummaryPlural, value, op);
};

/**
 * Makes a creator filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCreatorFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new PropFilter('creator', includeSummaryPlural, value, op);
  } else {
    return new NumberPropFilter('creator', value, op, 'number of creators');
  }
};

/**
 * Makes a tag filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeTagFilter: stateFilterMaker = (value: string, op: looseOpType) => {
  return new NoteFilter('tag', tagFilter, tagSummary, value, op);
};

/**
 * Makes a tag note filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeTagNoteFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('tagnote', includeSummarySingular, value, op, 'tag note');
};

/**
 * Makes an artist filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeArtistFilter: stringOrNumFilterMaker = (value: string, op: looseOpType) => {
  if (!isNumber(value)) {
    return new NoteFilter('artist', artistFilter, artistSummary, value, op);
  } else {
    return new NumberPropFilter('artist', value, op, 'number of artists');
  }
};

/**
 * Makes an artist note filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeArtistNoteFilter: propFilterMaker = (value: string, op: looseOpType) => {
  return new PropFilter('artistnote', includeSummarySingular, value, op, 'artist note');
};

/**
 * Makes a watermark filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeWatermarkFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('watermark', watermarkSummary, value, op);
};
/**
 * Makes a keyword filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeKeywordFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('keyword', keywordSummary, value, op);
};

/**
 * Makes a border filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeBorderFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('border', borderSummary, value, op, toBorder);
};
/**
 * Makes a card frame filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCardFrameFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('cardframe', cardFrameSummary, value, op, toCardFrame);
};
/**
 * Makes a frame effect filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeFrameEffectFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('frameeffect', frameEffectSummary, value, op, toFrameEffect);
};
/**
 * Makes a frame filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeFrameFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('frame', frameSummary, value, op, toFrame);
};
/**
 * Makes a showcase frame filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeShowcaseFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('showcase', showcaseSummary, value, op, toShowcaseFrame);
};

/**
 * Makes a kind filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeKindFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('kind', kindSummary, value, op);
};
/**
 * Makes a root layout filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCardLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('layout', cardLayoutSummary, value, op, toCardLayout);
};
/**
 * Makes a face layout filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeFaceLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('facelayout', faceLayoutSummary, value, op, toFaceLayout);
};
/**
 * Makes an any layout filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeAnyLayoutFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('anylayout', anyLayoutSummary, value, op, toAnyLayout);
};

/**
 * Makes a set filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeSetFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('set', setSummary, value, op, getSetAndDirectChildSets);
};
/**
 * Makes a block filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeBlockFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('block', blockSummary, value, op, getBlockSets);
};
/**
 * Makes a group filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeGroupFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('group', groupSummary, value, op, getGroupSets);
};
/**
 * Makes a set type filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeSetTypeFilter: propConvertFilterMaker = (value: string, op: looseOpType) => {
  return new PropConvertFilter('settype', setTypeSummary, value, op, toSetType);
};

/**
 * Makes a legal filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeLegalFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('legal', value, op);
};
/**
 * Makes a banned filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeBannedFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('banned', value, op);
};
/**
 * Makes a notlegal filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeNotLegalFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('notlegal', value, op);
};
