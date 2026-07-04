import {
  anyPropOrder,
  anyPropType,
  HCCard,
  isAnyPropType,
  isFacePropType,
  isRootPropType,
} from '@hellfall/shared/types';
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
} from './filterTypes';
import {
  createNumSummary,
  emptyFilter,
  getActualOp,
  invertOp,
  shareFilter,
  textListFilter,
  unescapeText,
  xor,
} from '../utils';
import {
  ensureArray,
  getAllNames,
  getFromAll,
  getFromFaces,
  toFaces,
} from '@hellfall/shared/utils';
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

interface anyFilterInterface<T = any, S = any> {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: anyFilterFunction<T, S>;
}

interface sortInterface extends anyFilterInterface {
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

interface filterInterface<T = any, S = any> extends anyFilterInterface {
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
      this.filter(
        this.getValueToCompare(card),
        this.getOp(),
        typeof this.value == 'string' ? unescapeText(this.value) : this.value
      ),
      this.inverted
    );
}
export class UUIDFilter extends FilterObject<string, string> {
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
export class InvalidFilter extends FilterObject<string, string> {
  constructor(
    queryName: string,
    summaryStart: string,
    value: string,
    op: looseOpType,
    defaultOp: opType = '>=',
    invertOption: invertOptionType = 'ignore'
  ) {
    super(
      queryName,
      emptyFilter,
      () => `${summaryStart} "${value}"`,
      value,
      op,
      card => '',
      defaultOp,
      invertOption
    );
  }
}

export class ColorFilter<T> extends FilterObject<T, colorSearch> {
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

export class ComparisonFilter extends FilterObject<HCCard.Any, string> {
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
export class LegalityFilter extends FilterObject<HCCard.Any, string> {
  constructor(
    queryName: string,
    filter: comparisonFilterFunction,
    summary: comparisonSummaryFunction,
    value: string,
    op: looseOpType,
    defaultOp: opType = '='
  ) {
    super(queryName, filter, summary, value, op, card => card, defaultOp);
  }
  toSummary = () => this.summary(this.getOp(), this.queryName, this.inverted, this.value);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(
      this.filter(this.getValueToCompare(card), this.getOp(), this.queryName, this.value),
      this.inverted
    );
}

const getValuesFromProp = <T extends anyPropType>(
  card: HCCard.Any,
  prop: T,
  location: 'any' | 'face' | 'root' = 'any'
): string[] => {
  if (prop == 'name') {
    return getAllNames(card).map(value => unescapeText(value));
  }
  if (prop == ('showcase' as any)) {
    return card.tag_notes?.['showcase-frame'].split(', ') ?? [];
  }
  const values: string[] = [];
  if (isFacePropType(prop) && location != 'root') {
    switch (prop) {
      case 'supertypes':
      case 'types':
      case 'subtypes':
        values.push(
          ...toFaces(card).flatMap(e => (e[prop] && e[prop]?.length > 1 ? e[prop].join(' ') : []))
        );
        break;
      case 'type_line':
        values.push(...getFromFaces(card, 'supertypes'));
        values.push(...getFromFaces(card, 'types'));
        values.push(...getFromFaces(card, 'subtypes'));
        break;
    }
    values.push(
      ...((isRootPropType(prop) && location != 'face' ? getFromAll : (getFromFaces as any))(
        card,
        prop
      ) as string[])
    );
  } else if (isRootPropType(prop) && location != 'face') {
    const value = card[prop];
    if (typeof value == 'object' && !Array.isArray(value) && value !== null) {
      values.push(...Object.values(value));
    } else {
      values.push(...ensureArray<string>(card[prop] as string | string[] | undefined));
    }
  }
  return values.map(value => unescapeText(value));
};
type queryValueType = { props: anyPropType[]; location: 'any' | 'face' | 'root' };
const queryNamePropRecord: Record<string, anyPropType | anyPropType[]> = {
  mana: 'mana_cost',
  type: 'type_line',
  cardtype: 'types',
  oracle: 'oracle_text',
  flavor: 'flavor_text',
  lore: ['name', 'type_line', 'oracle_text', 'flavor_text'],
  border: 'border_color',
  cardframe: 'frame',
  frame: ['frame', 'frame_effects'],
  facelayout: 'layout',
  anylayout: 'layout',
};
const queryNameLocationRecord: Record<string, 'face' | 'root'> = {
  layout: 'root',
  facelayout: 'face',
};
const queryNameToValue = (queryName: string): queryValueType => {
  const queryValue: queryValueType = {
    props: [],
    location: 'any',
  };
  const queryProp = queryNamePropRecord[queryName];
  if (queryProp) {
    queryValue.props = ensureArray(queryProp);
  }
  if (isAnyPropType(queryName) && !queryValue.props) {
    queryValue.props = [queryName];
  }
  if (!queryValue.props) {
    const name =
      anyPropOrder.find(prop => [queryName, `${queryName}s`].includes(prop.replaceAll('_', ''))) ??
      (queryName as anyPropType);
    queryValue.props = ensureArray(name);
  }
  if (queryName in queryNameLocationRecord) {
    queryValue.location = queryNameLocationRecord[queryName];
  }
  return queryValue;
};
export class PropFilter extends FilterObject<string[], string> {
  queryValue: queryValueType;
  constructor(
    queryName: string,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
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
      card => this.queryValue.props.flatMap(p => getValuesFromProp(card, p)),
      defaultOp,
      invertOption
    );
    this.queryValue = queryNameToValue(queryName);
  }
  toSummary = () =>
    `${this.summaryStart ? `${this.summaryStart} ` : ''}${super.summary(
      this.getOp(),
      this.value,
      this.inverted
    )}`;
}
export class PropConvertFilter extends FilterObject<string[], string[]> {
  summaryValue: string;
  queryValue: queryValueType;
  constructor(
    queryName: string,
    summary: summaryFunction<string>,
    value: string,
    op: looseOpType,
    public toValue: (value: string) => string[] | string | undefined = value => value,
    public summaryStart?: string,
    defaultOp: opType = '=',
    invertOption: invertOptionType = 'flip'
  ) {
    super(
      queryName,
      shareFilter,
      summary as summaryFunction<any>,
      ensureArray(toValue(value)).map(v => unescapeText(v)),
      op,
      card => this.queryValue.props.flatMap(p => getValuesFromProp(card, p)),
      defaultOp,
      invertOption
    );
    this.summaryValue = value;
    this.queryValue = queryNameToValue(queryName);
  }
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(this.getValueToCompare(card), this.getOp(), this.value), this.inverted);
  toSummary = () =>
    `${this.summaryStart ? `${this.summaryStart} ` : ''}${(super.summary as any)(
      this.getOp(),
      this.summaryValue,
      this.inverted
    )}`;
}
export class NumberPropFilter<T, S extends numSearch> extends FilterObject<T, S> {
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

export class NoteFilter extends FilterObject<HCCard.Any, string> {
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
  toSummary = () => this.summary(this.getOp(), this.value, this.inverted, this.note);
  cardPassesFilter = (card: HCCard.Any) =>
    xor(this.filter(card, this.getOp(), unescapeText(this.value), this.note), this.inverted);
}
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
export class CardStringFilter extends FilterObject<HCCard.Any, string> {
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
