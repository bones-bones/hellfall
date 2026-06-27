import { HCCardSymbol, HCColors } from '@hellfall/shared/types';
import { listEquals } from './listHandling';
import { pipsData } from '@hellfall/shared/data';
import { orderColors } from './orderColors';

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

const pips = transformPipsData(pipsData.data);

/**
 * Gets the pip from pip text (must have had curly braces stripped first)
 */
export const getPip = (pipText: string): HCCardSymbol | undefined =>
  pips?.find(e => e.symbol.toLowerCase() === pipText.toLowerCase());

/**
 * Gets the pip for a color indicator from its colors
 */
export const getIndicatorFromColors = (colors: HCColors | string[]) =>
  pips?.find(e => e.symbol.slice(0, 3) == 'CI-' && listEquals(e.colors, colors));

/**
 * Gets all the pips from text
 */
export const getPipsFromText = (text: string): HCCardSymbol[] =>
  text
    .match(/{([^}]+)}/g)
    ?.map(match => getPip(match.slice(1, -1)))
    .filter(pip => pip != undefined) ?? [];

export const getPipColorsFromText = (text: string): HCColors[] =>
  getPipsFromText(text).flatMap(pip => [pip.colors ?? []]) ?? ([] as HCColors[]);

export const getColorsFromText = (text: string): HCColors =>
  orderColors(
    getPipColorsFromText(text)
      .flatMap(c => c)
      .filter(c => c != 'C')
  );

/**
 * Gets the total mana value of a cost string
 */
export const getMVFromCost = (cost: string): number =>
  getPipsFromText(cost).reduce((totalMV, pip) => totalMV + (pip.mana_value ?? 0), 0);

export const getPipSrc = (name: string) => `/pips/${getPip(name)?.filename}`;
export const pipToSrc = (pip: HCCardSymbol) => `/pips/${pip.filename}`;
