import { HCCard } from '@hellfall/shared/types';
import {
  cardFilterFunction,
  stateFilterFunction,
  dirType,
  includeFilterFunction,
  looseOpType,
  opType,
  sortType,
  noteFilterFunction,
  summaryFunction,
  invertOptionType,
  comparisonFilterFunction,
  comparisonSummaryFunction,
  numSearch,
  noteSummaryFunction,
  allPrintsGetterType,
  sortInterface,
  filterInterface,
} from '../types';
import {
  createInvalidSummary,
  createNumSummary,
  emptyFilter,
  fixValue,
  getActualOp,
  invertOp,
  shareFilter,
  textListFilter,
  createCorrectedSummary, // used for a link
  textEqualsFilter,
  createLegalitySummary,
  numSearchListFilter,
  numSearchFilter,
} from './filterUtils';
import { ensureArray, colorSearch, xor } from '@hellfall/shared/utils';
import { filterSort } from './sortRule';
import {
  queryPropType,
  getValuesFromProp,
  queryNameToValue,
  queryNameToSummary,
} from './makerUtils';
import { unescapeText } from './parseUtils';
const parseNote = (text: string): { name: string; note?: boolean | string } => {
  if (text.endsWith('<')) {
    return { name: text.slice(0, -1), note: true };
  }
  if (text.endsWith('>') && text.includes('<')) {
    const [name, note] = [text.split('<')[0], text.split('<')[1].slice(0, -1)];
    return { name, note };
  }
  return { name: text };
};

/**
 * A sort object
 */
export class SortObject implements sortInterface {
  queryName: string = 'sort';
  constructor(public sort: sortType, public dir: dirType) {}
  /**
   * A function that sorts two cards
   * @param value1 the first card to sort
   * @param operator dummy
   * @param value2 the second card to sort
   * @returns a number for `.sort()`
   */
  filter = (value1: HCCard.Any, operator: opType, value2: HCCard.Any) =>
    filterSort(value1, operator, value2, this.sort, this.dir);
}

/**
 * A filter object
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 */
export class FilterObject<T, S> implements filterInterface {
  inverted: boolean;
  constructor(
    public queryName: string,
    public filter: cardFilterFunction<T, S>,
    public summary: summaryFunction<S>,
    public value: S,
    public op: looseOpType,
    public getValueToCompare: (card: HCCard.Any) => T,
    public defaultOp: opType = '=',
    public invertOption: invertOptionType = 'flip'
  ) {
    this.inverted = false;
  }
  getOp = () => getActualOp(this.op, this.defaultOp);
  invert = () => {
    switch (this.invertOption) {
      case 'flip': {
        this.op = invertOp(this.op);
        break;
      }
      case 'negate':
        this.inverted = !this.inverted;
    }
  };
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), fixValue(this.value)),
      this.inverted
    );
}
/**
 * A filter object that doesn't unescape text (it still calls `.toLowerCase()`)
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 */
export class NoUnescapeFilter<T, S> extends FilterObject<T, S> {
  constructor(
    queryName: string,
    filter: cardFilterFunction<T, S>,
    summary: summaryFunction<S>,
    value: S,
    op: looseOpType,
    getValueToCompare: (card: HCCard.Any) => T,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, filter, summary, value, op, getValueToCompare, defaultOp, invertOption);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), fixValue(this.value, 'lower')),
      this.inverted
    );
}

/**
 * An invalid filter object (always returns true; summary is always invalid)
 */
export class InvalidFilter extends FilterObject<string, string> {
  constructor(
    queryName: string,
    summaryStart?: string,
    value: string = '',
    op: looseOpType = ':',
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'ignore'
  ) {
    super(
      queryName,
      emptyFilter,
      createInvalidSummary(summaryStart),
      value,
      op,
      card => '',
      defaultOp,
      invertOption
    );
  }
}

/**
 * A color filter object
 * @param T The type of the value from the card
 */
export class ColorFilter<T extends string[] | string[][]> extends FilterObject<T, colorSearch> {
  constructor(
    queryName: string,
    filter: cardFilterFunction<T, colorSearch>,
    summary: summaryFunction<colorSearch>,
    value: colorSearch,
    op: looseOpType,
    getValueToCompare: (card: HCCard.Any) => T,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'negate'
  ) {
    super(queryName, filter, summary, value, op, getValueToCompare, defaultOp, invertOption);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(this.getValueToCompare(card), this.getOp(), this.value), this.inverted);
}

