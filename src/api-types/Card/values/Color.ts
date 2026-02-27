export enum HCColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  Colorless = 'C',
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
enum HCCoreColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  Colorless = 'C',
}

enum HCMiscColor {
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

// export type HCColor = HCCoreColor | HCMiscColor;

// export type HCCoreColors = `${HCCoreColor}`[];

// export type HCMiscColors = `${HCMiscColor}`[];

export type HCColors = `${HCColor}`[];
export const isCoreColor = (color: HCColor): boolean => {
  return Object.values(HCCoreColor).includes(color as unknown as HCCoreColor);
};

export const isMiscColor = (color: HCColor): boolean => {
  return Object.values(HCMiscColor).includes(color as unknown as HCMiscColor);
};
export const allMiscColors = Object.values(HCColor) as HCColors;
