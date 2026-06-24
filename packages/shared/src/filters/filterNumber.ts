import { HCCard } from '@hellfall/shared/types';
import {
  cardStringFilter,
  invertOptionType,
  numFilter,
  numStringFilter,
  numStringListFilter,
  opType,
} from './types';
import {
  colorMiscReduce,
  getHybridColorNumber,
  hybridIdentityMiscReduce,
} from './values/filterColors';
import {
  equivColorFilterNames,
  equivFilterNames,
  splitOnFirstOp,
  unescapeText,
} from './filterBuilder';
import { createNumSummary, invertOp } from './filterUtils';
import { getColorsFromFaces, toFaces, toNumber } from '@hellfall/shared/utils';

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

export const getPropNumsFromCard = (card: HCCard.Any, prop: numPropType): number[] => {
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
      return [card.colors.length];
    case 'identity':
      return [card.color_identity.length];
    case 'indicator':
      return getColorsFromFaces(card, 'color_indicator').map(c => c.length);
    case 'hybrid':
      return [getHybridColorNumber(card.color_identity_hybrid)];
    case 'misccolor':
      return [colorMiscReduce(card.colors).length];
    case 'miscidentity':
      return [colorMiscReduce(card.color_identity).length];
    case 'miscindicator':
      return getColorsFromFaces(card, 'color_indicator').map(c => colorMiscReduce(c).length);
    case 'mischybrid':
      return [getHybridColorNumber(hybridIdentityMiscReduce(card.color_identity_hybrid))];
  }
};
export const toNumProp = (prop: string): numPropType | undefined =>
  numProps.includes(prop as numPropType)
    ? (prop as numPropType)
    : prop in equivFilterNames && numProps.includes(equivFilterNames[prop] as numPropType)
    ? (equivFilterNames[prop] as numPropType)
    : prop in equivColorFilterNames
    ? (equivColorFilterNames[prop] as numPropType)
    : undefined;
export const numPropToSummary: Record<numPropType, string> = {
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
export const isCompKeyword = (keyword: string) =>
  numProps.includes(keyword as numPropType) ||
  (keyword in equivFilterNames && numProps.includes(equivFilterNames[keyword] as numPropType)) ||
  keyword in equivColorFilterNames;
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
