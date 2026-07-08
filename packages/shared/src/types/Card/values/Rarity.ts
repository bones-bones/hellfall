/**
 * All card rarities
 */
export enum HCRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Special = 'special',
  Mythic = 'mythic',
  Bonus = 'bonus',
}

/**
 * Checks if a value is a {@linkcode HCRarity}
 * @param value the value to check
 */
export const isRarity = (value: any): value is HCRarity => Object.values(HCRarity).includes(value);
