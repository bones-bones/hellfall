import { HCBorderColor } from '@hellfall/shared/types';
import { opType, textFilterFunction, invertOptionType } from '../types';
import { createCorrectedSummary, opAsBool, opToNot } from '../utils';
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
/**
 * Filters based on card border
 * @param value1 the border of the card
 * @param operator the operator to use
 * @param value2 the border from the search
 */
export const borderFilter: textFilterFunction = (
  value1: string,
  operator: opType,
  value2: string
) => opAsBool(value1 == toBorder[value2], operator);

const correctValue = (value: string): string | undefined => toBorder[value];
export const borderSummary = createCorrectedSummary(
  correctValue,
  (operator, value) => `the border color is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown border color "${value}"`
);
