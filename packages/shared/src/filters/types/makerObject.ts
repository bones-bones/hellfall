import { HCCard } from '@hellfall/shared/types';
import {
  anyFilterFunction,
  cardFilterFunction,
  cardStringFilterFunction,
  dirType,
  includeFilterFunction,
  looseOpType,
  opType,
  sortFilterFunction,
  sortType,
  noteFilterFunction,
  summaryFunction,
  invertOptionType,
  comparisonFilterFunction,
  comparisonSummaryFunction,
  numSearch,
  noteSummaryFunction,
  colorSearch,
  textFilterFunction,
} from './filterTypes';
import { createNumSummary, getActualOp, invertOp, unescapeText } from '../utils';

const xor = (value1: any, value2: any) => !value1 != !value2;

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

export interface anyFilterInterface<T = any, S = any> {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: anyFilterFunction<T, S>;
}

export interface sortInterface extends anyFilterInterface {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: sortFilterFunction;
  sort: sortType;
  dir: dirType;
}
export class sortObject implements sortInterface {
  constructor(
    public queryName: string,
    public filter: sortFilterFunction,
    public sort: sortType,
    public dir: dirType
  ) {}
}

export interface filterInterface<T = any, S = any> extends anyFilterInterface {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: cardFilterFunction<T, S>;
  summary: summaryFunction<S>;
  /**
   * The value to filter against
   */
  value: S;
  op: looseOpType;
  defaultOp: opType;
  invertOption: invertOptionType;
  inverted: boolean;
  /**
   * The method to get the value to compare from a card
   * @param card card to get the value from
   * @returns
   */
  getValueToCompare: (card: HCCard.Any) => T;

  getOp: () => opType;
  invert: () => void;
  cardPassesFilter: (card: HCCard.Any) => boolean;
  toSummary: () => string;
}

export class filterObject<T, S> implements filterInterface {
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
      this.filter(
        this.getValueToCompare(card),
        this.getOp(),
        typeof this.value == 'string' ? unescapeText(this.value) : this.value
      ),
      this.inverted
    );
}
export class UUIDFilter extends filterObject<string, string> {
  constructor(
    queryName: string,
    filter: cardFilterFunction<string, string>,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    getValueToCompare: (card: HCCard.Any) => string,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, filter, summary, value, op, getValueToCompare, defaultOp, invertOption);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), this.value.toLowerCase()),
      this.inverted
    );
}
export class InvalidFilter extends filterObject<string, string> {
  constructor(
    queryName: string,
    filter: textFilterFunction,
    summaryStart: string,
    value: string,
    op: looseOpType,
    defaultOp: opType = '>=',
    invertOption: invertOptionType = 'ignore'
  ) {
    super(
      queryName,
      filter,
      () => `${summaryStart} "${value}"`,
      value,
      op,
      card => '',
      defaultOp,
      invertOption
    );
  }
}

export class ColorFilter<T> extends filterObject<T, colorSearch> {
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

export class ComparisonFilter extends filterObject<HCCard.Any, string> {
  value2: string;
  constructor(
    queryName: string,
    filter: comparisonFilterFunction,
    summary: comparisonSummaryFunction,
    value: string,
    op: looseOpType,
    value2: string,
    defaultOp: opType = '='
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp);
    this.value2 = value2;
  }
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted, this.value2);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), this.value, this.value2),
      this.inverted
    );
}
export class StringPropSummaryFilter<T, S> extends filterObject<T, S> {
  constructor(
    queryName: string,
    filter: cardFilterFunction<T, S>,
    summary: summaryFunction<S>,
    value: S,
    op: looseOpType,
    getValueToCompare: (card: HCCard.Any) => T,
    public summaryStart: string,
    defaultOp: opType = '>=',
    invertOption: invertOptionType = 'negate'
  ) {
    super(queryName, filter, summary, value, op, getValueToCompare, defaultOp, invertOption);
    this.summaryStart = summaryStart;
  }
  toSummary = () =>
    `${this.summaryStart} ${super.summary(this.getOp(), this.value, this.inverted)}`;
}
export class NumberPropSummaryFilter<T, S extends numSearch> extends filterObject<T, S> {
  constructor(
    queryName: string,
    filter: cardFilterFunction<T, S>,
    value: S,
    op: looseOpType,
    getValueToCompare: (card: HCCard.Any) => T,
    public summaryStart: string,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      filter,
      createNumSummary(summaryStart),
      value,
      op,
      getValueToCompare,
      defaultOp,
      invertOption
    );
  }
}

export class NoteFilter extends filterObject<HCCard.Any, string> {
  note?: boolean | string;
  constructor(
    queryName: string,
    public filter: noteFilterFunction,
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
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted, this.note);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(card, this.getOp(), unescapeText(this.value), this.note), this.inverted);
}
export class IncludeFilter extends filterObject<HCCard.Any, string> {
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
export class CardStringFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: cardStringFilterFunction,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp, invertOption);
  }
}
