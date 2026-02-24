import { HCCardSymbol } from '../types/Symbology';
// import { Pip } from '../types';
import { atom } from 'jotai';

export const pipsAtom = atom<HCCardSymbol[]>([]);

export const loadPips = async () => {
  debugger;
  const { data } = await import('../data/pips.json');
  const transformedData = (data).map(item => {
    let manaValue: number;
    
    if (typeof item.mana_value === 'number') {
      return {
        ...item,
        mana_value: item.mana_value
      };
    }
    if (typeof item.mana_value === 'string') {
      if (item.mana_value.includes('/')){
        const nums = item.mana_value.split('/');
        return {
          ...item,
          mana_value: parseInt(nums[0])/parseInt(nums[1])
        };
      }
      if (item.mana_value == "∞"){
        return {
          ...item,
          mana_value: parseFloat("Infinity")
        };
      }
    }
    return {
      ...item,
      mana_value: 0
    };
  });
  debugger;

  return transformedData as HCCardSymbol[];
  // return data ;
};
