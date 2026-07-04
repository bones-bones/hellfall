import {
  textEquals,
  textContains,
  isNumber,
  textListContains,
  textListIncludes,
  isValidV4UUID,
  listsAreLooselyEqual,
  wrapArray,
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
} from '../utils';
import { HCCard, HCFrame, HCFrameEffect, HCLayout, isKind } from '@hellfall/shared/types';
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
export const watermarkSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the cards ${opToDont(operator)} have the "${value}" watermark`;
export const keywordSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the cards ${opToDont(operator)} have the keyword "${value}"`;

export const toBorder = (value: string): string | undefined => toBorderRecord[value];
export const borderSummary = createCorrectedSummary(
  toBorder,
  (operator, value) => `the border color is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown border color "${value}"`
);

export const toCardFrame = (text: string): HCFrame[] | undefined =>
  wrapArray(toCardFrameRecord[text]);
const getFrameName = (text: string) => {
  const frame = toCardFrame(text);
  return frame ? frameNames.find(frames => listsAreLooselyEqual(frames[0], frame))?.[1] : undefined;
};
export const cardFrameSummary = createCorrectedSummary(
  getFrameName,
  (operator, value) => `the cards ${opToDont(operator)} have ${value} frame`,
  (operator, value) => `!Unknown card frame "${value}"`
);

export const toFrameEffect = (text: string): HCFrameEffect[] | undefined =>
  wrapArray(toFrameEffectRecord[text]);

const getFrameEffectName = (text: string) => {
  const frameEffect = toFrameEffect(text);
  return frameEffect
    ? frameEffectNames.find(frames => listsAreLooselyEqual(frames[0], frameEffect))?.[1]
    : undefined;
};
export const frameEffectSummary = createCorrectedSummary(
  getFrameEffectName,
  (operator, value) => `the cards ${opToDont(operator)} have ${value}`,
  (operator, value) => `!Unknown frame effect "${value}"`
);

export const toFrame = (text: string): HCFrame[] | HCFrameEffect[] | undefined =>
  toCardFrame(text) ?? toFrameEffect(text);

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

export const toShowcaseFrame = (text: string): string[] | undefined =>
  wrapArray(toShowcaseFrameRecord[text]);
const getShowcaseName = (text: string) =>
  toShowcaseFrame(text)
    ?.map(e => `"${e}"`)
    .join(' or ');
export const showcaseSummary = createCorrectedSummary(
  getShowcaseName,
  (operator, value) => `the cards ${opToDont(operator)} have a ${value} showcase frame`,
  (operator, value) => `!Unknown showcase frame "${value}"`
);
export const kindSummary = createSummary(
  isKind,
  (operator, value) => `the kind is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown kind "${value}"`
);

export const toCardLayout = (text: string): HCLayout[] | undefined =>
  wrapArray(toCardLayoutRecord[text]);
const getCardLayoutName = (text: string) =>
  toCardLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');
export const cardLayoutSummary = createCorrectedSummary(
  getCardLayoutName,
  (operator, value) => `the card layout is ${opToNot(operator)} ${value}`,
  (operator, value) => `!Unknown card layout "${value}"`
);

export const toFaceLayout = (text: string): HCLayout[] | undefined =>
  wrapArray(toFaceLayoutRecord[text]);
const getFaceLayoutName = (text: string) =>
  toFaceLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');
export const faceLayoutSummary = createCorrectedSummary(
  getFaceLayoutName,
  (operator, value) => `the cards ${opToDont(operator)} have a face with layout ${value}`,
  (operator, value) => `!Unknown face layout "${value}"`
);

export const toAnyLayout = (text: string): HCLayout[] | undefined =>
  toCardLayout(text) ?? toFaceLayout(text);
export const anyLayoutSummary: summaryFunction<string> = (operator: opType, value: string) => {
  const cardLayout = getCardLayoutName(value);
  const faceLayout = getFaceLayoutName(value);
  if (cardLayout) {
    return cardLayoutSummary(operator, value);
  } else if (faceLayout) {
    return faceLayoutSummary(operator, value);
  } else {
    return `!Unknown layout "${value}"`;
  }
};
