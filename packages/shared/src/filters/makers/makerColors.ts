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
  miscColorIdentitySummary,
  miscColorIndicatorSummary,
  miscColorSummary,
  miscHybridIdentitySummary,
} from '../filters';
import { looseOpType, colorFilterMaker, colorSearch, ColorFilter } from '../types';

/**
 * Makes a color filter
 * @param value the value from the search
 * @param op the operator from the search
 */
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

/**
 * Makes a color identity filter
 * @param value the value from the search
 * @param op the operator from the search
 */
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

/**
 * Makes a color indicator filter
 * @param value the value from the search
 * @param op the operator from the search
 */
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

/**
 * Makes a hybrid identity filter
 * @param value the value from the search
 * @param op the operator from the search
 */
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

/**
 * Makes a misc color filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeMiscColorFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'misccolor',
    colorFilter,
    miscColorSummary,
    value,
    op,
    card => colorMiscReduce(handleChooseColors(card, card.colors, value)),
    Array.isArray(value) ? '>=' : '='
  );
};

/**
 * Makes a misc color identity filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeMiscIdentityFilter: colorFilterMaker<string[]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[]>(
    'miscidentity',
    colorFilter,
    miscColorIdentitySummary,
    value,
    op,
    card => colorMiscReduce(handleChooseColors(card, card.color_identity, value)),
    Array.isArray(value) ? '<=' : '='
  );
};

/**
 * Makes a misc color indicator filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeMiscIndicatorFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'miscindicator',
    colorIndicatorFilter,
    miscColorIndicatorSummary,
    value,
    op,
    card => getColorsFromFaces(card, 'color_indicator').map(c => colorMiscReduce(c))
  );
};

/**
 * Makes a misc hybrid identity filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeMiscHybridFilter: colorFilterMaker<string[][]> = (
  value: colorSearch,
  op: looseOpType
) => {
  return new ColorFilter<string[][]>(
    'mischybrid',
    hybridIdentityFilter,
    miscHybridIdentitySummary,
    value,
    op,
    card => hybridIdentityMiscReduce(handleChooseHybrid(card, card.color_identity_hybrid, value)),
    Array.isArray(value) ? '<=' : '='
  );
};
