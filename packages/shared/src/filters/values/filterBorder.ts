import { HCBorderColor } from '@hellfall/shared/types';
import { opType, textFilter, invertOptionType, summaryFunction } from '../types';
import { createCorrectedSummary, createSummary, opAsBool, opToNot } from '../filterUtils';
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
const correctValue = (value: string): string | undefined => toBorder[value];
export const filterBorder: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) =>
    opAsBool(value1 == toBorder[value2], operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createCorrectedSummary(
      correctValue,
      (operator, value) => `the border color is ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown border color "${value}"`
    ),
  }
);
