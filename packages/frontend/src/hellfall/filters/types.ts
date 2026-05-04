import { HCCard, HCColors } from '@hellfall/shared/types';

export type opType = '<' | '<=' | '=' | '>=' | '>' | '!=';
export type looseOpType = ':' | opType;

export interface cardFilter<T = any, S = any> {
  (value1: T, operator: looseOpType, value2: S): boolean;
  defaultOp: opType;
}
export interface textFilter extends cardFilter<string, string> {}
export interface textListFilter extends cardFilter<string[], string> {}
export interface textRecordFilter extends cardFilter<Record<string, string>, [string, string]> {}
const invertedOps: Record<opType, opType> = {
  '<': '>=',
  '<=': '>',
  '=': '!=',
  '>=': '<',
  '>': '<=',
  '!=': '=',
};
export const invertOp = (op: opType) => {
  return invertedOps[op];
};
export interface numFilter extends cardFilter<number, number> {}
export interface numStringFilter extends cardFilter<number | string | undefined, number | string> {}
export interface colorFilter extends cardFilter<string[], string[]> {}
export interface hybridFilter extends cardFilter<string[][], string[]> {}
// export interface setFilter extends cardFilter<string[],HCCard.Any> {}
export interface setFilter extends cardFilter<string[], HCCard.Any> {
  (value1: string[], operator: looseOpType, value2: HCCard.Any, includeExtraSets: boolean): boolean;
}