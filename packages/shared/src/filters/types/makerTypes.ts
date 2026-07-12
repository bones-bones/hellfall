import { HCCard } from '@hellfall/shared/types';
import {
  anyFilterFunction,
  cardFilterFunction,
  dirType,
  invertOptionType,
  looseOpType,
  opType,
  sortType,
  summaryFunction,
} from './filterTypes';

/**
 * A function that gets all the prints of a card
 */
export type allPrintsGetterType = (card: HCCard.Any) => HCCard.Any[];

/**
 * An interface for any filter
 */
export interface anyFilterInterface<T = any, S = any> {
  queryName: string;
  /**
   * The filter method to use
   */
  filter: anyFilterFunction<T, S>;
}

/**
 * An interface for a SortObject
 */
export interface sortInterface extends anyFilterInterface {
  /**
   * The query name
   */
  queryName: string;
  /**
   * The filter function to use
   */
  filter: anyFilterFunction;
  /**
   * The sort option
   */
  sort: sortType;
  /**
   * The sort direction option
   */
  dir: dirType;
}

/**
 * An interface for a FilterObject
 * @template T the type of the value from the card
 * @template S the type of the value from the search
 */
export interface filterInterface<T = any, S = any> extends anyFilterInterface {
  /**
   * The query name
   */
  queryName: string;
  /**
   * The filter function to use
   */
  filter: cardFilterFunction<T, S>;
  /**
   * The summary function to use
   */
  summary: summaryFunction<S>;
  /**
   * The value to filter against
   */
  value: S;
  /**
   * The operator to use. Can be loose (i.e. `:` or `!:`)
   */
  op: looseOpType;
  /**
   * The default operator; `:` will resolve to this, while `!:`
   * will resolve to the inverse of this (using {@linkcode invertOp})
   */
  defaultOp: opType;
  /**
   * Option that controls how `this.invert()` works
   *
   * `ignore:` do nothing
   *
   * `flip:` inverts the operator (using {@linkcode invertOp})
   *
   * `negate:` inverts `this.inverted`; if this option is chosen,
   * `this.summary` shoud accept and use the `invert` parameter
   */
  invertOption: invertOptionType;
  /**
   * Whether this object is inverted; only used if `this.invertOption: 'negate'`
   */
  inverted: boolean;
  /**
   * Whether to exclude faces with `drop_face: true` where appropriate
   */
  dropFaces: boolean;
  /**
   * The method to get the value to compare from a card
   * @param card card to get the value from
   */
  getValueToCompare: (card: HCCard.Any) => T;
  /**
   * Gets the current operator, resolving defaults appropriately
   */
  getOp: () => opType;
  /**
   * Inverts this filter object based on `this.invertOption`
   */
  invert: () => void;
  /**
   * Don't drop faces
   */
  keepFaces: () => void;
  /**
   * Checks if a card passes `this.filter`
   * @param card card to check
   */
  cardPassesFilter: (card: HCCard.Any) => boolean;
  /**
   * @returns the result of `this.summary(this.getOp(), this.value, this.inverted)`
   */
  toSummary: () => string;
}
