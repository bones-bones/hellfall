import {
  textEquals,
  textContains,
  isNumber,
  textListContains,
  textListIncludes,
  isValidV4UUID,
  listsAreLooselyEqual,
  wrapArray,
  getSetAndDirectChildSets,
  xor,
} from '@hellfall/shared/utils';
import {
  opType,
  noteFilterFunction,
  textFilterFunction,
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
  opToDont,
  textFilter,
  textListFilter,
  createCorrectedSummary,
  createSummary,
  fixValue,
} from '../utils';
import {
  HCCard,
  HCFrame,
  HCFrameEffect,
  HCLayout,
  isKind,
  HCBorderColor,
  isSetCode,
  SetType,
  isSetType,
} from '@hellfall/shared/types';
import {
  frameEffectNames,
  frameNames,
  toBorderRecord,
  toCardFrameRecord,
  toCardLayoutRecord,
  toFaceLayoutRecord,
  toFrameEffectRecord,
  toShowcaseFrameRecord,
} from './filterRecords';

/**
 * Compares an oracle id from a card with an oracle id from a search
 * @param value1 oracle id from the card
 * @param operator operator to use
 * @param value2 oracle id from the search
 */
export const oracleIdFilter: textFilterFunction = (
  value1: string,
  operator: opType,
  value2: string
) => opAsBool(value1 == value2, operator);
/**
 * The summary for an oracle id filter
 * @param operator the operator to use
 * @param value the search oracle id to use
 */
export const oracleIdSummary: summaryFunction<string> = (operator: opType, value: string) => {
  if (isValidV4UUID(value.toLowerCase())) {
    return `the Oracle ID is ${opToNot(operator)} ${value}`;
  }
  return `!You must provide a valid v4 UUID.`;
};

/**
 * Compares an hcid from a card with an hcid from a search
 * @param value1 hcid from the card
 * @param operator operator to use
 * @param value2 hcid from the search
 */
export const idFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  (isNumber(value2) ? numSearchFilter : textFilter)(value1, operator, value2);
/**
 * The summary for an hcid filter
 * @param operator the operator to use
 * @param value the search hcid to use
 * @param invert whether the search is inverted
 */
export const idSummary: summaryFunction<string> = (
  operator: opType,
  value: string,
  invert?: boolean
) =>
  `the id ${isNumber(value) ? 'is ' : ''}${(isNumber(value)
    ? baseNumSummary
    : includeSummarySingular)(operator, value, invert)}`;

/**
 * Checks a card to see if its artists include an artist from a search, and possibly also checks against artist notes
 * @param value1 card to use
 * @param operator operator to use
 * @param value2 artist to check for
 * @param note note to check for, if any; if boolean, just checks for (non)existence of a note
 */
