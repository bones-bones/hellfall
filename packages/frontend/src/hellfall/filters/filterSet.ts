import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { extraSetList } from '@hellfall/shared/data/sets';
import { getHc5 } from '../../hells-cubes/getHc5';
import { looseOpType, opType, setFilter } from './types';

const excludeExtras = ['HCV.1', 'HCV.2', 'HCV.3', 'HCV.4'];
export const filterSetCard: setFilter = Object.assign(
  (
    value1: string[],
    operator: looseOpType,
    value2: HCCard.Any,
    includeExtraSets: boolean = false
  ) => {
    const actualOp = operator === ':' ? filterSetCard.defaultOp : operator;
    const shouldExclude = (set: string) => {
      return excludeExtras.includes(set) && !includeExtraSets && !value1.includes(set);
    };
    /**
     * Checks if a card's set is in the results. Also returns true if the card's set is a subset of one of the results.
     * @param set set of a card
     * @returns if set is in results
     */
    const isSetInResults = (set: string) => {
      if (value1.length) {
        return value1.some(e => set.includes(e) && !shouldExclude(set));
      } else if (!includeExtraSets) {
        return !extraSetList.some(e => set.includes(e));
      }
      return true;
    };
    const cardInSet = (card: HCCard.Any): boolean => {
      return !(value1.length && !isSetInResults(card.set));
    };
    switch (actualOp) {
      case '<':
        return !isSetInResults(value2.set);
      case '<=':
        return isSetInResults(value2.set);
      case '=':
        return isSetInResults(value2.set);
      case '>=':
        return isSetInResults(value2.set);
      case '>':
        return !isSetInResults(value2.set);
      case '!=':
        return !isSetInResults(value2.set);
    }
  },
  { defaultOp: '=' as opType }
);
const includeComponent = (part: HCRelatedCard) => {
  return ['token_maker', 'draft_partner'].includes(part.component);
};
export const filterSetToken: setFilter = Object.assign(
  (
    value1: string[],
    operator: looseOpType,
    value2: HCCard.Any,
    includeExtraSets: boolean = false
  ) => {
    const actualOp = operator === ':' ? filterSetCard.defaultOp : operator;
    const shouldExclude = (set: string) => {
      return excludeExtras.includes(set) && !includeExtraSets && !value1.includes(set);
    };
    /**
     * Checks if a card's set is in the results. Also returns true if the card's set is a subset of one of the results.
     * @param set set of a card
     * @returns if set is in results
     */
    const isSetInResults = (set: string) => {
      if (value1.length) {
        return value1.some(e => set.includes(e) && !shouldExclude(set));
      } else if (!includeExtraSets) {
        return !extraSetList.some(e => set.includes(e));
      }
      return true;
    };
    const shouldIncludeMeld = (part: HCRelatedCard, set: string) => {
      return part.component == 'meld_part' && part.set != set;
    };
    const tokenInSet = (token: HCCard.Any): boolean => {
      if (value1.length && value2.all_parts) {
        if (
          value2.all_parts
            .filter(part => isSetInResults(part.set))
            .some(part => includeComponent(part) || shouldIncludeMeld(part, value2.set))
        ) {
          return true;
        }
      }
      return Boolean(!value1.length && token.isActualToken);
    };
    switch (actualOp) {
      case '<':
        return !tokenInSet(value2);
      case '<=':
        return tokenInSet(value2);
      case '=':
        return tokenInSet(value2);
      case '>=':
        return tokenInSet(value2);
      case '>':
        return !tokenInSet(value2);
      case '!=':
        return !tokenInSet(value2);
    }
  },
  { defaultOp: '=' as opType }
);

export const filterSetBoth: setFilter = Object.assign(
  (
    value1: string[],
    operator: looseOpType,
    value2: HCCard.Any,
    includeExtraSets: boolean = false
  ) => {
    const actualOp = operator === ':' ? filterSetCard.defaultOp : operator;
    return (
      filterSetCard(value1, actualOp, value2, includeExtraSets) ||
      filterSetToken(value1, actualOp, value2, includeExtraSets)
    );
  },
  { defaultOp: '=' as opType }
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
  return cards.filter(card => filterSetCard([set], '=', card));
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
    filterSetBoth(set == 'All' ? [] : [set], '=', card, true)
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
