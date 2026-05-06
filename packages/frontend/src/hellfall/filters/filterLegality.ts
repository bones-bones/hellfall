import { HCFormat, HCLegalitiesField } from '@hellfall/shared/types';
import {
  funcOp,
  legalFilter,
  looseOpType,
  opType,
  textFilter,
  getActualOp,
  opToNot,
  NOPRINT,
} from './types';

export const filterLegal: legalFilter = Object.assign(
  function (this: legalFilter, value1: HCLegalitiesField, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return funcOp(actualOp, format => value1[format as HCFormat] == 'legal', value2);
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string, operator: looseOpType) => `it's ${opToNot} legal in ${value}`,
  }
);
export const filterBanned: legalFilter = Object.assign(
  function (this: legalFilter, value1: HCLegalitiesField, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return funcOp(actualOp, format => value1[format as HCFormat] == 'banned', value2);
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string, operator: looseOpType) => `it's ${opToNot} banned in ${value}`,
  }
);
export const filterNotLegal: legalFilter = Object.assign(
  function (this: legalFilter, value1: HCLegalitiesField, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return funcOp(actualOp, format => value1[format as HCFormat] == 'not_legal', value2);
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string, operator: looseOpType) => `it's ${opToNot} notlegal in ${value}`,
  }
);
export const filterLegality: textFilter = Object.assign(
  function (this: textFilter, value1: string, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return funcOp(actualOp, legality => legality == value2, value1);
  },
  { defaultOp: '=' as opType, toSummary: (value: string, operator: looseOpType) => NOPRINT }
);
