import { HCCard } from '@hellfall/shared/types';
import { CardMap, getAllRelated } from '@hellfall/shared/utils';
import { parseSearchQuery } from './parseSearchQuery';
import { fixTags, fixDrop, fixValue } from '../utils';
import { makeIncludeFilter } from '../makers';
import { FilterNode } from '../types';
import { correctInclude } from '../filters';

const evaluateRelatedFilter = (node: FilterNode, card: HCCard.Any, cardMap: CardMap): boolean =>
  getAllRelated(card, cardMap).some(related => evaluateFilter(node, related, cardMap));

const evaluateFilter = (node: FilterNode, card: HCCard.Any, cardMap: CardMap): boolean => {
  switch (node.type) {
    case 'filter':
      return node.filter.cardPassesFilter(card);
    case 'related':
      return evaluateRelatedFilter(node.child, card, cardMap);
    case 'not':
      return !evaluateFilter(node.child, card, cardMap);
    case 'and':
      return node.children.every(child => evaluateFilter(child, card, cardMap));
    case 'or':
      return node.children.some(child => evaluateFilter(child, card, cardMap));
  }
};

/**
 * Given a query, filters a {@linkcode CardMap} to return only the cards that match the query
 * @param cardMap Map of all cards
 * @param query query to use
 * @param tagList The list of tags (from `tags.json`)
 * @param defaultCludes The user's list of default inclusions/exclusions, if any
 */
export const searchCards = (cardMap: CardMap, query: string, tagList: string[], defaultCludes?:string[]): CardMap => {
  const { node, includeList, excludeList, autoFilterExtras } = parseSearchQuery(query, cardMap, defaultCludes);
  const usingClusion = Boolean(includeList.length + excludeList.length);
  // so when do I want include to default to true? when includelist.length == 0, and when the only include is the default? then why default?
  fixTags(node, tagList);
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
  const newCardsWithExtras = cardMap.filter(
    card =>
      evaluateFilter(node, card, cardMap) &&
      (includeList.length ? includeList.some(filter => filter.cardPassesFilter(card)) : true) &&
      (excludeList.length ? excludeList.some(filter => filter.cardPassesFilter(card)) : true)
  );
  // const includeNonExtras = makeIncludeFilter('nonextras', ':');
  const excludeExtras = makeIncludeFilter('nonextras', ':');
  const newCardsWithoutExtras = newCardsWithExtras.filter(card =>
    excludeExtras.cardPassesFilter(card)
  );

  return autoFilterExtras && !usingClusion && newCardsWithoutExtras.size()
    ? newCardsWithoutExtras
    : newCardsWithExtras;
};
