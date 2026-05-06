import { HCBorderColor, HCCard } from '@hellfall/shared/types';
import {
  funcOp,
  cardStringFilter,
  looseOpType,
  opType,
  textFilter,
  getActualOp,
  opToNot,
} from '../types';
const toBorder: Record<string, HCBorderColor> = {
  black: HCBorderColor.Black,
  white: HCBorderColor.White,
  borderless: HCBorderColor.Borderless,
  silver: HCBorderColor.Silver,
  gold: HCBorderColor.Gold,
  yellow: HCBorderColor.Yellow,
  rainbow: HCBorderColor.Rainbow,
  blue: HCBorderColor.Blue,
  no: HCBorderColor.NoBorder,
  none: HCBorderColor.NoBorder,
  noborder: HCBorderColor.NoBorder,
  unique: HCBorderColor.Unique,
  orange: HCBorderColor.Orange,
  red: HCBorderColor.Red,
};
export const filterBorder: textFilter = Object.assign(
  function (this: textFilter, value1: string, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    return funcOp(
      actualOp,
      border => (border in toBorder ? value1 == toBorder[border] : false),
      value2
    );
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string, operator: looseOpType) => {
      if (value in toBorder) {
        // TODO: Make sure this doesn't cause double spaces
        return `the border color is ${opToNot(operator)} "${toBorder[value]}"`;
      } else {
        return '!';
      }
    },
  }
);
