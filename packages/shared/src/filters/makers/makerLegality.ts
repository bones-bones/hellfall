import { HCLegalitiesField } from '@hellfall/shared/types';
import { filterObject, looseOpType, filterMaker } from '../types';
import {
  bannedFilter,
  bannedSummary,
  legalFilter,
  legalSummary,
  notLegalFilter,
  notLegalSummary,
} from '../filters';

export const makeLegalFilter: filterMaker<HCLegalitiesField> = (value: string, op: looseOpType) => {
  return new filterObject<HCLegalitiesField, string>(
    'legal',
    legalFilter,
    legalSummary,
    value,
    op,
    card => card.legalities
  );
};

export const makeBannedFilter: filterMaker<HCLegalitiesField> = (
  value: string,
  op: looseOpType
) => {
  return new filterObject<HCLegalitiesField, string>(
    'banned',
    bannedFilter,
    bannedSummary,
    value,
    op,
    card => card.legalities
  );
};

export const makeNotLegalFilter: filterMaker<HCLegalitiesField> = (
  value: string,
  op: looseOpType
) => {
  return new filterObject<HCLegalitiesField, string>(
    'notlegal',
    notLegalFilter,
    notLegalSummary,
    value,
    op,
    card => card.legalities
  );
};
