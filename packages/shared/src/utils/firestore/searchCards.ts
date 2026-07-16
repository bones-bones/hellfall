import { HCCard } from '@hellfall/shared/types';
import {
  makeIncludeFilter,
  FilterNode,
  // fixTags,
  fixDrop,
  parseSearchQuery,
  searchCards,
  correctInclude,
} from '@hellfall/shared/filters';
import { CardMap } from '../cardHandling';
import { firestoreToCard } from './cardConversion';
import { getAllRelatedCollection } from './cardRefs';
import type { cardsCollection, firestoreCard } from './firestoreTypes';
import { fixValue } from '../textHandling';

const evaluateRelatedFilter = (
  node: FilterNode,
  card: firestoreCard,
  cardsCol: cardsCollection
): boolean =>
  getAllRelatedCollection(card, cardsCol).some(async related =>
    evaluateFilter(node, await related.get(), cardsCol)
  );

const evaluateFilter = (
  node: FilterNode,
  card: firestoreCard,
  cardsCol: cardsCollection
): boolean => {
  switch (node.type) {
    case 'filter': {
      if (node.filter.queryName == 'hybrid' || node.filter.queryName == 'mischybrid') {
        return node.filter.cardPassesFilter(firestoreToCard(card /* , true */));
      }
      return node.filter.cardPassesFilter(card as unknown as HCCard.Any);
    }
    case 'related':
      return evaluateRelatedFilter(node.child, card, cardsCol);
    case 'not':
      return !evaluateFilter(node.child, card, cardsCol);
    case 'and':
      return node.children.every(child => evaluateFilter(child, card, cardsCol));
    case 'or':
      return node.children.some(child => evaluateFilter(child, card, cardsCol));
  }
};

/**
 * Given a query, filters a {@linkcode cardsCollection} to return only the cards that match the query
 *
 * Firestore-backed search; browser code should use {@linkcode searchCards} from `@hellfall/shared/filters`.
 * @param cardsCol Collection of all cards
 * @param query query to use
 * @param defaultCludes The user's list of default inclusions/exclusions, if any
 * @returns a {@linkcode CardMap} containing the search results
 */
export const searchCardsFromCollection = async (
  cardsCol: cardsCollection,
  query: string,
  defaultCludes?: string[]
): Promise<CardMap> => {
  const snapshot = await cardsCol.get();
  const cardMap = new CardMap(
    snapshot.docs.map(doc => firestoreToCard(/* doc.id,  */ doc.data() as firestoreCard))
  );
  const { node, includeList, excludeList, autoFilterExtras } = parseSearchQuery(
    query,
    cardMap,
    defaultCludes
  );
  const usingClusion = Boolean(includeList.length + excludeList.length);
  // fixTags(node, tagList);
  if (
    includeList.some(
      include => correctInclude(fixValue(include.value)) == 'drop' && !include.inverted
    )
  ) {
    fixDrop(node);
  }
  if (includeList.length) {
    const defaultInclude = makeIncludeFilter('nonextras', ':');
    includeList.push(defaultInclude);
  }
  const newCardsWithExtras = new CardMap();
  (await cardsCol.get()).forEach(snap => {
    const card = snap.data();
    if (
      evaluateFilter(node, card, cardsCol) &&
      (includeList.length
        ? includeList.some(filter => filter.cardPassesFilter(card as unknown as HCCard.Any))
        : true) &&
      (excludeList.length
        ? excludeList.some(filter => filter.cardPassesFilter(card as unknown as HCCard.Any))
        : true)
    ) {
      newCardsWithExtras.set(firestoreToCard(card));
    }
  });
  const excludeExtras = makeIncludeFilter('nonextras', ':');
  const newCardsWithoutExtras = newCardsWithExtras.filter(card =>
    excludeExtras.cardPassesFilter(card)
  );

  return autoFilterExtras && !usingClusion && newCardsWithoutExtras.size()
    ? newCardsWithoutExtras
    : newCardsWithExtras;
};
