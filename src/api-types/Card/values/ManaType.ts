export enum HCCoreManaType {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Purple = 'P',
  ManaTypeless = 'C',
}
export enum HCMiscManaType {
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

export type HCCoreManaTypes = `${HCCoreManaType}`[];

export type HCMiscManaTypes = `${HCMiscManaType}`[];

export type HCManaTypes = `${HCCoreManaType | HCMiscManaType}`[];
