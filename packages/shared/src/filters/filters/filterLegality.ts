import { formatList, HCLegalitiesField } from '@hellfall/shared/types';
import { legalFilterFunction, opType } from '../types';
import { createCorrectedSummary, opAsBool, opToNot } from '../utils';

export const legalFilter: legalFilterFunction = (
  value1: HCLegalitiesField,
  operator: opType,
  value2: string
) => opAsBool(value1[value2] == 'legal', operator);
export const legalSummary = createCorrectedSummary(
  (value: string) => (formatList.includes(value) ? value : undefined),
  (operator, value) => `it's ${opToNot(operator)} legal in ${value}`,
  (operator, value) => `!Unknown format "${value}"`
);
export const bannedFilter: legalFilterFunction = (
  value1: HCLegalitiesField,
  operator: opType,
  value2: string
) => opAsBool(value1[value2] == 'banned', operator);
export const bannedSummary = createCorrectedSummary(
  (value: string) => (formatList.includes(value) ? value : undefined),
  (operator, value) => `it's ${opToNot(operator)} banned in ${value}`,
  (operator, value) => `!Unknown format "${value}"`
);
export const notLegalFilter: legalFilterFunction = (
  value1: HCLegalitiesField,
  operator: opType,
  value2: string
) => opAsBool(value1[value2] == 'not_legal', operator);
export const notLegalSummary = createCorrectedSummary(
  (value: string) => (formatList.includes(value) ? value : undefined),
  (operator, value) => `it's ${opToNot(operator)} notlegal in ${value}`,
  (operator, value) => `!Unknown format "${value}"`
);
