import {
  colorMiscReduce,
  getColorsFromFaces,
  handleChooseColors,
  handleChooseHybrid,
  hybridIdentityMiscReduce,
} from '@hellfall/shared/utils';
import {
  filterColorContents,
  filterColorIdentityContents,
  filterColorIdentityNumber,
  filterColorIdentityShort,
  filterColorIndicatorContents,
  filterColorIndicatorNumber,
  filterColorIndicatorShort,
  filterColorNumber,
  filterColorShort,
  filterHybridIdentityContents,
  filterHybridIdentityNumber,
  filterHybridIdentityShort,
} from '../filters';
import {
  PassThroughSummaryFilter,
  looseOpType,
  shorthandType,
  colorFilterMaker,
  cardFilter,
} from '../types';

export const makeColorFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[], string[] | number | shorthandType>(
    'color',
    (Array.isArray(value)
      ? filterColorContents
      : typeof value == 'number'
      ? filterColorNumber
      : filterColorShort) as cardFilter<string[], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '>=' : '=',
    card => handleChooseColors(card, card.colors, value)
  );
};

export const makeIdentityFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[], string[] | number | shorthandType>(
    'identity',
    (Array.isArray(value)
      ? filterColorIdentityContents
      : typeof value == 'number'
      ? filterColorIdentityNumber
      : filterColorIdentityShort) as cardFilter<string[], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '<=' : '=',
    card => handleChooseColors(card, card.color_identity, value)
  );
};

export const makeIndicatorFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[][], string[] | number | shorthandType>(
    'indicator',
    (Array.isArray(value)
      ? filterColorIndicatorContents
      : typeof value == 'number'
      ? filterColorIndicatorNumber
      : filterColorIndicatorShort) as cardFilter<string[][], string[] | number | shorthandType>,
    value,
    op,
    '=',
    card => getColorsFromFaces(card, 'color_indicator')
  );
};

export const makeHybridFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[][], string[] | number | shorthandType>(
    'hybrid',
    (Array.isArray(value)
      ? filterHybridIdentityContents
      : typeof value == 'number'
      ? filterHybridIdentityNumber
      : filterHybridIdentityShort) as cardFilter<string[][], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '<=' : '=',
    card => handleChooseHybrid(card, card.color_identity_hybrid, value)
  );
};

export const makeMiscColorFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[], string[] | number | shorthandType>(
    'misccolor',
    (Array.isArray(value)
      ? filterColorContents
      : typeof value == 'number'
      ? filterColorNumber
      : filterColorShort) as cardFilter<string[], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '>=' : '=',
    card => colorMiscReduce(handleChooseColors(card, card.colors, value))
  );
};

export const makeMiscIdentityFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[], string[] | number | shorthandType>(
    'miscidentity',
    (Array.isArray(value)
      ? filterColorIdentityContents
      : typeof value == 'number'
      ? filterColorIdentityNumber
      : filterColorIdentityShort) as cardFilter<string[], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '<=' : '=',
    card => colorMiscReduce(handleChooseColors(card, card.color_identity, value))
  );
};

export const makeMiscIndicatorFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[][], string[] | number | shorthandType>(
    'miscindicator',
    (Array.isArray(value)
      ? filterColorIndicatorContents
      : typeof value == 'number'
      ? filterColorIndicatorNumber
      : filterColorIndicatorShort) as cardFilter<string[][], string[] | number | shorthandType>,
    value,
    op,
    '=',
    card => getColorsFromFaces(card, 'color_indicator').map(c => colorMiscReduce(c))
  );
};

export const makeMiscHybridFilter: colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => {
  return new PassThroughSummaryFilter<string[][], string[] | number | shorthandType>(
    'mischybrid',
    (Array.isArray(value)
      ? filterHybridIdentityContents
      : typeof value == 'number'
      ? filterHybridIdentityNumber
      : filterHybridIdentityShort) as cardFilter<string[][], string[] | number | shorthandType>,
    value,
    op,
    Array.isArray(value) ? '<=' : '=',
    card => hybridIdentityMiscReduce(handleChooseHybrid(card, card.color_identity_hybrid, value))
  );
};
