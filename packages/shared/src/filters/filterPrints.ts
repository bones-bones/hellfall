import {
  equivSetTypes,
  filterNumberString,
  filterSet,
  filterSetType,
  invertOptionType,
  opAsBool,
  opIsNegative,
  opToNot,
  opType,
  printsFilter,
} from '.';
import { HCCard, isSetCode, SetCode } from '../types';
import { isSetType } from '../types/Set/values';
import { isNumber } from '../utils';

export const filterInSet: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    opAsBool(
      value1.some(value => filterSet(value, '=', value2)),
      operator
    ),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      isSetCode(value)
        ? `the card was ${opToNot(operator)} in "${value}"`
        : `!Unknown set code "${value}"`,
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
    toSummary: (operator: opType, value: string) =>
      isSetType(value)
        ? `the set type is ${opToNot(operator)} "${value}"`
        : isSetType(equivSetTypes[value])
        ? `the set type is ${opToNot(operator)} "${equivSetTypes[value]}"`
        : `!Unknown set type "${value}"`,
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
    isNumber(value2) ? filterNumberString(getSetNumber(value1), operator, value2) : false,
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      `${
        isNumber(value) ? 'the number of times a card has appeared in a set ' : ''
      }${filterNumberString.toSummary(operator, value)}`,
  }
);
export const filterPrintsNumber: printsFilter = Object.assign(
  (value1: HCCard.Any[], operator: opType, value2: string) =>
    isNumber(value2) ? filterNumberString(value1.length, operator, value2) : false,
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      `${isNumber(value) ? 'the number of prints ' : ''}${filterNumberString.toSummary(
        operator,
        value
      )}`,
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
