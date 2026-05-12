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

export const filterIncludeExtras: includeFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    switch (value2) {
      case 'all':
        return !opIsNegative(operator);
      case 'extras':
        return opIsNegative(operator) ? !extraSetList.includes(value1.set) : true;
      case 'nonextras':
        return opIsNegative(operator) ? extraSetList.includes(value1.set) : true;
    }
    return true;
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      inclusionOptions.includes(value as inclusionType)
        ? `${opIsNegative(operator) ? 'excluding' : 'including'} ${value} ${
            value == 'all' ? 'cards' : ''
          }`
        : `!Unknown inclusion option ${value}`,
  }
);

export const filterSetCard: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) =>
    funcOp(operator, (set: string) => set.includes(value2), value1.set),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => `the set is ${opToNot(operator)} "${value}"`,
  }
);

const includeComponent = (part: HCRelatedCard) =>
  ['token_maker', 'draft_partner'].includes(part.component);

export const filterSetToken: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const isSetInResults = (set: string) => set.includes(value2);
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
