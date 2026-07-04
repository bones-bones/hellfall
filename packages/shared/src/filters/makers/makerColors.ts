import {
  colorMiscReduce,
  getColorsFromFaces,
  handleChooseColors,
  handleChooseHybrid,
  hybridIdentityMiscReduce,
} from '@hellfall/shared/utils';
import {
  colorFilter,
  colorIdentitySummary,
  colorIndicatorFilter,
  colorIndicatorSummary,
  colorSummary,
  hybridIdentityFilter,
  hybridIdentitySummary,
} from '../filters';
import { looseOpType, colorFilterMaker, colorSearch, ColorFilter } from '../types';

export const makeColorFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'color',
    colorFilter,
    colorSummary,
    value,
    op,
    card => handleChooseColors(card, card.colors, value),
    Array.isArray(value) ? '>=' : '='
  );
};

export const makeIdentityFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'identity',
    colorFilter,
    colorIdentitySummary,
    value,
    op,
    card => handleChooseColors(card, card.color_identity, value),
    Array.isArray(value) ? '<=' : '='
  );
};

export const makeIndicatorFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'indicator',
    colorIndicatorFilter,
    colorIndicatorSummary,
    value,
    op,
    card => getColorsFromFaces(card, 'color_indicator')
  );
};

export const makeHybridFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'hybrid',
    hybridIdentityFilter,
    hybridIdentitySummary,
    value,
    op,
    card => handleChooseHybrid(card, card.color_identity_hybrid, value),
    Array.isArray(value) ? '<=' : '='
  );
};

export const makeMiscColorFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'misccolor',
    colorFilter,
    colorSummary,
    value,
    op,
    card => colorMiscReduce(handleChooseColors(card, card.colors, value)),
    Array.isArray(value) ? '>=' : '='
  );
};

export const makeMiscIdentityFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'miscidentity',
    colorFilter,
    colorIdentitySummary,
    value,
    op,
    card => colorMiscReduce(handleChooseColors(card, card.color_identity, value)),
    Array.isArray(value) ? '<=' : '='
  );
};

export const makeMiscIndicatorFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'miscindicator',
    colorIndicatorFilter,
    colorIndicatorSummary,
    value,
    op,
    card => getColorsFromFaces(card, 'color_indicator').map(c => colorMiscReduce(c))
  );
};

export const makeMiscHybridFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'mischybrid',
    hybridIdentityFilter,
    hybridIdentitySummary,
    value,
    op,
    card => hybridIdentityMiscReduce(handleChooseHybrid(card, card.color_identity_hybrid, value)),
    Array.isArray(value) ? '<=' : '='
  );
};
