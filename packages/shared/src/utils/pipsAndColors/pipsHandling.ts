import { HCCardSymbol } from '@hellfall/shared/types';
import { listContainsList, listsAreLooselyEqual } from '../listHandling';
import { pipsData } from '@hellfall/shared/data';
import { PipMap, pipsAreEqual } from './pipMap';
import { isInteger, isNumber } from '../numHandling';

/**
 * A union of the types that can be the value for a pip filter
 */
export type pipSearch = string | number | HCCardSymbol[];

const transformPipsData = (data: any[]): HCCardSymbol[] => {
  return data.map(item => {
    if (typeof item.mana_value === 'number') {
      return {
        ...item,
        mana_value: item.mana_value,
      };
    }
    if (typeof item.mana_value === 'string') {
      if (item.mana_value.includes('/')) {
        const nums = item.mana_value.split('/');
        return {
          ...item,
          mana_value: parseInt(nums[0]) / parseInt(nums[1]),
        };
      }
      if (item.mana_value == '∞') {
        return {
          ...item,
          mana_value: parseFloat('Infinity'),
        };
      }
    }
    return {
      ...item,
      mana_value: 0,
    };
  }) as HCCardSymbol[];
};

export const pipMap = new PipMap(transformPipsData(pipsData.data));

/**
 * gets the file src for a pip
 * @param pip pip to get the src for
 */
export const pipToSrc = (pip: HCCardSymbol) => `/pips/${pip.filename}`;

export const ensurePips = (value: string | HCCardSymbol[]) =>
  Array.isArray(value) ? value : pipMap.getPipsFromSearch(value);

/**
 * Checks whether one list of pips equals another list of pips
 *
 * The inputs can either be lists of pips, or can be search strings
 * @param value1 first list of pips
 * @param value2 second list of pips
 */
export const pipsEqualPips = (value1: string | HCCardSymbol[], value2: string | HCCardSymbol[]) =>
  listsAreLooselyEqual(ensurePips(value1), ensurePips(value2), pipsAreEqual);

/**
 * Checks whether one list of pips contains another list of pips
 *
 * The inputs can either be lists of pips, or can be search strings
 * @param value1 list of pips to check whether it contains the other list
 * @param value2 list of pips to check whether it is contained by the other list
 */
export const pipsContainPips = (value1: string | HCCardSymbol[], value2: string | HCCardSymbol[]) =>
  listContainsList(ensurePips(value1), ensurePips(value2), pipsAreEqual);

const extractGenerics = (pips: HCCardSymbol[]) => {
  let g = 0;
  for (let i = pips.length - 1; i >= 0; i--) {
    if (isNumber(pips[i].symbol) || pips[i].symbol == '1/2') {
      g += pips.splice(i, 1)[0].mana_value ?? 0;
    }
  }
  return g;
};
/**
 * Checks whether one list of pips contains another list of pips, treating generics correctly
 *
 * The inputs can either be lists of pips, or can be search strings
 * @param value1 list of pips to check whether it contains the other list
 * @param value2 list of pips to check whether it is contained by the other list
 */
export const pipsContainPipsGeneric = (
  value1: string | HCCardSymbol[],
  value2: string | HCCardSymbol[]
) => {
  const pips1 = [...ensurePips(value1)];
  const pips2 = [...ensurePips(value2)];
  const g1 = extractGenerics(pips1);
  const g2 = extractGenerics(pips2);
  return listContainsList(pips1, pips2, pipsAreEqual) && g1 >= g2;
};