/**
 * A comparison filter object
 */
export class ComparisonFilter extends FilterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: comparisonFilterFunction,
    summary: comparisonSummaryFunction,
    value: string,
    op: looseOpType,
    /**
     * The second value to filter against
     */
    public value2: string,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp, invertOption);
  }
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted, this.value2);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), this.value, this.value2),
      this.inverted
    );
}

/**
 * A filter object that gets props from a card
 */
export class PropFilter extends FilterObject<string[], string> {
  /**
   * The prop(s) that this filter needs to get from a card
   */
  props: queryPropType[];
  /**
   * The location on a card that this filter needs to get props from, if any
   */
  location: 'any' | 'face' | 'root';
  constructor(
    queryName: string,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    /**
     * Text to be put in front of `this.summary` when calling `this.toSummary()`, if any
     */
    public summaryStart?: string,
    defaultOp: opType = '>=',
    invertOption: invertOptionType = 'negate'
  ) {
    super(
      queryName,
      textListFilter,
      summary,
      value,
      op,
      card => this.props.flatMap(p => getValuesFromProp(card, p, this.location) as string[]),
      defaultOp,
      invertOption
    );
    ({ props: this.props, location: this.location } = queryNameToValue(queryName));
  }
  toSummary = () =>
    `the ${this.summaryStart ?? queryNameToSummary(this.queryName)} ${this.summary(
      this.getOp(),
      this.value,
      this.inverted
    )}`;
}
/**
 * A filter object that gets props from a card and that converts a value from a search into an array
 */
export class PropConvertFilter<T extends string> extends FilterObject<string[], string[]> {
  /**
   * The raw value from the search (to be displayed when the search is invalid)
   */
  summaryValue: string;
  /**
   * The prop(s) that this filter needs to get from a card
   */
  props: queryPropType[];
  /**
   * The location on a card that this filter needs to get props from, if any
   */
  location: 'any' | 'face' | 'root';
  constructor(
    queryName: string,
    /**
     * The summary function to use
     *
     * Yes, the type of this parameter is `summaryFunction<string>`.
     * Yes, the type of `this.value` is `string[]`.
     * Yes, this contradicts the definition for {@linkcode FilterObject}.
     * This is fine because `this.toSummary()` passes in `this.summaryValue`, not `this.value`
     *
     * The best way to make this is by using {@linkcode createCorrectedSummary}.
     * If you do, for the param `correctValue`, you should either pass in `toValue`
     * or a function that converts its result into a string into a value that can be shown
     */
    summary: summaryFunction<string>,
    /**
     * The value from the search
     *
     * This parameter isn't actually stored as `this.value`. Instead, `this.value` is set to
     * `toValue(value)`and this parameter is stored as `this.summaryValue`.
     */
    value: string,
    op: looseOpType,
    /**
     * A function that converts the value from the search into a value that can actually be used.
     * Should return `undefined` if the value is invalid.
     * This object calls {@linkcode ensureArray} on the output before setting `this.value` to it.
     */
    toValue: (value: T) => T[] | T | undefined = value => value,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      shareFilter,
      summary as summaryFunction<any>,
      ensureArray(toValue(unescapeText(value) as T)).map(v => unescapeText(v)),
      op,
      card => this.props.flatMap(p => getValuesFromProp(card, p, this.location) as string[]),
      defaultOp,
      invertOption
    );
    this.summaryValue = value;
    ({ props: this.props, location: this.location } = queryNameToValue(queryName));
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(this.getValueToCompare(card), this.getOp(), this.value), this.inverted);
  /**
   * @returns the result of `this.summary(this.getOp(), this.summaryValue, this.inverted)`
   */
  toSummary = () => (this.summary as any)(this.getOp(), this.summaryValue, this.inverted);
}

/**
 * A filter object that gets props from all prints of a card and that converts a value from a search into an array
 */
