import {
  CompFilter,
  filterObject,
  IncludeFilter,
  PassThroughSummaryFilter,
  sortObject,
} from './makerObject';
import { HCCard } from '@hellfall/shared/types';
import { dirType, looseOpType, shorthandType, sortType } from './filterTypes';

export type otherPrintGetterType = (card: HCCard.Any) => HCCard.Any[];

export type filterMaker = (value: string, op: looseOpType) => filterObject<any, string>;
export type printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => PassThroughSummaryFilter<HCCard.Any[], string>;
export type stateFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: otherPrintGetterType
) => filterObject<any, string>;
export type compFilterMaker = (value1: string, op: looseOpType, value2: string) => CompFilter;
export type includeFilterMaker = (value: string, op: looseOpType) => IncludeFilter;
export type colorFilterMaker = (
  value: string[] | number | shorthandType,
  op: looseOpType
) => filterObject<any, string[]> | filterObject<any, number> | filterObject<any, shorthandType>;
export type stringOrNumFilterMaker = (value: string, op: looseOpType) => filterObject<any, string>;
export type sortMaker = (sort: sortType, dir: dirType) => sortObject;
