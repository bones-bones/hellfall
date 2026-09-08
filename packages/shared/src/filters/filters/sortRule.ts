import { HCCard } from '@hellfall/shared/types';
import { dirType, sortFilterFunction, sortType } from '../types';
import {
  colorManaValueSort,
  colorSort,
  dateSort,
  manaValueSort,
  collectorNumberSort,
  setAcceptedSort,
  sortFunction,
  acceptedOrderSort,
  hcidSort,
  nameSort,
  setSort,
  setNumberSort,
} from '@hellfall/shared/utils';

const sortTypeToFunc: Record<sortType, sortFunction<HCCard.Any>> = {
  color: colorSort,
  manavalue: manaValueSort,
  auto: colorManaValueSort,
  colormanavalue: colorManaValueSort,
  number: collectorNumberSort,
  accepted: acceptedOrderSort,
  id: hcidSort,
  name: nameSort,
  set: setSort,
  setnumber: setNumberSort,
  setaccepted: setAcceptedSort,
  date: dateSort,
};
const reversedAutoSorts: sortType[] = ['date'];
const getMult = (sort: sortType, dir: dirType) =>
  dir == 'auto' ? (reversedAutoSorts.includes(sort) ? -1 : 1) : dir == 'desc' ? -1 : 1;

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
  dir: dirType
  // useTypes?: boolean
) => sortTypeToFunc[sort](value1, value2, getMult(sort, dir));