export class InFilter extends PropConvertFilter<string> {
  constructor(
    queryName: string,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    /**
     * A function that gets all prints of a card
     */
    public getAllPrints: allPrintsGetterType,
    /**
     * A function that converts the value from the search into a value that can actually be used.
     * Should return `undefined` if the value is invalid.
     * This object calls {@linkcode ensureArray} on the output before setting `this.value` to it.
     */
    toValue: (value: string) => string[] | string | undefined = value => value,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, summary as summaryFunction<any>, value, op, toValue, defaultOp, invertOption);
    this.summaryValue = value;
    ({ props: this.props, location: this.location } = queryNameToValue(queryName));
  }
  getValueToCompare = (card: HCCard.Any): string[] =>
    this.getAllPrints(card).flatMap(c =>
      this.props.flatMap(p => getValuesFromProp(c, p, this.location) as string[])
    );
}

/**
 * A filter object that gets number props from a card
 */
export class NumberPropFilter extends FilterObject<numSearch[], numSearch> {
  /**
   * The prop(s) that this filter needs to get from a card
   */
  props: queryPropType[];
  /**
   * The location on a card that this filter needs to get props from, if any
   */
  location: 'any' | 'face' | 'root';
  constructor(
    queryName: string,
    value: numSearch,
    op: looseOpType,
    /**
     * Text to be used as the start of the summary when calling `this.toSummary()`.
     *
     * This object sets `this.summary` to {@linkcode createNumSummary | createNumSummary(summaryStart)}
     */
    public summaryStart?: string,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      numSearchListFilter,
      createNumSummary(`the ${summaryStart ?? queryNameToSummary(queryName)}`),
      value,
      op,
      card => this.props.flatMap(p => getValuesFromProp(card, p, this.location)),
      defaultOp,
      invertOption
    );
    if (['artist', 'creator'].includes(queryName)) {
      this.getValueToCompare = card =>
        ensureArray(this.props.flatMap(p => getValuesFromProp(card, p, this.location)).length);
    }
    ({ props: this.props, location: this.location } = queryNameToValue(queryName));
  }
}
/**
 * A filter object that gets number props from a card's prints
 */
export class PrintsNumberFilter extends FilterObject<number, string> {
  constructor(
    queryName: string,
    value: string,
    op: looseOpType,
    /**
     * Text to be used as the start of the summary when calling `this.toSummary()`, or a function to use instead
     */
    summaryStart: string | summaryFunction<string>,
    /**
     * A function that gets all prints of a card
     */
    public getAllPrints: allPrintsGetterType,
    /**
     * A function that gets a number from a list of prints
     */
    getValueToCompare: (cards: HCCard.Any[]) => number = cards => cards.length,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      numSearchFilter,
      typeof summaryStart == 'string' ? createNumSummary(summaryStart) : summaryStart,
      value,
      op,
      card => getValueToCompare(this.getAllPrints(card)),
      defaultOp,
      invertOption
    );
  }
}

/**
 * A filter object that compares against a note in addition to the normal value
 */
export class NoteFilter extends FilterObject<HCCard.Any, string> {
  /**
   * The note to filter against
   *
   * If boolean, compares to `value in record`, where `record` is the record property checked by `this.filter`
   */
  note?: boolean | string;
  constructor(
    queryName: string,
    filter: noteFilterFunction,
    summary: noteSummaryFunction,
    value: string,
    op: looseOpType,
    defaultOp: opType = '>=',
    invertOption: invertOptionType = 'flip'
  ) {
    const { name, note } = parseNote(value);
    super(queryName, filter, summary, name, op, card => card, defaultOp, invertOption);
    this.note = note;
  }
  /**
   * @returns the result of `this.summary(this.getOp(), this.summaryValue, this.inverted, this.note)`
   */
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted, this.note);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(card, this.getOp(), fixValue(this.value), fixValue(this.note)), this.inverted);
}
/**
 * A filter object that compares against inclusion
 */
export class IncludeFilter extends FilterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: includeFilterFunction,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'negate'
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp, invertOption);
  }
}
/**
 * A filter object that compares against a card's state
 */
export class StateFilter extends FilterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: stateFilterFunction,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp, invertOption);
  }
}
/**
 * A filter object that checks against a card's legality in a format
 */
export class LegalityFilter extends FilterObject<string, string> {
  constructor(
    queryName: string,
    value: string,
    op: looseOpType,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      textEqualsFilter,
      createLegalitySummary(queryName),
      value,
      op,
      card => card.legalities[this.value],
      defaultOp,
      invertOption
    );
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(this.getValueToCompare(card), this.getOp(), this.queryName), this.inverted);
}
