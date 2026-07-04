import { HCCard, isSetCode, SetCode, isSetType } from '@hellfall/shared/types';
import { opType, printsFilterFunction, summaryFunction } from '../types';
import {
  createNumSummary,
  createSummary,
  numSearchFilter,
  opAsBool,
  opIsNegative,
  opToNot,
} from '../utils';
import { equivSetTypes, setFilter, setTypeFilter } from './filterSet';

export const inSetFilter: printsFilterFunction = (
  value1: HCCard.Any[],
  operator: opType,
  value2: string
) =>
  opAsBool(
    value1.some(value => setFilter(value, '=', value2)),
    operator
  );
export const inSetSummary = createSummary(
  isSetCode,
  (operator, value) => `the card was ${opToNot(operator)} in "${value}"`,
  (operator, value) => `!Unknown set code "${value}"`
);

export const inSetTypeFilter: printsFilterFunction = (
  value1: HCCard.Any[],
  operator: opType,
  value2: string
) =>
  opAsBool(
    value1.some(value => setTypeFilter(value, '=', value2)),
    operator
  );
export const inSetTypeSummary = createSummary(
  (value: string) => isSetType(value) || isSetType(equivSetTypes[value]),
  (operator, value) => `the card was in ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown set type "${value}"`
);

const getSetNumber = (cards: HCCard.Any[]): number => {
  const setList: SetCode[] = [];
  cards.forEach(card => {
    if (!setList.includes(card.set)) {
      setList.push(card.set);
    }
  });
  return setList.length;
};
export const setsNumberFilter: printsFilterFunction = (
  value1: HCCard.Any[],
  operator: opType,
  value2: string
) => numSearchFilter(getSetNumber(value1), operator, value2);
export const setsNumberSummary = createNumSummary(
  'the number of times a card has appeared in a set'
);

export const printsNumberFilter: printsFilterFunction = (
  value1: HCCard.Any[],
  operator: opType,
  value2: string
) => numSearchFilter(value1.length, operator, value2);
export const printsNumberSummary = createNumSummary(
  'the number of times a card has appeared in a set'
);

export const isUniqueFilter: printsFilterFunction = (
  value1: HCCard.Any[],
  operator: opType,
  value2: string
) => opAsBool(setsNumberFilter(value1, '=', '1'), operator);
export const isUniqueSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the card has been printed ${opIsNegative(operator) ? 'more than' : 'exactly'} once`;
