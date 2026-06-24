import { HCCard, isSetCode, SetCode, isSetType, SetType } from '@hellfall/shared/types';
import {
  includeFilter,
  inclusionOptions,
  inclusionType,
  invertOptionType,
  opType,
  cardStringFilter,
  summaryFunction,
} from '../types';
import { createCorrectedSummary, opAsBool, opToNot, createSummary, unescapeText } from '../utils';
import {
  canBeInDecks,
  extraSetList,
  getSet,
  inSetBlock,
  inSetGroup,
  inSetOrDirectChildren,
} from '@hellfall/shared/utils';

const inclusionNicknames: Record<string, inclusionType> = {
  a: 'all',
  e: 'extras',
  extra: 'extras',
  ec: 'extracards',
  extracard: 'extracards',
  t: 'tokens',
  token: 'tokens',
  ne: 'nonextras',
  nonextra: 'nonextras',
  v: 'vetoed',
  veto: 'vetoed',
};

const includeToSummary: Record<inclusionType, string> = {
  all: 'all cards',
  extras: 'all extras',
  extracards: 'extra cards',
  tokens: 'tokens',
  nonextras: 'nonextras',
  vetoed: 'vetoed cards',
};

const correctValue = (value: string): inclusionType | undefined =>
  value in inclusionNicknames
    ? inclusionNicknames[value]
    : inclusionOptions.includes(value as inclusionType)
    ? (value as inclusionType)
    : undefined;
const validSummary: summaryFunction<string> = (operator, value, invert) =>
  `${invert ? 'ex' : 'in'}cluding ${includeToSummary[value as inclusionType]}`;
const invalidSummary: summaryFunction<string> = (operator, value, invert) =>
  `!Unknown ${invert ? 'ex' : 'in'}clusion option "${value}"`;
export const filterIncludeExtras: includeFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    switch (correctValue(unescapeText(value2))) {
      case 'all':
        return true;
      case 'extras':
        return extraSetList.includes(value1.set);
      case 'extracards':
        return extraSetList.includes(value1.set) && canBeInDecks(value1);
      case 'tokens':
        return !canBeInDecks(value1);
      case 'nonextras':
        return !extraSetList.includes(value1.set);
      case 'vetoed':
        return value1.set.includes('HCV');
    }
    return true;
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: createCorrectedSummary(correctValue, validSummary, invalidSummary),
  }
);

export const filterSet: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetOrDirectChildren(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      isSetCode,
      (operator, value) => `the set is ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown set code "${value}"`
    ),
  }
);

export const filterBlock: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetBlock(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      isSetCode,
      (operator, value) => `the block is ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown set code "${value}"`
    ),
  }
);

export const filterGroup: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetGroup(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      isSetCode,
      (operator, value) => `the set is ${opToNot(operator)} from the "${value}" set group`,
      (operator, value) => `!Unknown set code "${value}"`
    ),
  }
);

export const equivSetTypes: Record<string, SetType> = {
  maincube: SetType.Main,
  sidecube: SetType.Side,
  vetoed: SetType.Veto,
};

export const filterSetType: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(
      getSet(value1.set)?.set_type == (isSetType(value2) ? value2 : equivSetTypes[value2]),
      operator
    ),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      (value: string) => isSetType(value) || isSetType(equivSetTypes[value]),
      (operator, value) => `the set type is ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown set type "${value}"`
    ),
  }
);
