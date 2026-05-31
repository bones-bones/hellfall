import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import {
  includeFilter,
  inclusionOptions,
  inclusionType,
  invertOptionType,
  opType,
  cardStringFilter,
} from './types';
import { funcOp, opToNot } from './filterUtils';
import { canBeInDecks, extraSetList, textSearchIncludes } from '@hellfall/shared/utils';

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

export const filterSetCard: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    funcOp(operator, (set: string) => textSearchIncludes(set, value2), value1.set),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => `the set is ${opToNot(operator)} "${value}"`,
  }
);

const includeComponent = (part: HCRelatedCard) =>
  ['token_maker', 'draft_partner'].includes(part.component);

export const filterSetToken: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const isSetInResults = (set: string) => textSearchIncludes(set, value2);
    const shouldIncludeMeld = (part: HCRelatedCard, set: string) => {
      return part.component == 'meld_part' && part.set != set;
    };
    const tokenInSet = (token: HCCard.Any): boolean | undefined => {
      if (value1.all_parts) {
        if (
          value1.all_parts
            .filter(part => isSetInResults(part.set))
            .some(part => includeComponent(part) || shouldIncludeMeld(part, value1.set))
        ) {
          return true;
        }
      }
      return !value2.length && value1.kind != 'card';
    };
    return funcOp(operator, tokenInSet, value1);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      `the token set is ${opToNot(operator)} "${value}"`,
  }
);

export const filterSetBoth: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    filterSetCard(value1, operator, value2) || filterSetToken(value1, operator, value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => `the block is ${opToNot(operator)} "${value}"`,
  }
);
