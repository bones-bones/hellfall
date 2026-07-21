import { HCCard, SetCode } from '@hellfall/shared/types';
import {
  opType,
  equivColorFilterNames,
  equivFilterNames,
  comparisonFilterFunction,
  comparisonSummaryFunction,
  summaryFunction,
} from '../types';
import { numFilter, opAsBool, opIsNegative, opToNot } from '../utils';
import {
  colorMiscReduce,
  getColorsFromFaces,
  getHybridColorNumber,
  hybridIdentityMiscReduce,
  mod,
  shouldChoose2,
  toFaces,
  toNumber,
  unescapeText,
} from '@hellfall/shared/utils';

/**
 * The list of props that can be compared with a comparison filter
 */
export const numProps = [
  'creator',
  'artist',
  'manavalue',
  'power',
  'toughness',
  'pt',
  'loyalty',
  'defense',
  'color',
  'indicator',
  'identity',
  'hybrid',
  'misccolor',
  'miscindicator',
  'miscidentity',
  'mischybrid',
  'odd',
  'even',
] as const;
/**
 * The type for props that can be compared with a comparison filter
 */
export type numPropType = (typeof numProps)[number];

/**
 * Validates whether a value is {@linkcode numPropType}
 * @param value value to validate
 */
export const isNumProp = (value: any): value is numPropType => numProps.includes(value);

/**
 * The type for props that can be compared with a comparison filter and can be keywords
 */
export type trueNumPropType = Exclude<numPropType, 'odd' | 'even'>;
/**
 * Validates whether a value is {@linkcode trueNumPropType}
 * @param value value to validate
 */
export const isTrueNumProp = (value: any): value is trueNumPropType =>
  isNumProp(value) && !['odd', 'even'].includes(value);

/**
 * Checks whether a keyword is {@linkcode numPropType} or can be converted to it
 * @param keyword keyword to check
 */
export const isCompKeyword = (keyword: string) =>
  isNumProp(keyword) ||
  isNumProp(equivFilterNames[keyword]) ||
  isNumProp(equivColorFilterNames[keyword]);

const getPropNumsFromCard = (
  card: HCCard.Any,
  prop: trueNumPropType,
  dropFaces?: boolean
): number[] => {
  switch (prop) {
    case 'creator':
      return [card.creators.length];
    case 'artist':
      return [card.artists?.length || 0];
    case 'manavalue':
      return [card.mana_value];
    case 'power':
      return toFaces(card, dropFaces).flatMap(e => toNumber(e.power) ?? []);
    case 'toughness':
      return toFaces(card, dropFaces).flatMap(e => toNumber(e.toughness) ?? []);
    case 'pt':
      return toFaces(card, dropFaces).flatMap(e =>
        !e.power && !e.toughness ? [] : (toNumber(e.power) ?? 0) + (toNumber(e.toughness) ?? 0)
      );
    case 'loyalty':
      return toFaces(card, dropFaces).flatMap(e => toNumber(e.loyalty) ?? []);
    case 'defense':
      return toFaces(card, dropFaces).flatMap(e => toNumber(e.defense) ?? []);
    case 'color':
      return [shouldChoose2(card) ? 2 : card.colors.length];
    case 'identity':
      return [shouldChoose2(card) ? 2 : card.color_identity.length];
    case 'indicator':
      return getColorsFromFaces(card, 'color_indicator', dropFaces).map(c => c.length);
    case 'hybrid':
      return [shouldChoose2(card) ? 2 : getHybridColorNumber(card.color_identity_hybrid)];
    case 'misccolor':
      return [shouldChoose2(card) ? 2 : colorMiscReduce(card.colors).length];
    case 'miscidentity':
      return [shouldChoose2(card) ? 2 : colorMiscReduce(card.color_identity).length];
    case 'miscindicator':
      return getColorsFromFaces(card, 'color_indicator', dropFaces).map(
        c => colorMiscReduce(c).length
      );
    case 'mischybrid':
      return [
        shouldChoose2(card)
          ? 2
          : getHybridColorNumber(hybridIdentityMiscReduce(card.color_identity_hybrid)),
      ];
  }
};
const toNumProp = (prop: string): numPropType | undefined => {
  const fixedProp = unescapeText(prop);
  if (isNumProp(fixedProp)) {
    return fixedProp;
  }
  if (isNumProp(equivFilterNames[fixedProp])) {
    return equivFilterNames[fixedProp];
  }
  if (isNumProp(equivColorFilterNames[fixedProp])) {
    return equivColorFilterNames[fixedProp];
  }
};
const numPropToSummary: Record<trueNumPropType, string> = {
  creator: 'the number of creators',
  artist: 'the number of artists',
  manavalue: 'the mana value',
  power: 'the power',
  toughness: 'the toughness',
  pt: 'the sum of power and toughness',
  loyalty: 'the loyalty',
  defense: 'the defense',
  color: 'the number of colors',
  identity: 'the number of identity colors',
  indicator: 'the number of indicator colors',
  hybrid: 'the number of hybrid identity colors',
  misccolor: 'the number of colors',
  miscidentity: 'the number of identity colors',
  miscindicator: 'the number of indicator colors',
  mischybrid: 'the number of hybrid identity colors',
};

