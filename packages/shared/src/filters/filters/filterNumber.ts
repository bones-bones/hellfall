import { HCCard } from '@hellfall/shared/types';
import {
  cardStringFilter,
  invertOptionType,
  numFilter,
  numStringFilter,
  numStringListFilter,
  opType,
} from '../types';
import { createNumSummary, invertOp, splitOnFirstOp, unescapeText } from '../utils';
import {
  colorMiscReduce,
  getColorsFromFaces,
  getHybridColorNumber,
  hybridIdentityMiscReduce,
  shouldChoose2,
  toFaces,
  toNumber,
} from '@hellfall/shared/utils';
import { equivColorFilterNames, equivFilterNames } from '../parse';

export const filterNumber: numFilter = Object.assign(
  (value1: number, operator: opType, value2: number) => {
    switch (operator) {
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case '=':
        return value1 == value2;
      case '>=':
        return value1 >= value2;
      case '>':
        return value1 > value2;
      case '!=':
        return value1 != value2;
    }
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: number, invert?: boolean) =>
      `${invert ? 'not' : ''} ${operator} ${value}`,
  }
);

export const filterNumberString: numStringFilter = Object.assign(
  (value1: number | string | undefined, operator: opType, value2: number | string | undefined) => {
    const num1 = toNumber(value1);
    const num2 = toNumber(value2);
    if (num1 == undefined || num2 == undefined) {
      return false;
    }
    return filterNumber(num1, operator, num2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createNumSummary(),
  }
);
export const filterNumberStringList: numStringListFilter = Object.assign(
  (
    value1: (number | string | undefined)[],
    operator: opType,
    value2: number | string | undefined
  ) => value1.some(value => filterNumberString(value, operator, value2)),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createNumSummary(),
  }
);

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
const toNumProp = (prop: string): numPropType | undefined =>
  numProps.includes(prop as numPropType)
    ? (prop as numPropType)
    : prop in equivFilterNames && numProps.includes(equivFilterNames[prop] as numPropType)
    ? (equivFilterNames[prop] as numPropType)
    : prop in equivColorFilterNames
    ? (equivColorFilterNames[prop] as numPropType)
    : undefined;
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
export const filterComp: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const { keyword, op, term } = splitOnFirstOp(value2);
    const first = toNumProp(keyword);
    const second = toNumProp(term);
    if (!first || !second) {
      return false;
    }
    const firstValue = getPropNumsFromCard(value1, first);
    const secondValue = getPropNumsFromCard(value1, second);
    return firstValue.some(v1 => secondValue.some(v2 => filterNumber(v1, op as opType, v2)));
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      const { keyword, op, term } = splitOnFirstOp(value);
      const first = toNumProp(keyword);
      const second = toNumProp(unescapeText(term));
      if (!first) {
        return `!Unknown keyword "${first}"`;
      }
      if (!second) {
        return `!Unknown value "${term}"`;
      }
      if (first == second) {
        return '!The sides of your comparison must be different.';
      }
      return `${numPropToSummary[first]} ${op} ${numPropToSummary[second]}`;
    },
  }
);
