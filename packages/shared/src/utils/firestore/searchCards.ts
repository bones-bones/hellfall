import type { CollectionReference } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import { makeIncludeFilter } from '../../filters/filterBuilder';
import type { FilterNode } from '../../filters/parseSearchBar';
import { fixTags, parseSearchQuery } from '../../filters/parseSearchBar';
import { CardMap } from '../cardHandling/cardMap';
import { firestoreToCard } from './cardConversion';
import { getAllRelatedCollection } from './cardRefs';
import type { firestoreCard } from './firestoreTypes';

const evaluateRelatedFilter = (
  node: FilterNode,
  card: firestoreCard,
  cardsCol: CollectionReference<firestoreCard, firestoreCard>
): boolean =>
  getAllRelatedCollection(card, cardsCol).some(async related =>
    evaluateFilter(node, await related.get(), cardsCol)
  );

const evaluateFilter = (
  node: FilterNode,
  card: firestoreCard,
  cardsCol: CollectionReference<firestoreCard, firestoreCard>
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

/** Firestore-backed search; browser code should use `searchCards` from `@hellfall/shared/filters`. */
export const searchCardsFromCollection = async (
  cardsCol: CollectionReference<firestoreCard, firestoreCard>,
  query: string,
  tagList: string[]
): Promise<CardMap> => {
  const { node, includeList, excludeList, autoFilterExtras } = parseSearchQuery(query);
  const usingClusion = Boolean(includeList.length + excludeList.length);
  fixTags(node, tagList);
  if (includeList.length) {
    const defaultInclude = makeIncludeFilter('nonextras', ':');
    includeList.push(defaultInclude);
  }
  const newCardsWithExtras = new CardMap();
  (await cardsCol.get()).forEach((card: firestoreCard) => {
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
