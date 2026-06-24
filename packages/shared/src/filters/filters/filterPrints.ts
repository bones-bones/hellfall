import { HCCard, isSetCode, SetCode, isSetType } from '@hellfall/shared/types';
import { invertOptionType, opType, printsFilter } from '../types';
import { createNumSummary, createSummary, opAsBool, opIsNegative, opToNot } from '../utils';
import { equivSetTypes, filterSet, filterSetType } from './filterSet';
import { filterNumberString } from './filterNumber';

export const filterInSet: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    opAsBool(
      value1.some(value => filterSet(value, '=', value2)),
      operator
    ),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      isSetCode,
      (operator, value) => `the card was ${opToNot(operator)} in "${value}"`,
      (operator, value) => `!Unknown set code "${value}"`
    ),
  }
);
export const filterInSetType: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    opAsBool(
      value1.some(value => filterSetType(value, '=', value2)),
      operator
    ),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      (value: string) => isSetType(value) || isSetType(equivSetTypes[value]),
      (operator, value) => `the card was in ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown set type "${value}"`
    ),
  }
);
export const getSetNumber = (cards: HCCard.Any[]): number => {
  const setList: SetCode[] = [];
  cards.forEach(card => {
    if (!setList.includes(card.set)) {
      setList.push(card.set);
    }
  });
  return setList.length;
};
export const filterSetsNumber: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    filterNumberString(getSetNumber(value1), operator, value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createNumSummary('the number of times a card has appeared in a set'),
  }
);
export const filterPrintsNumber: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    filterNumberString(value1.length, operator, value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createNumSummary('the number of prints'),
  }
);

export const filterIsUnique: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    opAsBool(filterSetsNumber(value1, '=', '1'), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      `the card has been printed ${opIsNegative(operator) ? 'more than' : 'exactly'} once`,
  }
);
