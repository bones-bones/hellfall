import { HCCard, colorList, toKindIndex } from '@hellfall/shared/types';
import { dirType, sortFilterFunction, sortType } from '../types';
import {
  dateSort,
  getCollectorOrderSet,
  textListIncludes,
  toFaces,
  toSetNumber,
} from '@hellfall/shared/utils';

const toColorNumber = (card: HCCard.Any, useTypes?:boolean) => {
  if (useTypes && textListIncludes(toFaces(card)[0].types, 'land')) {
    return colorList.length + 2;
  }
  switch (card.colors.length) {
    case 0:
      return (!useTypes || textListIncludes(toFaces(card)[0].types, 'artifact')) ? colorList.length + 1 : -1;
    case 1:
      return colorList.indexOf(card.colors[0]);
  }
  return colorList.length;
};

const toTokenNumber = (card: HCCard.Any) => parseInt(card.hcid.replace(card.name, ''));

/**
 * A function that sorts two cards
 * @param value1 the first card to sort
 * @param value2 the second card to sort
 * @param sort the sort option to use
 * @param dir the sort direction to use
 * @returns a number for `.sort()`
 */
export const filterSort: sortFilterFunction = (
  value1: HCCard.Any,
  value2: HCCard.Any,
  sort: sortType,
  dir: dirType,
  useTypes?:boolean
) => {
  const dirMult = dir == 'desc' ? -1 : 1;
  switch (sort) {
    case 'color':
      return (toColorNumber(value1, useTypes) - toColorNumber(value2, useTypes)) * dirMult;
    case 'manavalue':
      return (value1.mana_value - value2.mana_value) * dirMult;
    case 'auto':
    case 'colormanavalue': {
      const color = (toColorNumber(value1, useTypes) - toColorNumber(value2, useTypes)) * dirMult;
      if (color) {
        return color;
      }
      return (value1.mana_value - value2.mana_value) * dirMult;
    }
    case 'number': {
      return (parseInt(value1.collector_number) - parseInt(value2.collector_number)) * dirMult;
    }
    case 'accepted': {
      return (parseInt(value1.accepted_order) - parseInt(value2.accepted_order)) * dirMult;
    }
    case 'id': {
      if (value1.kind != value2.kind) {
        return (toKindIndex(value1.kind) - toKindIndex(value2.kind)) * dirMult;
      }
      if (value1.kind == 'card') {
        return (parseInt(value1.hcid) - parseInt(value2.hcid)) * dirMult;
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
      return (toSetNumber(value1.set) - toSetNumber(value2.set)) * dirMult;
    case 'setnumber': {
      return (
        (toSetNumber(getCollectorOrderSet(value1.set)) -
          toSetNumber(getCollectorOrderSet(value2.set)) ||
          parseInt(value1.collector_number) - parseInt(value2.collector_number)) * dirMult
      );
    }
    case 'setaccepted': {
      return dateSort(value1, value2, dirMult);
    }
  }
  return 0; // just in case
};
