import { HCCard, HCFormat } from '@hellfall/shared/types';
import {
  cardFilter,
  cardStringFilter,
  legalFilter,
  looseOpType,
  opType,
  setFilter,
  tagFilter,
} from './types';

export interface filterInterface<T = any, S = any> {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: cardFilter<T, S>;
  /**
   * The value to filter against
   */
  value: S;
  op: looseOpType;
  defaultOp: opType;
  /**
   * The method to get the value to compare from a card
   * @param card card to get the value from
   * @returns
   */
  getValueToCompare: (card: HCCard.Any) => T;
  toSummary: (value: S, op: looseOpType) => string;
  cardPassesFilter: (card: HCCard.Any) => boolean;
}

export class filterObject<T, S> implements filterInterface {
  constructor(
    public queryName: string,
    public filter: cardFilter<T, S>,
    public value: S,
    public op: looseOpType,
    public defaultOp: opType,
    public getValueToCompare: (card: HCCard.Any) => T,
    public toSummary: (value: S, op: looseOpType) => string
  ) {}
  cardPassesFilter = (card: HCCard.Any) =>
    this.filter(
      this.getValueToCompare(card),
      this.op == ':' ? this.defaultOp : this.op,
      this.value
    );
}
export class PassThroughSummaryFilter<T, S> extends filterObject<T, S> {
  constructor(
    queryName: string,
    public filter: cardFilter<T, S>,
    value: S,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => T
  ) {
    super(queryName, filter, value, op, defaultOp, getValueToCompare, filter.toSummary);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    this.filter(
      this.getValueToCompare(card),
      this.op == ':' ? this.defaultOp : this.op,
      this.value
    );
}

export class TagFilter extends filterObject<string[], string> {
  constructor(
    queryName: string,
    public filter: tagFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => string[]
  ) {
    super(queryName, filter, value, op, defaultOp, getValueToCompare, filter.toSummary);
  }
  getNotes = (card: HCCard.Any) => card.tag_notes;
  cardPassesFilter = (card: HCCard.Any) =>
    this.filter(
      this.getValueToCompare(card),
      this.op == ':' ? this.defaultOp : this.op,
      this.value,
      this.getNotes(card)
    );
}
export class SetFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    public filter: setFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    public includeExtras: boolean
  ) {
    super(queryName, filter, value, op, defaultOp, card => card, filter.toSummary);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    this.filter(
      this.getValueToCompare(card),
      this.op == ':' ? this.defaultOp : this.op,
      this.value,
      this.includeExtras
    );
}
export class CardStringFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    public filter: cardStringFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType
  ) {
    super(queryName, filter, value, op, defaultOp, card => card, filter.toSummary);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    this.filter(
      this.getValueToCompare(card),
      this.op == ':' ? this.defaultOp : this.op,
      this.value
    );
}
