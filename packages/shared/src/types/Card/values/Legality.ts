/**
 * The legalities that a card can have in a given format
 */
export enum HCLegality {
  Legal = 'legal',
  NotLegal = 'not_legal',
  // Restricted = 'restricted',
  Banned = 'banned',
}
/**
 * Checks if a value is a {@linkcode HCLegality}
 * @param value the value to check
 */
export const isLegality = (value: any): value is HCLegality =>
  Object.values(HCLegality).includes(value);
