/**
 * A color for a card
 */
export enum HCColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  Colorless = 'C',
  Orange = 'Orange',
  Brown = 'Brown',
  Yellow = 'Yellow',
  Pink = 'Pink',
  Teal = 'Teal',
  TEMU = 'TEMU',
  Cyan = 'Cyan',
  Ultraviolet = 'Ultraviolet',
  Gold = 'Gold',
  Beige = 'Beige',
  Grey = 'Grey',
  Lime = 'Lime',
}
/**
 * Checks if a value is a {@linkcode HCColor}
 * @param value the value to check
 */
export const isColor = (value: any): value is HCColor => Object.values(HCColor).includes(value);

/**
 * The list of core colors
 */
export const HCCoreColors: HCColors = ['W', 'U', 'B', 'R', 'G', 'P'];

/**
 * The list of colors that can be reduced to `Misc` for misc searches
 */
export const HCMiscColors: HCColors = [
  'Orange',
  'Brown',
  'Yellow',
  'Pink',
  'Teal',
  'TEMU',
  'Cyan',
  'Ultraviolet',
  'Gold',
  'Beige',
  'Grey',
  'Lime',
];

/**
 * The list of colors to use in the advanced search dropdown
 */
export const HCSearchColors = ['W', 'U', 'B', 'R', 'G', 'P', 'C', 'Misc'];
// export type HCColor = HCCoreColor | HCMiscColor;

// export type HCCoreColors = HCCoreColor[];

// export type HCMiscColors = HCMiscColor[];

export type HCColors = `${HCColor}`[];

/**
 * Checks if a value is {@linkcode HCColors}. Also returns false if there are any duplicate colors
 * @param value the value to check
 */
export const isColors = (value: any): value is HCColors => {
  if (!Array.isArray(value)) return false;
  const colorList: HCColors = [];
  for (const color of value) {
    if (colorList.includes(color) || !isColor(color)) {
      return false;
    } else {
      colorList.push(color);
    }
  }
  return true;
};

// export const isCoreColor = (color: HCColor): boolean => {
//   return Object.values(HCCoreColor).includes(color as unknown as HCCoreColor);
// };

// export const isMiscColor = (color: HCColor): boolean => {
//   return Object.values(HCMiscColor).includes(color as unknown as HCMiscColor);
// };
// export const allMiscColors = ['Yellow', 'Brown', 'Pink', 'Teal', 'Orange', 'TEMU', 'Cyan', 'Gold', 'Beige', 'Grey',] //Object.values(HCMiscColor); /**as unknown as HCColor[] */
