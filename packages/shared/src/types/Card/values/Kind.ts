/**
 * The kind of card something is.
 */
export enum HCKind {
  Card = 'card',
  Land = 'land', // lands from the land box
  Token = 'token',
  Front = 'front', // jumpstart front cards
  Scryfall = 'scryfall', // scryfall tokens
  NotMagic = 'notmagic',
}
/**
 * Checks if a value is a {@linkcode HCKind}
 * @param value the value to check
 */
export const isKind = (value: any): value is HCKind =>
  Object.values(HCKind).includes(value as HCKind);

/**
 * Finds the index of an {@linkcode HCKind} in the enum
 * @param kind kind to get the index of
 */
export const toKindIndex = (kind: HCKind) => Object.values(HCKind).indexOf(kind);
