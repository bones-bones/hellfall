import {
  ComparisonFilter,
  FilterObject,
  IncludeFilter,
  sortObject,
  PropConvertFilter,
  PropFilter,
  LegalityFilter,
} from './makerObject';
import { HCCard } from '@hellfall/shared/types';
import { colorSearch, dirType, looseOpType, sortType } from './filterTypes';

export type otherPrintGetterType = (card: HCCard.Any) => HCCard.Any[];

export type filterMaker<T> = (value: string, op: looseOpType) => FilterObject<T, any>;
export type printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => FilterObject<HCCard.Any[], string>;
export type stateFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => FilterObject<any, any>;
export type comparisonFilterMaker = (
  value1: string,
  op: looseOpType,
  value2: string
) => ComparisonFilter;
export type legalityFilterMaker = (value: string, op: looseOpType) => LegalityFilter;

export type includeFilterMaker = (value: string, op: looseOpType) => IncludeFilter;
export type propFilterMaker = (value: string, op: looseOpType) => PropFilter;
export type propConvertFilterMaker = (value: string, op: looseOpType) => PropConvertFilter;
export type colorFilterMaker<T> = (
  value: colorSearch,
  op: looseOpType
) => FilterObject<T, colorSearch>;
export type stringOrNumFilterMaker = (value: string, op: looseOpType) => FilterObject<any, string>;
export type sortMaker = (sort: sortType, dir: dirType) => sortObject;
