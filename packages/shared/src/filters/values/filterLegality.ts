import { formatList, HCFormat, HCLegalitiesField } from '../../types';
import { legalFilter, opType, invertOptionType } from '../types';
import { funcOp, opToNot } from '../filterUtils';

export const filterLegal: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    funcOp(operator, format => value1[format as HCFormat] == 'legal', value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      formatList.includes(value)
        ? `it's ${opToNot(operator)} legal in ${value}`
        : `!Unknown format "${value}"`,
  }
);
export const filterBanned: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    funcOp(operator, format => value1[format as HCFormat] == 'banned', value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      formatList.includes(value)
        ? `it's ${opToNot(operator)} banned in ${value}`
        : `!Unknown format "${value}"`,
  }
);
export const filterNotLegal: legalFilter = Object.assign(
  (value1: HCLegalitiesField, operator: opType, value2: string) =>
    funcOp(operator, format => value1[format as HCFormat] == 'not_legal', value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) =>
      formatList.includes(value)
        ? `it's ${opToNot(operator)} notlegal in ${value}`
        : `!Unknown format "${value}"`,
  }
);
