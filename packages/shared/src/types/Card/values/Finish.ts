/**
 * The finishes that a card can have
 */
export enum HCFinish {
  Nonfoil = 'nonfoil',
  Foil = 'foil',
  Etched = 'etched',
}

/**
 * Checks if a value is a {@linkcode HCFinish}
 * @param value the value to check
 */
export const isFinish = (value: any): value is HCFinish => Object.values(HCFinish).includes(value);
