import {
  ComparisonFilter,
  FilterObject,
  IncludeFilter,
  SortObject,
  PropConvertFilter,
  PropFilter,
  LegalityFilter,
  StateFilter,
  InFilter,
  PrintsNumberFilter,
  ColorFilter,
  NumberPropFilter,
  NoteFilter,
} from './makerObject';
import { colorSearch, dirType, looseOpType, sortType, allPrintsGetterType } from '../types';

/**
 * A function that creates a {@linkcode FilterObject<T, any>}
 * @template T The type of the value from the card
 * @param value the value from the search
 * @param op the operator from the search
 */
export type filterMaker<T> = (value: string, op: looseOpType) => FilterObject<T, any>;
/**
 * A function that can create an {@linkcode InFilter} or a {@linkcode PrintsNumberFilter}
 * @param value the value from the search
 * @param op the operator from the search
 * @param getAllPrints A function that gets all the prints of a card
 */
export type printsFilterMaker = (
  value: string,
  op: looseOpType,
  getAllPrints: allPrintsGetterType
) => InFilter | PrintsNumberFilter;
/**
 * A function that can create a {@linkcode StateFilter} or a {@linkcode PropConvertFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type stateFilterMaker = (
  value: string,
  op: looseOpType
) => StateFilter | PropConvertFilter<any>;
/**
 * A function that creates a {@linkcode ComparisonFilter}
 * @param value1 the first value from the search
 * @param op the operator from the search
 * @param value2 the second value from the search
 */
export type comparisonFilterMaker = (
  value1: string,
  op: looseOpType,
  value2: string
) => ComparisonFilter;
/**
 * A function that creates a {@linkcode LegalityFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type legalityFilterMaker = (value: string, op: looseOpType) => LegalityFilter;
/**
 * A function that creates an {@linkcode IncludeFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type includeFilterMaker = (value: string, op: looseOpType) => IncludeFilter;
/**
 * A function that creates a {@linkcode PropFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type propFilterMaker = (value: string, op: looseOpType) => PropFilter;
/**
 * A function that creates a {@linkcode PropConvertFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type propConvertFilterMaker = (value: string, op: looseOpType) => PropConvertFilter<any>;
/**
 * A function that creates a {@linkcode NumberPropFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type numberPropFilterMaker = (value: string, op: looseOpType) => NumberPropFilter;
/**
 * A function that creates a {@linkcode ColorFilter}
 * @param T The type of the value from the card
 * @param value the value from the search
 * @param op the operator from the search
 */
export type colorFilterMaker<T extends string[] | string[][]> = (
  value: colorSearch,
  op: looseOpType
) => ColorFilter<T>;
/**
 * A function that can create a {@linkcode NumberPropFilter}, a {@linkcode NoteFilter}, or a {@linkcode PropFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export type stringOrNumFilterMaker = (
  value: string,
  op: looseOpType
) => NumberPropFilter | NoteFilter | PropFilter;
/**
 * A function that creates a {@linkcode SortObject}
 * @param sort the sort option from the search
 * @param dir the sort direction option from the search
 */
export type sortMaker = (sort: sortType, dir: dirType) => SortObject;
