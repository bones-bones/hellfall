import { HCCard } from '@hellfall/shared/types';
import {
  opType,
  equivColorFilterNames,
  equivFilterNames,
  comparisonFilterFunction,
  comparisonSummaryFunction,
} from '../types';
import { invertOp, numFilter, splitOnFirstOp, unescapeText } from '../utils';
import {
  colorMiscReduce,
  getColorsFromFaces,
  getHybridColorNumber,
  hybridIdentityMiscReduce,
  shouldChoose2,
  toFaces,
  toNumber,
} from '@hellfall/shared/utils';

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
] as const;
export type numPropType = (typeof numProps)[number];
export const isNumProp = (value: any): value is numPropType => numProps.includes(value);
export const isCompKeyword = (keyword: string) =>
  isNumProp(keyword) ||
  isNumProp(equivFilterNames[keyword]) ||
  isNumProp(equivColorFilterNames[keyword]);

const getPropNumsFromCard = (card: HCCard.Any, prop: numPropType): number[] => {
  switch (prop) {
    case 'creator':
      return [card.creators.length];
    case 'artist':
      return [card.artists?.length || 0];
    case 'manavalue':
      return [card.mana_value];
    case 'power':
      return toFaces(card).flatMap(e => toNumber(e.power) ?? []);
    case 'toughness':
      return toFaces(card).flatMap(e => toNumber(e.toughness) ?? []);
    case 'pt':
      return toFaces(card).flatMap(e =>
        !e.power && !e.toughness ? [] : (toNumber(e.power) ?? 0) + (toNumber(e.toughness) ?? 0)
      );
    case 'loyalty':
      return toFaces(card).flatMap(e => toNumber(e.loyalty) ?? []);
    case 'defense':
      return toFaces(card).flatMap(e => toNumber(e.defense) ?? []);
    case 'color':
      return [shouldChoose2(card) ? 2 : card.colors.length];
    case 'identity':
      return [shouldChoose2(card) ? 2 : card.color_identity.length];
    case 'indicator':
      return getColorsFromFaces(card, 'color_indicator').map(c => c.length);
    case 'hybrid':
      return [shouldChoose2(card) ? 2 : getHybridColorNumber(card.color_identity_hybrid)];
    case 'misccolor':
      return [shouldChoose2(card) ? 2 : colorMiscReduce(card.colors).length];
    case 'miscidentity':
      return [shouldChoose2(card) ? 2 : colorMiscReduce(card.color_identity).length];
    case 'miscindicator':
      return getColorsFromFaces(card, 'color_indicator').map(c => colorMiscReduce(c).length);
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
const numPropToSummary: Record<numPropType, string> = {
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
export const invertCompOp = (value: string) => {
  const { keyword, op, term } = splitOnFirstOp(value);
  return `${keyword}${invertOp(op)}${term}`;
};
export const comparisonFilter: comparisonFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  value3: string
) => {
  const first = toNumProp(value2);
  const second = toNumProp(value3);
  if (!first || !second) {
    return false;
  }
  const firstValue = getPropNumsFromCard(value1, first);
  const secondValue = getPropNumsFromCard(value1, second);
  return firstValue.some(v1 => secondValue.some(v2 => numFilter(v1, operator, v2)));
};
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
  if (!first) {
    return `!Unknown keyword "${value1}"`;
  }
  if (!second) {
    return `!Unknown value "${value2}"`;
  }
  if (first == second) {
    return '!The sides of your comparison must be different.';
  }
  return `${numPropToSummary[first]} ${operator} ${numPropToSummary[second]}`;
};
