import {
  ComparisonFilter,
  filterObject,
  IncludeFilter,
  // PassThroughSummaryFilter,
  sortObject,
} from './makerObject';
import { HCCard } from '@hellfall/shared/types';
import { colorSearch, dirType, looseOpType, shorthandType, sortType } from './filterTypes';

export type otherPrintGetterType = (card: HCCard.Any) => HCCard.Any[];

export type filterMaker<T> = (value: string, op: looseOpType) => filterObject<T, string>;
export type printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => filterObject<HCCard.Any[], string>;
export type stateFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => filterObject<any, string>;
export type compFilterMaker = (value1: string, op: looseOpType, value2: string) => ComparisonFilter;
export type includeFilterMaker = (value: string, op: looseOpType) => IncludeFilter;
export type colorFilterMaker<T> = (
  value: colorSearch,
  op: looseOpType
) => filterObject<T, colorSearch>;
export type stringOrNumFilterMaker = (value: string, op: looseOpType) => filterObject<any, string>;
export type sortMaker = (sort: sortType, dir: dirType) => sortObject;
