import { formatList, HCFormat, HCLegalitiesField } from '@hellfall/shared/types';
import { legalFilter, opType, invertOptionType } from '../types';
import { createCorrectedSummary, createSummary, opAsBool, opToNot } from '../filterUtils';

export const filterLegal: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    opAsBool(value1[value2] == 'legal', operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createCorrectedSummary(
      (value: string) => (formatList.includes(value) ? value : undefined),
      (operator, value) => `it's ${opToNot(operator)} legal in ${value}`,
      (operator, value) => `!Unknown format "${value}"`
    ),
  }
);
export const filterBanned: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    opAsBool(value1[value2] == 'banned', operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createCorrectedSummary(
      (value: string) => (formatList.includes(value) ? value : undefined),
      (operator, value) => `it's ${opToNot(operator)} banned in ${value}`,
      (operator, value) => `!Unknown format "${value}"`
    ),
  }
);
export const filterNotLegal: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    opAsBool(value1[value2] == 'not_legal', operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createCorrectedSummary(
      (value: string) => (formatList.includes(value) ? value : undefined),
      (operator, value) => `it's ${opToNot(operator)} notlegal in ${value}`,
      (operator, value) => `!Unknown format "${value}"`
    ),
  }
);
