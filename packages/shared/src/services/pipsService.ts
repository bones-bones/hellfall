import { HCCardSymbol } from '../types/Symbology';
import pipsRawData from '../data/pips.json';

// Module-level cache (persists across imports)
let pipsCache: HCCardSymbol[] | null = null;
let loadingPromise: Promise<HCCardSymbol[]> | null = null;

// Transform function (moved from your atom)
const transformPipsData = (data: any[]): HCCardSymbol[] => {
  return data.map(item => {
    let manaValue: number;

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

// Synchronous getter (fast, but returns null if not loaded)
export const getPipsData = (): HCCardSymbol[] | null => {
  return pipsCache;
};

// Async loader with deduplication
export const loadPipsData = async (): Promise<HCCardSymbol[]> => {
  // If already loaded, return cache
  if (pipsCache) {
    return pipsCache;
  }

  // If currently loading, wait for that promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = (async () => {
    const transformed = transformPipsData(pipsRawData.data);
    pipsCache = transformed;
    return transformed;
  })();

  return loadingPromise;
};

// Sync loader (throws if not loaded yet)
export const requirePipsData = (): HCCardSymbol[] => {
  if (!pipsCache) {
    throw new Error('Pips data not loaded. Call loadPipsData() first.');
  }
  return pipsCache;
};
