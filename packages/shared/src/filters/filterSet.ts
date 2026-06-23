import { HCCard, HCRelatedCard, isSetCode, SetCode } from '@hellfall/shared/types';
import {
  includeFilter,
  inclusionOptions,
  inclusionType,
  invertOptionType,
  opType,
  cardStringFilter,
} from './types';
import { opAsBool, opToNot } from './filterUtils';
import {
  canBeInDecks,
  extraSetList,
  getSet,
  inSetBlock,
  inSetGroup,
  inSetOrDirectChildren,
} from '@hellfall/shared/utils';
import { setsData } from '@hellfall/shared/data';
import { isSetType, SetType } from '../types/Set/values';

const sets = setsData.data;

export const inclusionNicknames: Record<string, inclusionType> = {
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

export const filterIncludeExtras: includeFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    switch (value2) {
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
    toSummary: (operator: opType, value: string, invert?: boolean) => {
      const correctValue: inclusionType | undefined =
        value in inclusionNicknames
          ? inclusionNicknames[value]
          : inclusionOptions.includes(value as inclusionType)
          ? (value as inclusionType)
          : undefined;
      if (!correctValue) {
        return `!Unknown ${invert ? 'ex' : 'in'}clusion option "${value}"`;
      }
      return `${invert ? 'ex' : 'in'}cluding ${includeToSummary[correctValue]}`;
    },
  }
);

export const filterSet: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetOrDirectChildren(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      isSetCode(value)
        ? `the set is ${opToNot(operator)} "${value}"`
        : `!Unknown set code "${value}"`,
  }
);

export const filterBlock: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetBlock(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      isSetCode(value)
        ? `the block is ${opToNot(operator)} "${value}"`
        : `!Unknown set code "${value}"`,
  }
);

export const filterGroup: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    opAsBool(inSetGroup(value1.set, value2 as SetCode), operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      isSetCode(value)
        ? `the set is ${opToNot(operator)} from the "${value}" set group`
        : `!Unknown set code "${value}"`,
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
    toSummary: (operator: opType, value: string) =>
      isSetType(value)
        ? `the set type is ${opToNot(operator)} "${value}"`
        : isSetType(equivSetTypes[value])
        ? `the set type is ${opToNot(operator)} "${equivSetTypes[value]}"`
        : `!Unknown set type "${value}"`,
  }
);
