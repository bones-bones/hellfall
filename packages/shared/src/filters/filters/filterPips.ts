import { faceType, HCCard, HCCardSymbol } from '@hellfall/shared/types';
import {
  ensurePips,
  getCostsFromHistoricPermanentFaces,
  getCostsFromPermanentFaces,
  matchCount,
  pipMap,
  pipsContainPipsGeneric,
  pipSearch,
  splitCostIntoPips,
  // pipsEqualPipsNongeneric,
  textContains,
  textListIncludes,
  textListsShare,
  toNumber,
  toPermanentFaces,
} from '@hellfall/shared/utils';
import {
  comparisonFilterFunction,
  comparisonSummaryFunction,
  devotionRegexFilterFunction,
  devotionFilterNameType,
  devotionNumberFilterNames,
  opType,
  pipFilterFunction,
  pipListFilterFunction,
  summaryFunction,
  toDevotionFilterName,
} from '../types';
import { containsOp, createNumSummary, opAsBool, opToDont } from '../utils';
import { numFilter, numSearchListFilter } from './filterBase';

/**
 * Compares a set of pips with a pip search
 * @param value1 The set of pips from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const manaFilter: pipFilterFunction = (
  value1: HCCardSymbol[],
  operator: opType,
  value2: pipSearch
) => {
  if (typeof value2 == 'number') {
    return numFilter(value1.length, operator, value2);
  }
  return containsOp(operator, pipsContainPipsGeneric, value1, value2);
};
/**
 * Compares a list of sets of pips with a pip search
 * @param value1 The list of sets of pips from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const manaListFilter: pipListFilterFunction = (
  value1: HCCardSymbol[][],
  operator: opType,
  value2: pipSearch
) => value1.some(set => manaFilter(set, operator, value2));

/**
 * The summary for a mana cost filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const manaSummary: summaryFunction<pipSearch> = (
  operator: opType,
  value: pipSearch,
  invert?: boolean
) => {
  if (typeof value == 'number') {
    return createNumSummary('the number of pips in the mana cost is')(operator, value, invert);
  }
  if (typeof value == 'string') {
    const invalids = pipMap.getNonPipsFromSearch(value);
    if (invalids.length) {
      return `!Unknown pips ${invalids.map(s => `{${s}}`).join(', ')}`;
    }
  }
  return createNumSummary('the mana cost is', true)(
    operator,
    ensurePips(value)
      .map(p => `{${p.symbol}}`)
      .join(''),
    invert
  );
};
const genericRegex = /{(\d+|X|Y|Z|∞|XIV|TREEX|1.99)}/g;
const faceDevotionToDreadmaw = (face: faceType): number => {
  let devotion = 0;
  if (face.mana_value == 6) {
    devotion++;
  }
  if (textListIncludes(face.subtypes, 'dinosaur')) {
    devotion++;
  }
  if (toNumber(face.power) == 6) {
    devotion++;
  }
  if (toNumber(face.toughness) == 6) {
    devotion++;
  }
  if (
    matchCount(face.mana_cost, /{G}/g) == 2 &&
    splitCostIntoPips(face.mana_cost).length - matchCount(face.mana_cost, genericRegex) == 2
  ) {
    devotion++;
  }
  return devotion;
};
const devotionToDreadmaw = (card: HCCard.Any, dropFaces?: boolean): number[] => {
  const nums = toPermanentFaces(card, dropFaces).map(faceDevotionToDreadmaw);
  if (card.keywords.includes('trample')) {
    return nums.map(n => n + 1);
  }
  if (!nums.length) {
    return [0];
  }
  return nums;
};
const pipIsGray = (pip: string) =>
  pipMap.colorlessSymbolRegex.test(pip) || pipMap.genericSymbolRegex.test(pip);
// const textIsGray = (text: string) =>
//   (isNumber(text) && text != '0') ||
//   ['C', 'X', 'Y', '1/2', '∞', 'XIV', 'TREEX', 'HC'].includes(text);
// const pipIsGray = (pip: HCCardSymbol) => pip.symbol.split('/').every(textIsGray);
// const pipIsColored = (pip: HCCardSymbol) => pip.colors?.some(c => c != 'C');

const isFatAss = (face: faceType) => {
  const pow = toNumber(face.power);
  const tou = toNumber(face.toughness);
  if (pow == undefined || tou == undefined) return false;
  return tou - pow >= 2;
};
// const textIsHybrid = (text: string) => /^(?!H\/)[^/]+\//.test(text) || /^H\/[^/]+\//.test(text);
// const pipIsHybrid = (pip: HCCardSymbol) => textIsHybrid(pip.symbol);

const getDevotionFromCard = (
  card: HCCard.Any,
  devotion: devotionFilterNameType,
  dropFaces?: boolean
): number[] | boolean => {
  switch (devotion) {
    case 'devotion':
      return toPermanentFaces(card, dropFaces).some(face =>
        textContains(face.oracle_text, 'devotion')
      );
    case 'dreadmaw':
      return devotionToDreadmaw(card, dropFaces);
    case 'gray':
      return getCostsFromPermanentFaces(card, dropFaces).map(
        cost => splitCostIntoPips(cost).filter(pipIsGray).length
      );
    case 'hybrid':
      return getCostsFromPermanentFaces(card, dropFaces).map(cost =>
        matchCount(cost, pipMap.hybridSymbolRegex)
      );
    case 'history':
      return getCostsFromHistoricPermanentFaces(card, dropFaces).map(cost =>
        matchCount(cost, pipMap.coloredSymbolRegex)
      );
    case 'god':
    case 'locus':
    case 'fish':
    case "urza's":
      return toPermanentFaces(card, dropFaces).some(face =>
        textListIncludes(face.subtypes, devotion)
      );
    case 'awesome':
      return toPermanentFaces(card, dropFaces).some(face =>
        textListsShare(face.subtypes, ['dinosaur', 'dragon', 'ninja', 'samurai', 'shark', 'wolf'])
      );
    case 'fatass':
      return toPermanentFaces(card, dropFaces).some(isFatAss);
  }
};

/**
 * Compares up to two values from a card based on values from a search for a devotion filter
 * @param value1 the card to use
 * @param operator operator to use
 * @param value2 the first value from the search
 * @param value3 the regex from the search, if any
 */
