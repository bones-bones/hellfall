import { HCBorderColor } from '@hellfall/shared/types';
import { opType, textFilter, invertOptionType } from '../types';
import { funcOp, opToNot } from '../filterUtils';
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
  (value1: string, operator: opType, value2: string) =>
    funcOp(
      operator,
      (border: string) => (border in toBorder ? value1 == toBorder[border] : false),
      value2
    ),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      if (value in toBorder) {
        // TODO: Make sure this doesn't cause double spaces
        return `the border color is ${opToNot(operator)} "${toBorder[value]}"`;
      } else {
        return `!Unknown border color "${value}"`;
      }
    },
  }
);
