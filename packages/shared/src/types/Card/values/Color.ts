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
  Gold = 'Gold',
  Beige = 'Beige',
  Grey = 'Grey',
}
export const HCCoreColors = ['W', 'U', 'B', 'R', 'G', 'P'];

export const HCMiscColors = [
  'Orange',
  'Brown',
  'Yellow',
  'Pink',
  'Teal',
  'TEMU',
  'Cyan',
  'Gold',
  'Beige',
  'Grey',
];
export const HCSearchColors = ['W', 'U', 'B', 'R', 'G', 'P', 'C', 'Misc bullshit'];
// export type HCColor = HCCoreColor | HCMiscColor;

// export type HCCoreColors = `${HCCoreColor}`[];

// export type HCMiscColors = `${HCMiscColor}`[];

export type HCColors = `${HCColor}`[];
// export const isCoreColor = (color: HCColor): boolean => {
//   return Object.values(HCCoreColor).includes(color as unknown as HCCoreColor);
// };

// export const isMiscColor = (color: HCColor): boolean => {
//   return Object.values(HCMiscColor).includes(color as unknown as HCMiscColor);
// };
// export const allMiscColors = ['Yellow', 'Brown', 'Pink', 'Teal', 'Orange', 'TEMU', 'Cyan', 'Gold', 'Beige', 'Grey',] //Object.values(HCMiscColor); /**as unknown as HCColor[] */
