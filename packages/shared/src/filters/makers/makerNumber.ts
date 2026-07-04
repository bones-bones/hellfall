import { getFromFaces, toFaces, toNumber } from '@hellfall/shared/utils';
import { comparisonFilter, comparisonSummary } from '../filters';
import {
  ComparisonFilter,
  NumberPropSummaryFilter,
  looseOpType,
  compFilterMaker,
  filterMaker,
} from '../types';
import { numSearchFilter, numSearchListFilter } from '../utils';

export const makeCollectorNumberFilter: filterMaker<string | undefined> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<string | undefined, string>(
    'number',
    numSearchFilter,
    value,
    op,
    card => card.collector_number,
    'the collector number'
  );
};

export const makeCompFilter: compFilterMaker = (
  value1: string,
  op: looseOpType,
  value2: string
) => {
  return new ComparisonFilter('comp', comparisonFilter, comparisonSummary, value1, op, value2, '=');
};

export const makeManaValueFilter: filterMaker<number> = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<number, string>(
    'manavalue',
    numSearchFilter,
    value,
    op,
    card => card.mana_value,
    'the mana value'
  );
};
export const makePowerFilter: filterMaker<(string | undefined)[]> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'power',
    numSearchListFilter,
    value,
    op,
    card => getFromFaces(card, 'power'),
    'the power'
  );
};
export const makeToughnessFilter: filterMaker<(string | undefined)[]> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'toughness',
    numSearchListFilter,
    value,
    op,
    card => getFromFaces(card, 'toughness'),
    'the toughness'
  );
};

export const makePTFilter: filterMaker<(number | undefined)[]> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<(number | undefined)[], string>(
    'pt',
    numSearchListFilter,
    value,
    op,
    card =>
      toFaces(card).flatMap(e =>
        !e.power && !e.toughness ? [] : (toNumber(e.power) ?? 0) + (toNumber(e.toughness) ?? 0)
      ),
    'the sum of power and toughness'
  );
};

export const makeLoyaltyFilter: filterMaker<(string | undefined)[]> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'loyalty',
    numSearchListFilter,
    value,
    op,
    card => getFromFaces(card, 'loyalty'),
    'the loyalty'
  );
};

export const makeDefenseFilter: filterMaker<(string | undefined)[]> = (
  value: string,
  op: looseOpType
) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'defense',
    numSearchListFilter,
    value,
    op,
    card => getFromFaces(card, 'defense'),
    'the defense'
  );
};
