import { HCCard, HCRelatedCard, SetCode } from '@hellfall/shared/types';
import {
  includeFilter,
  inclusionOptions,
  inclusionType,
  invertOptionType,
  opType,
  cardStringFilter,
} from './types';
import { funcOp, opToNot } from './filterUtils';
import {
  canBeInDecks,
  extraSetList,
  getChildSets,
  textSearchIncludes,
} from '@hellfall/shared/utils';
import { setsData } from '@hellfall/shared/data';

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

/**
 * To use in filters when need to check if one set is in another
 * @param value1 the value of the card's set
 * @param value2 the value of the search's set
 * @returns
 */
export const inChildSets = (value1: SetCode, value2: SetCode) =>
  getChildSets(value2)?.some(set => set == value1);

export const inSetOrChildren = (value1: SetCode, value2: SetCode) =>
  value1 == value2 || inChildSets(value1, value2);

/**
 * To use in filters when need to check if one set is in another's group
 * @param value1 the value of the card's set
 * @param value2 the value of the search's set
 * @returns
 */
// export const inSetBlock = (value1:SetCode, value2:SetCode) => getChildSets(value2)?.some(set=>set == value1) || ;

/**
 * To use in filters when need to check against a set
 * @param value1 the value of the card's set
 * @param operator operation to use
 * @param value2 the value of the search's set
 * @returns
 */
// export const setOp = (value1:SetCode, operator: opType, value2:SetCode) => {

//   switch (operator) {
//     case '<':
//       return !func(value);
//     case '<=':
//       return func(value);
//     case '=':
//       return func(value);
//     case '>=':
//       return func(value);
//     case '>':
//       return !func(value);
//     case '!=':
//       return !func(value);
//   }
// };

export const filterSetCard: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    funcOp(operator, (set: string) => textSearchIncludes(set ?? '', value2), value1.set),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => `the set is ${opToNot(operator)} "${value}"`,
  }
);

const includeComponent = (part: HCRelatedCard) =>
  ['token_maker', 'draft_partner'].includes(part.component);

export const filterSetToken: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const isSetInResults = (set: string) => textSearchIncludes(set ?? '', value2);
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
