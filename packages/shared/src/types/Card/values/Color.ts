import { doubleListEquals } from '../../../utils';

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
export const isColor = (value: any): value is HCColor =>
  Object.values(HCColor).includes(value as HCColor);

export const HCCoreColors: HCColors = ['W', 'U', 'B', 'R', 'G', 'P'];

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

export const HCSearchColors = ['W', 'U', 'B', 'R', 'G', 'P', 'C', 'Misc'];
// export type HCColor = HCCoreColor | HCMiscColor;

// export type HCCoreColors = HCCoreColor[];

// export type HCMiscColors = HCMiscColor[];

export type HCColors = `${HCColor}`[];

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
