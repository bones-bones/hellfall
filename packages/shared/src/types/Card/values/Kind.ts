/**
 * The kind of card something is.
 */
export enum HCKind {
  Card = 'card',
  Token = 'token',
  Land = 'land', // lands from the land box
  Front = 'front', // jumpstart front cards
  Scryfall = 'scryfall', // scryfall tokens
  NotMagic = 'notmagic',
}
