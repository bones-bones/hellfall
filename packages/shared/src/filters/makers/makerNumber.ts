import { getFromFaces, toFaces, toNumber } from '@hellfall/shared/utils';
import { filterComp, filterNumberString, filterNumberStringList } from '../filters';
import {
  CompFilter,
  NumberPropSummaryFilter,
  looseOpType,
  compFilterMaker,
  filterMaker,
} from '../types';

export const makeCollectorNumberFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<string | undefined, string>(
    'number',
    filterNumberString,
    value,
    op,
    '=',
    card => card.collector_number,
    'the collector number'
  );
};

export const makeCompFilter: compFilterMaker = (
  value1: string,
  op: looseOpType,
  value2: string
) => {
  return new CompFilter('comp', filterComp, value1, op, value2, '=');
};

export const makeManaValueFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<number, string>(
    'manavalue',
    filterNumberString,
    value,
    op,
    '=',
    card => card.mana_value,
    'the mana value'
  );
};
export const makePowerFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'power',
    filterNumberStringList,
    value,
    op,
    '=',
    card => getFromFaces(card, 'power'),
    'the power'
  );
};
export const makeToughnessFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'toughness',
    filterNumberStringList,
    value,
    op,
    '=',
    card => getFromFaces(card, 'toughness'),
    'the toughness'
  );
};

export const makePTFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(number | undefined)[], string>(
    'pt',
    filterNumberStringList,
    value,
    op,
    '=',
    card =>
      toFaces(card).flatMap(e =>
        !e.power && !e.toughness ? [] : (toNumber(e.power) ?? 0) + (toNumber(e.toughness) ?? 0)
      ),
    'the sum of power and toughness'
  );
};

export const makeLoyaltyFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'loyalty',
    filterNumberStringList,
    value,
    op,
    '=',
    card => getFromFaces(card, 'loyalty'),
    'the loyalty'
  );
};

export const makeDefenseFilter: filterMaker = (value: string, op: looseOpType) => {
  return new NumberPropSummaryFilter<(string | undefined)[], string>(
    'defense',
    filterNumberStringList,
    value,
    op,
    '=',
    card => getFromFaces(card, 'defense'),
    'the defense'
  );
};