// export const invertCompOp = (value: string) => {
//   const { keyword, op, term } = splitOnFirstOp(value);
//   return `${keyword}${invertOp(op)}${term}`;
// };
/**
 * Compares two values from a card based on values from a search
 * @param value1 the card to use
 * @param operator operator to use
 * @param value2 the first value from the search
 * @param value3 the second value from the search
 * @param dropFaces whether to exclude faces with `drop_face: true` where appropriate
 */
export const comparisonFilter: comparisonFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  value3: string,
  dropFaces?: boolean
) => {
  const first = toNumProp(value2);
  const second = toNumProp(value3);
  if (!first || !second) {
    return false;
  }
  if (!isTrueNumProp(first)) {
    return false;
  }
  const firstValue = getPropNumsFromCard(value1, first, dropFaces);
  if (!isTrueNumProp(second)) {
    return opAsBool(
      firstValue.some(v => mod(v, 2) == Number(second == 'odd')),
      operator
    );
  }
  const secondValue = getPropNumsFromCard(value1, second, dropFaces);
  return firstValue.some(v1 => secondValue.some(v2 => numFilter(v1, operator, v2)));
};

/**
 * The summary for a comparison filter
 * @param operator the operator to use
 * @param value1 the first search value to use
 * @param invert dummy
 * @param value2 the second search value to use
 */
export const comparisonSummary: comparisonSummaryFunction = (
  operator: opType,
  value1: string,
  invert?: boolean,
  value2?: string
) => {
  if (!value2) {
    return '!Empty value';
  }
  const first = toNumProp(value1);
  const second = toNumProp(value2);
  if (!isTrueNumProp(first)) {
    return `!Unknown keyword "${value1}"`;
  }
  if (!second) {
    return `!Unknown value "${value2}"`;
  }
  if (!isTrueNumProp(second)) {
    return `${numPropToSummary[first]} is ${opToNot(operator)} ${second}`;
  }
  if (first == second) {
    return '!The sides of your comparison must be different.';
  }
  return `${numPropToSummary[first]} ${operator} ${numPropToSummary[second]}`;
};

export const getSetNumber = (cards: HCCard.Any[]): number => {
  const setList: SetCode[] = [];
  cards.forEach(card => {
    if (!setList.includes(card.set)) {
      setList.push(card.set);
    }
  });
  return setList.length;
};

export const setsNumberSummary = 'the number of times a card has appeared in a set';

export const printsNumberSummary = 'the number of prints';
export const isUniqueSummary: summaryFunction<string> = (operator: opType, value: string) =>
  `the card has been printed ${opIsNegative(operator) ? 'more than' : 'exactly'} once`;
