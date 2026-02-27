export enum HCCoreColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  Colorless = 'C',
}
export enum HCSearchColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  Colorless = 'C',
  MISC_BULLSHIT = 'Misc bullshit',
}
export enum HCMiscColor {
  Pickle = 'Pickle',
  Yellow = 'Yellow',
  Brown = 'Brown',
  Pink = 'Pink',
  Teal = 'Teal',
  Orange = 'Orange',
  TEMU = 'TEMU',
  Gold = 'Gold',
  Beige = 'Beige',
  Grey = 'Grey',
}
export type HCColor = HCCoreColor | HCMiscColor;

export type HCCoreColors = `${HCCoreColor}`[];

export type HCMiscColors = `${HCMiscColor}`[];

export type HCColors = `${HCCoreColor | HCMiscColor}`[];
