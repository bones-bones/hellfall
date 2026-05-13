import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { extraSetList } from '@hellfall/shared/data/sets';
import { getHc5 } from '../../hells-cubes/getHc5';
import {
  includeFilter,
  inclusionOptions,
  inclusionType,
  invertOptionType,
  opType,
  cardStringFilter,
} from './types';
import { funcOp, opIsNegative, opToNot } from './filterUtils';
import { textSearchIncludes } from '@hellfall/shared/utils/textHandling';

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
        return extraSetList.includes(value1.set) && !value1.isActualToken;
      case 'tokens':
        return !!value1.isActualToken;
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
    const tokenInSet = (token: HCCard.Any): boolean => {
      if (value1.all_parts) {
        if (
          value1.all_parts
            .filter(part => isSetInResults(part.set))
            .some(part => includeComponent(part) || shouldIncludeMeld(part, value1.set))
        ) {
          return true;
        }
      }
      return Boolean(!value2.length && token.isActualToken);
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

/**
 * Filters cards based on specified sets
 * @param cards cards to filter
 * @param sets sets to filter for
 * @param extraSets extra sets to filter for
 * @param includeExtraSets whether to hide extra sets by default
 * @param mode whether to fetch only cards in the sets, only tokens made by cards in the sets, or both
 * @returns
 */
export const getFilteredSet = (cards: HCCard.Any[], set: string): HCCard.Any[] => {
  return cards.filter(card => filterSetCard(card, '=', set));
};

/**
 * Get a set split into cards and tokens.
 * @param allCards The list of all cards
 * @param set The set to get
 * @param moveNonDraftablesToTokens Whether to move cards that aren't directly draftable to the tokens section
 * @returns
 */
export const getSplitSet = (
  allCards: HCCard.Any[],
  set: string,
  moveNonDraftablesToTokens: boolean = false
): { cards: HCCard.Any[]; tokens: HCCard.Any[] } => {
  if (set == 'HC5') {
    return { cards: getHc5(), tokens: [] };
  }
  const filteredCards = allCards.filter(card =>
    set == 'All' ? true : filterSetBoth(card, '=', set)
  );
  const cards = filteredCards.filter(
    entry =>
      entry.set.includes(set) && (moveNonDraftablesToTokens ? !entry.not_directly_draftable : true)
  );
  const tokens = filteredCards.filter(
    entry =>
      !entry.set.includes(set) || (moveNonDraftablesToTokens ? entry.not_directly_draftable : false)
  );
  return { cards, tokens };
};

/**
 * Get a list of cards and their tokens.
 * @param allCards The list of all cards
 * @param cardIds The list of card ids to get
 * @returns
 */
export const getCustomCardlist = (
  allCards: HCCard.Any[],
  cardIds: string[]
): { cards: HCCard.Any[]; tokens: HCCard.Any[] } => {
  const cards = allCards.filter(entry => cardIds.includes(entry.id));

  const tokens = allCards.filter(
    entry =>
      !cardIds.includes(entry.id) &&
      cards.some(card => card.all_parts?.some(part => part.id == entry.id))
  );
  return { cards, tokens };
};
