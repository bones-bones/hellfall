import { colorList, HCCard, toKindIndex } from '@hellfall/shared/types';
import { createSortFunc, textListIncludes } from '../listHandling';
import { getAcceptedOrderSet, toSetNumber } from '../setDateHandling';
import { toFaces } from './cardMethods';

const toColorNumberBoth = (card: HCCard.Any, useTypes?: boolean) => {
  if (useTypes && textListIncludes(toFaces(card)[0].types, 'land')) {
    return colorList.length + 2;
  }
  switch (card.colors.length) {
    case 0:
      return !useTypes || textListIncludes(toFaces(card)[0].types, 'artifact')
        ? colorList.length + 1
        : -1;
    case 1:
      return colorList.indexOf(card.colors[0]);
  }
  return colorList.length;
};
const toColorNumber = (card: HCCard.Any) => toColorNumberBoth(card);
const toTypedColorNumber = (card: HCCard.Any) => toColorNumberBoth(card, true);
const toTokenNumber = (card: HCCard.Any) => parseInt(card.hcid.replace(card.name, ''));

/**
 * Sorts two cards based on their color
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const colorSort = createSortFunc(toColorNumber);
/**
 * Sorts two cards based on their color and types
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const colorTypeSort = createSortFunc(toTypedColorNumber);
/**
 * Sorts two cards based on their mana value
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const manaValueSort = createSortFunc((card: HCCard.Any) => card.mana_value);
/**
 * Sorts two cards based on their color, then mana value
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const colorManaValueSort = createSortFunc(colorSort, manaValueSort);
/**
 * Sorts two cards based on their collector numbers
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const collectorNumberSort = createSortFunc((card: HCCard.Any) =>
  parseInt(card.collector_number)
);
/**
 * Sorts two cards based on their accepted order
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const acceptedOrderSort = createSortFunc((card: HCCard.Any) =>
  parseInt(card.accepted_order)
);

/**
 * Sorts two cards based on their hcids
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const hcidSort = (value1: HCCard.Any, value2: HCCard.Any, dirMult: -1 | 1 = 1) => {
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
};

/**
 * Sorts two cards based on their names
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const nameSort = createSortFunc((card: HCCard.Any) => card.name);

/**
 * Sorts two cards based on their set
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const setSort = createSortFunc((card: HCCard.Any) =>
  toSetNumber(getAcceptedOrderSet(card.set))
);
/**
 * Sorts two cards based on their set, then collector number
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const setNumberSort = createSortFunc(setSort, collectorNumberSort);

/**
 * Sorts two cards based on their set, then accepted order
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const setAcceptedSort = createSortFunc(setSort, acceptedOrderSort);

/**
 * Sorts two cards based on their date, then set, then accepted order
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const dateSort = createSortFunc((card: HCCard.Any) => card.released_at, setAcceptedSort);
