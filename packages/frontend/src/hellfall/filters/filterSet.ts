import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { extraSetList } from '@hellfall/shared/data/sets';
import { getHc5 } from '../../hells-cubes/getHc5';
import { funcOp, getActualOp, looseOpType, opType, setFilter, setListFilter } from './types';

const excludeExtras = ['HCV.1', 'HCV.2', 'HCV.3', 'HCV.4'];
export const filterSetCard: setFilter = Object.assign(
  function (
    this: setFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string,
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    const shouldExclude = (set: string) => {
      return excludeExtras.includes(set) && !includeExtraSets && !value2.includes(set);
    };
    const isSetInResults = (set: string) => set.includes(value2) && !shouldExclude(set);
    return funcOp(actualOp, isSetInResults, value1.set);
  },
  { defaultOp: '=' as opType }
);

export const filterSetListCard: setListFilter = Object.assign(
  function (
    this: setListFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string[],
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    if (value2.length) {
      return value2.some(set => filterSetCard(value1, actualOp, set, includeExtraSets));
    }
    return funcOp(actualOp, set => !extraSetList.includes(set) || includeExtraSets, value1.set);
  },
  { defaultOp: '=' as opType }
);
const includeComponent = (part: HCRelatedCard) => {
  return ['token_maker', 'draft_partner'].includes(part.component);
};
export const filterSetToken: setFilter = Object.assign(
  function (
    this: setFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string,
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    const shouldExclude = (set: string) => {
      return excludeExtras.includes(set) && !includeExtraSets && !value2.includes(set);
    };
    const isSetInResults = (set: string) => set.includes(value2) && !shouldExclude(set);
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
    return funcOp(actualOp, tokenInSet, value1);
  },
  { defaultOp: '=' as opType }
);

export const filterSetListToken: setListFilter = Object.assign(
  function (
    this: setListFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string[],
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    if (value2.length) {
      return value2.some(set => filterSetToken(value1, actualOp, set, includeExtraSets));
    }
    return funcOp(actualOp, card => Boolean(card.isActualToken), value1);
  },
  { defaultOp: '=' as opType }
);
export const filterSetBoth: setFilter = Object.assign(
  function (
    this: setFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string,
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    return (
      filterSetCard(value1, actualOp, value2, includeExtraSets) ||
      filterSetToken(value1, actualOp, value2, includeExtraSets)
    );
  },
  { defaultOp: '=' as opType }
);

export const filterSetListBoth: setListFilter = Object.assign(
  function (
    this: setListFilter,
    value1: HCCard.Any,
    operator: looseOpType,
    value2: string[],
    includeExtraSets: boolean = false
  ) {
    const actualOp = getActualOp(this, operator);
    return (
      filterSetListCard(value1, actualOp, value2, includeExtraSets) ||
      filterSetListToken(value1, actualOp, value2, includeExtraSets)
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
  return cards.filter(card => filterSetListCard(card, '=', [set]));
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
    filterSetListBoth(card, '=', set == 'All' ? [] : [set], true)
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
