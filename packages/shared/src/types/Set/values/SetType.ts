export enum SetType {
  /** A main cube */
  Main = 'main',

  /** A side cube */
  Side = 'side',

  /** A set made up of vetoed cards */
  Veto = 'veto',

  /** A set made up of basic lands */
  Land = 'land',

  /** A set made up of tokens and emblems. */
  Token = 'token',

  /** A set made up of gold-bordered, oversize, or trophy cards that are not legal */
  Memorabilia = 'memorabilia',

  /** A set made up of normal cards */
  Unfunny = 'unfunny',
}
export const isSetType = (value: any): value is SetType =>
  Object.values(SetType).includes(value as SetType);
