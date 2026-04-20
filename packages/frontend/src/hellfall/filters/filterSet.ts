import { HCCard } from '@hellfall/shared/types';
import { extraSetList } from '../constants';
import { getHc5 } from '../../hells-cubes/getHc5';

/**
 * Filters cards based on specified sets
 * @param cards cards to filter
 * @param sets sets to filter for
 * @param extraSets extra sets to filter for
 * @param includeExtraSets whether to hide extra sets by default
 * @param mode whether to fetch only cards in the sets, only tokens made by cards in the sets, or both
 * @returns
 */
export const filterSet = (
  cards: HCCard.Any[],
  sets: string[] = [],
  extraSets: string[] = [],
  includeExtraSets: boolean = false,
  mode: 'Cards' | 'Tokens' | 'Both' = 'Cards'
): HCCard.Any[] => {
  /**
   * Checks if a card's set is in the results. Also returns true if the card's set is a subset of one of the results.
   * @param set set of a card
   * @returns if set is in results
   */
  const isSetInResults = (set: string) => {
    // Exclude HCV.1-4 from HCV if !includeExtraSets
    if (!includeExtraSets && ['HCV.1', 'HCV.2', 'HCV.3', 'HCV.4'].includes(set)) {
      return extraSets.some(e => set.includes(e));
    } else {
      return sets.some(e => set.includes(e)) || extraSets.some(e => set.includes(e));
    }
  };

  const noSets = sets.length + extraSets.length == 0 || (sets.length == 1 && sets[0] == 'All');

  switch (mode) {
    case 'Cards':
      return cards.filter(entry => {
        if (!noSets && !isSetInResults(entry.set)) {
          return false;
        }
        if (extraSets.length == 0 && !includeExtraSets && extraSetList.includes(entry.set)) {
          return false;
        }
        // make sure tokens are hidden when no sets are selected
        if (noSets && entry.isActualToken) {
          return false;
        }
        return true;
      });
    case 'Tokens':
      return cards.filter(entry => {
        if (
          !noSets &&
          !(
            'all_parts' in entry &&
            entry.all_parts
              ?.filter(e => ['token_maker', 'meld_part', 'draft_partner'].includes(e.component))
              .some(part => isSetInResults(part.set))
          )
        ) {
          return false;
        }
        if (noSets && !entry.isActualToken) {
          return false;
        }
        return true;
      });
    case 'Both':
      return cards.filter(entry => {
        if (
          !noSets &&
          !isSetInResults(entry.set) &&
          !(
            'all_parts' in entry &&
            entry.all_parts
              ?.filter(e => ['token_maker', 'meld_part', 'draft_partner'].includes(e.component))
              .some(part => isSetInResults(part.set))
          )
        ) {
          return false;
        }
        if (
          !entry.isActualToken &&
          extraSets.length == 0 &&
          !includeExtraSets &&
          extraSetList.includes(entry.set)
        ) {
          return false;
        }
        return true;
      });
  }
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
  const filteredCards = filterSet(
    allCards,
    extraSetList.includes(set) ? [] : [set],
    extraSetList.includes(set) ? [set] : [],
    false,
    'Both'
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
