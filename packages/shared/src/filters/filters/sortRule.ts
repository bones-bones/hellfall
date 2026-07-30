import { HCCard, HCColor, HCKind, allSetsList, colorList, toKindIndex } from '@hellfall/shared/types';
import { dirType, looseOpType, opType, sortFilterFunction, sortType } from '../types';
import { textListIncludes, toFaces } from '@hellfall/shared/utils';

const toColorNumber = (card: HCCard.Any) => {
  if (textListIncludes(toFaces(card)[0].types,'land')) {
    return colorList.length+2
  }
  switch (card.colors.length) {
    case 0:
      return textListIncludes(toFaces(card)[0].types,'artifact') ? colorList.length+1:-1;
    case 1: 
      return colorList.indexOf(card.colors[0])
  }
  return colorList.length
};

const toTokenNumber = (card: HCCard.Any) => parseInt(card.hcid.replace(card.name, ''));

/**
 * A function that sorts two cards
 * @param value1 the first card to sort
 * @param operator dummy
 * @param value2 the second card to sort
 * @param sort the sort option to use
 * @param dir the sort direction to use
 * @returns a number for `.sort()`
 */
export const filterSort: sortFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: HCCard.Any,
  sort: sortType,
  dir: dirType
) => {
  const dirMult = dir == 'desc' ? -1 : 1;
  switch (sort) {
    case 'color':
      return (toColorNumber(value1) - toColorNumber(value2)) * dirMult;
    case 'manavalue':
      return (value1.mana_value - value2.mana_value) * dirMult;
    case 'auto':
    case 'colormanavalue': {
      const color = (toColorNumber(value1) - toColorNumber(value2)) * dirMult;
      if (color) {
        return color;
      }
      return (value1.mana_value - value2.mana_value) * dirMult;
    }
    case 'number': {
      return (parseInt(value1.collector_number) - parseInt(value2.collector_number)) * dirMult;
    }
    case 'id': {
      if (value1.kind != value2.kind) {
        return (toKindIndex(value1.kind) - toKindIndex(value2.kind)) * dirMult ;
      }
      switch (value1.kind) {
        case 'card':
          return (parseInt(value1.hcid) - parseInt(value2.hcid)) * dirMult;
        case 'land':
          return (parseInt(value1.hcid.slice(1)) - parseInt(value2.hcid.slice(1))) * dirMult;
      }
      if (value1.name == value2.name) {
        return (toTokenNumber(value1) - toTokenNumber(value2)) * dirMult;
      }
      return value1.hcid < value2.hcid ? -dirMult : dirMult;
    }
    case 'name': {
      if (value1.name.toLowerCase() == value2.name.toLowerCase()) {
        return 0;
      }
      return value1.name.toLowerCase() < value2.name.toLowerCase() ? -dirMult : dirMult;
    }
    case 'set':
      return (allSetsList.indexOf(value1.set) - allSetsList.indexOf(value2.set)) * dirMult;
    case 'setnumber': {
      return (
        (allSetsList.indexOf(value1.set) - allSetsList.indexOf(value2.set) ||
          parseInt(value1.collector_number!) - parseInt(value2.collector_number!)) * dirMult
      );
    }
  }
  return 0; // just in case
};
