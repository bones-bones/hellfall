import { HCCard } from '@hellfall/shared/types';
import {
  anyFilter,
  cardFilter,
  cardStringFilter,
  dirType,
  includeFilter,
  looseOpType,
  opType,
  sortFilter,
  sortType,
  noteFilter,
} from './filterTypes';
import { createNumSummary, getActualOp, unescapeText } from '../utils';

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
  filter: anyFilter<T, S>;
}

export interface sortInterface extends anyFilterInterface {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: sortFilter;
  sort: sortType;
  dir: dirType;
}
export class sortObject implements sortInterface {
  constructor(
    public queryName: string,
    public filter: sortFilter,
    public sort: sortType,
    public dir: dirType
  ) {}
}

export interface filterInterface<T = any, S = any> extends anyFilterInterface {
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
  inverted?: boolean;
  /**
   * The method to get the value to compare from a card
   * @param card card to get the value from
   * @returns
   */
  getOp: () => opType;
  getValueToCompare: (card: HCCard.Any) => T;
  toSummary: (invert?: boolean) => string;
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
    public toSummary: (invert?: boolean) => string,
    public inverted?: boolean
  ) {}
  getOp = () => getActualOp(this.op, this.defaultOp);
  cardPassesFilter = (card: HCCard.Any) =>
    !this.inverted !=
    !this.filter(
      this.getValueToCompare(card),
      this.getOp(),
      typeof this.value == 'string' ? unescapeText(this.value) : this.value
    );
}
export class UUIDFilter extends filterObject<string, string> {
  constructor(
    queryName: string,
    filter: cardFilter<string, string>,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => string,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      getValueToCompare,
      (invert?: boolean) => this.filter.toSummary(this.getOp(), this.value, invert),
      inverted
    );
    this.cardPassesFilter = (card: HCCard.Any) =>
      !this.inverted !=
      !this.filter(this.getValueToCompare(card), this.getOp(), this.value.toLowerCase());
  }
}
export class PassThroughSummaryFilter<T, S> extends filterObject<T, S> {
  constructor(
    queryName: string,
    filter: cardFilter<T, S>,
    value: S,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => T,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      getValueToCompare,
      (invert?: boolean) => this.filter.toSummary(this.getOp(), this.value, invert),
      inverted
    );
  }
}

// export class PrintsFilter extends PassThroughSummaryFilter<HCCard.Any[],string> {
//   constructor(
//     queryName: string,
//     public filter: printsFilter,
//     value: string,
//     op: looseOpType,
//     defaultOp: opType,
//     getValueToCompare: (card: HCCard.Any) => HCCard.Any[],
//   ) {
//     super(
//       queryName,
//       filter,
//       value,
//       op,
//       defaultOp,
//       getValueToCompare
//     );

//   }
// }

export class CompFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: cardStringFilter,
    value1: string,
    op: looseOpType,
    value2: string,
    defaultOp: opType,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      '',
      op,
      defaultOp,
      (card: HCCard.Any) => card,
      () => this.filter.toSummary(this.getOp(), this.value),
      inverted
    );
    this.value = `${value1}${this.getOp()}${value2}`;
  }
}
export class StringPropSummaryFilter<T, S> extends filterObject<T, S> {
  constructor(
    queryName: string,
    public filter: cardFilter<T, S>,
    value: S,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => T,
    public summaryStart: string,
    public opFunc: (op: opType, value: S, invert?: boolean) => string,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      getValueToCompare,
      (invert?: boolean) => `${this.summaryStart} ${this.opFunc(this.getOp(), this.value, invert)}`,
      inverted
    );
  }
}
export class NumberPropSummaryFilter<T, S extends number | string | undefined> extends filterObject<
  T,
  S
> {
  constructor(
    queryName: string,
    public filter: cardFilter<T, S>,
    value: S,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => T,
    public summaryStart: string,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      getValueToCompare,
      () => createNumSummary(summaryStart)(this.getOp(), this.value),
      inverted
    );
  }
}

export class NoteFilter extends filterObject<HCCard.Any, string> {
  note?: boolean | string;
  constructor(
    queryName: string,
    public filter: noteFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    getValueToCompare: (card: HCCard.Any) => HCCard.Any,
    inverted?: boolean
  ) {
    const { name, note } = parseNote(value);
    super(
      queryName,
      filter,
      name,
      op,
      defaultOp,
      getValueToCompare,
      (invert?: boolean) => this.filter.toSummary(this.getOp(), this.value, invert, this.note),
      inverted
    );
    this.note = note;
  }
  cardPassesFilter = (card: HCCard.Any) =>
    !this.inverted != !this.filter(card, this.getOp(), unescapeText(this.value), this.note);
}
export class IncludeFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    public filter: includeFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      card => card,
      () => this.filter.toSummary(this.getOp(), this.value, this.inverted),
      inverted
    );
  }
}
export class CardStringFilter extends filterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    public filter: cardStringFilter,
    value: string,
    op: looseOpType,
    defaultOp: opType,
    inverted?: boolean
  ) {
    super(
      queryName,
      filter,
      value,
      op,
      defaultOp,
      card => card,
      (invert?: boolean) => this.filter.toSummary(this.getOp(), this.value, invert),
      inverted
    );
  }
}
