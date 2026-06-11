export enum HCRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Special = 'special',
  Mythic = 'mythic',
  Bonus = 'bonus',
}
export const isRarity = (value: any): value is HCRarity =>
  Object.values(HCRarity).includes(value as HCRarity);