export const artistFilter: noteFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  note?: boolean | string
) => {
  if (note && typeof note != 'string') {
    const artist = value2.slice(0, -1);
    return (
      value1.artist_notes &&
      textListFilter(fixValue(Object.keys(value1.artist_notes)), operator, fixValue(artist))
    );
  }
  if (note) {
    if (!value1.artist_notes) {
      return false;
    }
    const cardNote = Object.entries(value1.artist_notes).find(([key, value]) =>
      textEquals(fixValue(key), value2)
    )?.[1];
    if (!cardNote) {
      return false;
    }
    return includeEqualsOp(operator, textContains, textEquals, fixValue(cardNote), note);
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
/**
 * The summary for an artist filter
 * @param operator the operator to use
 * @param value the artist to check for
 * @param invert whether the search is inverted
 * @param note the note to check for, or the boolean for how to check for a note
 */
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
            : ` ${xor(opIsNegative(operator), invert) ? 'does not have' : 'has'} a note`
        }`
      : ''
  }`;

/**
 * Checks a card to see if its tags include an tag from a search, and possibly also checks against tag notes
 * @param value1 card to use
 * @param operator operator to use
 * @param value2 tag to check for
 * @param note note to check for, if any; if boolean, just checks for (non)existence of a note
 */
export const tagFilter: noteFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  note?: boolean | string
) => {
  if (note && typeof note != 'string') {
    const tag = value2.slice(0, -1);
    return (
      value1.tag_notes &&
      textListFilter(fixValue(Object.keys(value1.tag_notes)), operator, fixValue(tag))
    );
  }
  if (note) {
    if (!value1.tag_notes) {
      return false;
    }
    const cardNote = Object.entries(value1.tag_notes).find(([key, value]) =>
      textEquals(fixValue(key), value2)
    )?.[1];
    if (!cardNote) {
      return false;
    }
    return includeEqualsOp(operator, textContains, textEquals, fixValue(cardNote), note);
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
/**
 * The summary for a tag filter
 * @param operator the operator to use
 * @param value the tag to check for
 * @param invert whether the search is inverted
 * @param note the note to check for, or the boolean for how to check for a note
 */
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
            : ` ${xor(opIsNegative(operator), invert) ? 'does not have' : 'has'} a note`
        }`
      : ''
  }`;
/**
 * The summary for a watermark filter
 * @param operator the operator to use
 * @param value the search watermark to use
 */
export const watermarkSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the cards ${opToDont(operator)} have the "${value}" watermark`;
/**
 * The summary for a keyword filter
 * @param operator the operator to use
 * @param value the search keyword to use
 */
export const keywordSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the cards ${opToDont(operator)} have the keyword "${value}"`;

/**
 * Converts a string to the corresponding {@linkcode HCBorderColor}, if any
 * @param value string to convert
 */
export const toBorder = (value: string): string | undefined => toBorderRecord[value];
/**
 * The summary for a border filter
 * @param operator the operator to use
 * @param value the border from the search
 * @param invert dummy
 */
export const borderSummary = createCorrectedSummary(
  toBorder,
  (operator, value) => `the border color is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown border color "${value}"`
);

/**
 * Converts a string to the corresponding {@linkcode HCFrame | HCFrame[]}, if any
 * @param value string to convert
 */
export const toCardFrame = (text: string): HCFrame[] | undefined =>
  wrapArray(toCardFrameRecord[text]);
const getFrameName = (text: string) => {
  const frame = toCardFrame(text);
  return frame ? frameNames.find(frames => listsAreLooselyEqual(frames[0], frame))?.[1] : undefined;
};
/**
 * The summary for a card frame filter
 * @param operator the operator to use
 * @param value the card frame from the search
 * @param invert dummy
 */
export const cardFrameSummary = createCorrectedSummary(
  getFrameName,
  (operator, value) => `the cards ${opToDont(operator)} have ${value} frame`,
  (operator, value) => `!Unknown card frame "${value}"`
);

/**
 * Converts a string to the corresponding {@linkcode HCFrameEffect | HCFrameEffect[]}, if any
 * @param value string to convert
 */
export const toFrameEffect = (text: string): HCFrameEffect[] | undefined =>
  wrapArray(toFrameEffectRecord[text]);

const getFrameEffectName = (text: string) => {
  const frameEffect = toFrameEffect(text);
  return frameEffect
    ? frameEffectNames.find(frames => listsAreLooselyEqual(frames[0], frameEffect))?.[1]
    : undefined;
};
/**
 * The summary for a frame effect filter
 * @param operator the operator to use
 * @param value the frame effect from the search
 * @param invert dummy
 */
export const frameEffectSummary = createCorrectedSummary(
  getFrameEffectName,
  (operator, value) => `the cards ${opToDont(operator)} have ${value}`,
  (operator, value) => `!Unknown frame effect "${value}"`
);

/**
 * Converts a string to the corresponding {@linkcode HCFrame | HCFrame[]}
 * or {@linkcode HCFrameEffect | HCFrameEffect[]}, if any
 * @param value string to convert
 */
export const toFrame = (text: string): HCFrame[] | HCFrameEffect[] | undefined =>
  toCardFrame(text) ?? toFrameEffect(text);

/**
 * The summary for a frame filter
 * @param operator the operator to use
 * @param value the frame from the search
 */
export const frameSummary: summaryFunction<string> = (operator: opType, value: string) => {
  const frame = getFrameName(value);
  const frameEffect = getFrameEffectName(value);
  if (frame) {
    return cardFrameSummary(operator, value);
  } else if (frameEffect) {
    return frameEffectSummary(operator, value);
  } else {
    return `!Unknown frame "${value}"`;
  }
};

/**
 * Converts a string to the corresponding showcase frame(s), if any
 * @param value string to convert
 */
export const toShowcaseFrame = (text: string): string[] | undefined =>
  wrapArray(toShowcaseFrameRecord[text]);
const getShowcaseName = (text: string) =>
  toShowcaseFrame(text)
    ?.map(e => `"${e}"`)
    .join(' or ');
/**
 * The summary for a showcase frame filter
 * @param operator the operator to use
 * @param value the showcase frame from the search
 * @param invert dummy
 */
export const showcaseSummary = createCorrectedSummary(
  getShowcaseName,
  (operator, value) => `the cards ${opToDont(operator)} have a ${value} showcase frame`,
  (operator, value) => `!Unknown showcase frame "${value}"`
);
/**
 * The summary for a kind filter
 * @param operator the operator to use
 * @param value the kind from the search
 * @param invert dummy
 */
export const kindSummary = createSummary(
  isKind,
  (operator, value) => `the kind is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown kind "${value}"`
);

/**
 * Converts a string to the corresponding card {@linkcode HCLayout | HCLayout[]}, if any
 * @param value string to convert
 */
export const toCardLayout = (text: string): HCLayout[] | undefined =>
  wrapArray(toCardLayoutRecord[text]);
const getCardLayoutName = (text: string) =>
  toCardLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');
/**
 * The summary for a card layout filter
 * @param operator the operator to use
 * @param value the card layout from the search
 * @param invert dummy
 */
export const cardLayoutSummary = createCorrectedSummary(
  getCardLayoutName,
  (operator, value) => `the card layout is ${opToNot(operator)} ${value}`,
  (operator, value) => `!Unknown card layout "${value}"`
);

/**
 * Converts a string to the corresponding face {@linkcode HCLayout | HCLayout[]}, if any
 * @param value string to convert
 */
export const toFaceLayout = (text: string): HCLayout[] | undefined =>
  wrapArray(toFaceLayoutRecord[text]);
const getFaceLayoutName = (text: string) =>
  toFaceLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');
/**
 * The summary for a face layout filter
 * @param operator the operator to use
 * @param value the face layout from the search
 * @param invert dummy
 */
export const faceLayoutSummary = createCorrectedSummary(
  getFaceLayoutName,
  (operator, value) => `the cards ${opToDont(operator)} have a face with layout ${value}`,
  (operator, value) => `!Unknown face layout "${value}"`
);

/**
 * Converts a string to the corresponding {@linkcode HCLayout | HCLayout[]}, if any
 * @param value string to convert
 */
export const toAnyLayout = (text: string): HCLayout[] | undefined =>
  toCardLayout(text) ?? toFaceLayout(text);
const getAnyLayoutName = (text: string) =>
  toAnyLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');

/**
 * The summary for a layout filter
 * @param operator the operator to use
 * @param value the layout from the search
 * @param invert dummy
 */
export const anyLayoutSummary = createCorrectedSummary(
  getAnyLayoutName,
  (operator, value) =>
    `the cards ${opToDont(operator)} have layout ${value} or a face with that layout`,
  (operator, value) => `!Unknown layout "${value}"`
);

/**
 * The summary for a set filter
 * @param operator the operator to use
 * @param value the set from the search
 * @param invert dummy
 */
export const setSummary = createSummary(
  isSetCode,
  (operator, value) => `the set is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown set code "${value}"`
);
/**
 * The summary for a block filter
 * @param operator the operator to use
 * @param value the set from the search
 * @param invert dummy
 */
export const blockSummary = createSummary(
  isSetCode,
  (operator, value) => `the block is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown set code "${value}"`
);
/**
 * The summary for a group filter
 * @param operator the operator to use
 * @param value the set from the search
 * @param invert dummy
 */
export const groupSummary = createSummary(
  isSetCode,
  (operator, value) => `the set is ${opToNot(operator)} from the "${value}" set group`,
  (operator, value) => `!Unknown set code "${value}"`
);
/**
 * The strings that can be converted to {@linkcode SetType} and their conversions
 */
export const equivSetTypes: Record<string, SetType> = {
  maincube: SetType.Main,
  sidecube: SetType.Side,
  vetoed: SetType.Veto,
};

export const toSetType = (value: string): SetType | undefined =>
  equivSetTypes[value] ?? (isSetType(value) ? value : undefined);

/**
 * The summary for a set type filter
 * @param operator the operator to use
 * @param value the set type from the search
 * @param invert dummy
 */
export const setTypeSummary = createCorrectedSummary<string>(
  toSetType,
  (operator, value) => `the set type is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown set type "${value}"`
);

export const toIn = (value: string): string | string[] | undefined =>
  toSetType(value) ?? (isSetCode(value) ? getSetAndDirectChildSets(value) : undefined);

const isIn = (value: string): boolean | undefined => Boolean(toSetType(value) || isSetCode(value));
/**
 * The summary for a set inclusion filter
 * @param operator the operator to use
 * @param value the set/code from the search
 * @param invert dummy
 */
export const inSummary = createSummary(
  isIn,
  (operator, value) => `the card was ${opToNot(operator)} in "${value}"`,
  (operator, value) => `!Unknown set code "${value}"`
);