export const devotionStateFilter: comparisonFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  value3?: string
) => {
  const num = toNumber(value3);
  const devotion = toDevotionFilterName(value2);
  if (!devotion) {
    return true;
  }
  const value = getDevotionFromCard(value1, devotion);
  if (typeof value == 'boolean') {
    return opAsBool(value, operator);
  }
  return numSearchListFilter(value, operator, num ?? 1);
};
/**
 * Compares costs from a card with a number and with up to two regexes from a search
 * @param value1 the costs to use
 * @param operator operator to use
 * @param value3 the first regex from the search
 * @param value2 the number from the search
 * @param value4 the second regex from the search, if any
 */
export const devotionRegexFilter: devotionRegexFilterFunction = (
  value1: string[],
  operator: opType,
  value2: RegExp,
  value3: string,
  value4?: RegExp
) =>
  numSearchListFilter(
    value1.map(v => matchCount(v, value2, value4)),
    operator,
    value3
  );

const devotionToSummary: Partial<Record<devotionFilterNameType, string>> = {
  fatass: 'fat asses',
};

/**
 * The summary for a devotion filter
 * @param operator the operator to use
 * @param value1 the first search value to use
 * @param invert dummy
 * @param value2 the second search value to use
 */
export const devotionSummary: comparisonSummaryFunction = (
  operator: opType,
  value1: string,
  invert?: boolean,
  value2?: string
) => {
  const num = toNumber(value2);
  const devotion = toDevotionFilterName(value1);
  const pip = pipMap.get(value1);
  if (pip && !devotion) {
    return createNumSummary(`the card's devotion to ${pip.symbol} is`)(operator, num);
  }
  if (!devotion) {
    return `!Unknown devotion option ${value1}`;
  }
  if (devotionNumberFilterNames.includes(devotion)) {
    return createNumSummary(`the card's devotion to ${devotion} is`)(operator, num ?? 1);
  }
  return `the cards ${opToDont(operator)} give devotion to ${
    devotionToSummary[devotion] ?? devotion
  }`;
};

/**
 * The summary for a devotion filter that's invalid due to mixed pips
 * @param operator dummy
 * @param value the search value to use
 */
export const invalidMixSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `!Devotion can only match one kind of pips.`;
