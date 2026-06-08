export enum HCLegality {
  Legal = 'legal',
  NotLegal = 'not_legal',
  // Restricted = 'restricted',
  Banned = 'banned',
}
export const isLegality = (value: any): value is HCLegality =>
  Object.values(HCLegality).includes(value as HCLegality);
