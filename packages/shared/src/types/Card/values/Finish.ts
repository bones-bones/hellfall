export enum HCFinish {
  Nonfoil = 'nonfoil',
  Foil = 'foil',
  Etched = 'etched',
}
export const isFinish = (value: any): value is HCFinish =>
  Object.values(HCFinish).includes(value as HCFinish);
