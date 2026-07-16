import { HCCard, HCCardSymbol } from '@hellfall/shared/types';
import { colorSearch, pipSearch, shorthandType } from '@hellfall/shared/utils';
/**
 * The type of an operator
 *
 * For clarity, always use `operator` as the parameter name for this
 */
export type opType = '<' | '<=' | '=' | '>=' | '>' | '!=';

/**
 * The type of an operator, including loose operators
 *
 * For clarity, always use `op` as the parameter name for this
 */
export type looseOpType = ':' | '!:' | opType;

/**
 * The list of all loose operators
 */
export const looseOpList: looseOpType[] = [':', '!:', '<', '<=', '=', '>=', '>', '!='];
export const isLooseOp = (value: any): value is looseOpType => looseOpList.includes(value);
const invertOptions = ['ignore', 'flip', 'negate'] as const;
/**
 * The option for how to handle the inversion operator
 *
 * `ignore:` object ignores the inversion operator
 *
 * `flip:` object inverts the operator before passing it in
 *
 * `negate:` object negates the filter's output; filter requires `invert` to be passed to summary function
 */
export type invertOptionType = (typeof invertOptions)[number];

/**
 * A function that produces a summary for a filter
 *
 * @template T The type of the search value
 */
export interface summaryFunction<T> {
  (operator: opType, value: T, invert?: boolean, ...args: any[]): string;
}

/**
 * Any filter
 */
export interface anyFilterFunction<T = any, S = any> {
  /**
   * The result of calling this filter
   */
  (value1: T, operator: opType, value2: S, ...args: any[]): number | boolean | undefined;
  // /**
  //  * How to handle inversion of this filter
  //  */
  // invertOption: invertOptionType;
  // /**
  //  * The function that produces a summary of this filter
  //  */
  // toSummary: summaryFunction<S>;
}

/**
 * the list of sort direction options
 */
export const dirTypeList = ['asc', 'desc', 'auto'] as const;
/**
 * a sort direction option
 */
export type dirType = (typeof dirTypeList)[number];

/**
 * the list of sort options
 */
export const sortTypeList = [
  'set',
  'color',
  'manavalue',
  'name',
  'id',
  'number',
  'setnumber',
  'colormanavalue',
  'auto',
] as const;
/**
 * a sort option
 */
export type sortType = (typeof sortTypeList)[number];

/**
 * A function that sorts two cards
 */
export interface sortFilterFunction extends anyFilterFunction<HCCard.Any, HCCard.Any> {
  (value1: HCCard.Any, operator: opType, value2: HCCard.Any, sort: sortType, dir: dirType): number;
  // /**
  //  * The sort option to use
  //  */
  // sort: sortType;
  // /**
  //  * The direction to sort the cards
  //  */
  // dir: dirType;
}

/**
 * Any card filter
 * @template T the type of the value from the card
 * @template S the type of the search value
 */
export interface cardFilterFunction<T = any, S = any> extends anyFilterFunction {
  (value1: T, operator: opType, value2: S, ...args: any[]): boolean | undefined;
  // /**
  //  * How to handle inversion of this filter
  //  */
  // invertOption: invertOptionType;
  // /**
  //  * The function that produces a summary of this filter
  //  */
  // toSummary: summaryFunction<S>;
}
/**
 * Any filter that compares a string from a card with a string from a search
 */
export interface textFilterFunction extends cardFilterFunction<string, string> {}
/**
 * Any filter that compares a list of strings from a card with a string from a search
 */
export interface textListFilterFunction extends cardFilterFunction<string[], string> {}
/**
 * Any filter that compares a list of strings from a card with a string from a search
 */
export interface textListsFilterFunction extends cardFilterFunction<string[], string[]> {}
/**
 * Any filter that compares two numbers
 */
export interface numFilterFunction extends cardFilterFunction<number, number> {}

/**
 * A union of the types that can be the value for a number filter
 */
export type numSearch = number | string | undefined;
/**
 * Any filter that compares two values that can be converted into numbers
 */
export interface numSearchFilterFunction extends cardFilterFunction<numSearch, numSearch> {}
/**
 * Any filter that compares a list of values that can be converted into numbers from a card with a value that can be converted into a number from a search
 */
export interface numSearchListFilterFunction extends cardFilterFunction<numSearch[], numSearch> {}
const multiOpToNum: Record<opType, number> = {
  '<': 2,
  '<=': 0,
  '=': 2,
  '>=': 2,
  '>': 5,
  '!=': 2,
};
/**
 * Get the number to compare against when using a given op
 * @param operator operator to use
 * @param value shorthand value to use
 * @returns number to compare against
 */
export const shortToNum = (operator: opType, value: shorthandType) => {
  if (value == 'c') {
    return 0;
  } else {
    return multiOpToNum[operator];
  }
};

/**
 * Any filter that compares colors from a card with a value from a search
 */
export interface colorFilterFunction extends cardFilterFunction<string[], colorSearch> {}
/**
 * Any filter that compares a set of colors from a card with a value from a search
 */
export interface colorListFilterFunction extends cardFilterFunction<string[][], colorSearch> {}
/**
 * Any filter that compares pips from a card with a value from a search
 */
export interface pipFilterFunction extends cardFilterFunction<HCCardSymbol[], pipSearch> {}
/**
 * Any filter that compares a set of pips from a card with a value from a search
 */
export interface pipListFilterFunction extends cardFilterFunction<HCCardSymbol[][], pipSearch> {}
/**
 * The list of options for inclusion filters
 */
const inclusionOptions = [
  'extras',
  'nonextras',
  'all',
  'extracards',
  'tokens',
  'vetoed',
  'drop',
] as const;
/**
 * An option for inclusion filters
 */
export type inclusionType = (typeof inclusionOptions)[number];
export const isInclusionType = (value: any): value is inclusionType =>
  inclusionOptions.includes(value);
/**
 * An inclusion filter
 */
export interface includeFilterFunction extends cardFilterFunction<HCCard.Any, string> {}
/**
 * Any filter that compares a card's state with a string from a search
 */
export interface stateFilterFunction extends cardFilterFunction<HCCard.Any, string> {}
/**
 * Any filter that compares two properties of a card
 */
export interface comparisonFilterFunction extends cardFilterFunction<HCCard.Any, string> {
  (value1: HCCard.Any, operator: opType, value2: string, value3: string, dropFaces?: boolean):
    | boolean
    | undefined;
}
/**
 * A function that produces a summary for a {@linkcode comparisonFilterFunction}
 */
export interface comparisonSummaryFunction extends summaryFunction<string> {
  (operator: opType, value: string, invert?: boolean, value2?: string): string;
}
/**
 * Any filter that checks against a note record property
 */
export interface noteFilterFunction extends cardFilterFunction<HCCard.Any, string> {
  (value1: HCCard.Any, operator: opType, value2: string, note?: boolean | string):
    | boolean
    | undefined;
}
/**
 * A function that produces a summary for a {@linkcode noteFilterFunction}
 */
export interface noteSummaryFunction extends summaryFunction<string> {
  (operator: opType, value: string, invert?: boolean, note?: boolean | string): string;
}
