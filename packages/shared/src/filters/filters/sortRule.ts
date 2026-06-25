import { HCCard, HCColor, HCKind, allSetsList } from '@hellfall/shared/types';
import {
  dirType,
  invertOptionType,
  looseOpType,
  NOPRINT,
  opType,
  sortFilter,
  sortType,
} from '../types';

const colorSortValue: Record<HCColor, number> = {
  W: 1,
  U: 10,
  B: 100,
  R: 1000,
  G: 10_000,
  P: 100_000,
  C: 1_000_000,
  Yellow: 10_000_000,
  Brown: 10_000_000,
  Pink: 10_000_000,
  Teal: 10_000_000,
  Orange: 10_000_000,
  TEMU: 10_000_000,
  Cyan: 10_000_000,
  Ultraviolet: 10_000_000,
  Gold: 10_000_000,
  Beige: 10_000_000,
  Grey: 10_000_000,
  Lime: 10_000_000,
};
const toColorNumber = (card: HCCard.Any) =>
  card.colors.map(color => colorSortValue[color]).reduce((total, curr) => total + curr, 0) ||
  colorSortValue['C'];

const toTokenNumber = (card: HCCard.Any) => parseInt(card.hcid.replace(card.name, ''));

export const filterSort: sortFilter = Object.assign(
  function (this: sortFilter, value1: HCCard.Any, operator: looseOpType, value2: HCCard.Any) {
    const dirMult = this.dir == 'desc' ? -1 : 1;
    switch (this.sort) {
      case 'color':
        return (toColorNumber(value1) - toColorNumber(value2)) * dirMult;
      case 'manavalue':
        return (value1.mana_value - value2.mana_value) * dirMult;
      case 'auto':
      case 'colormanavalue': {
        const color = (toColorNumber(value1) - toColorNumber(value2)) * dirMult;
        if (color) {
          return color;
        }
        return (value1.mana_value - value2.mana_value) * dirMult;
      }
      case 'number': {
        if (!value1.collector_number && !value2.collector_number) {
          if (parseInt(value1.hcid) == parseInt(value2.hcid)) {
            return (value1.hcid.charCodeAt(-1) - value2.hcid.charCodeAt(-1)) * dirMult;
          }
          return (parseInt(value1.hcid) - parseInt(value2.hcid)) * dirMult;
        }
        if ('collector_number' in value1 != 'collector_number' in value2) {
          return 'collector_number' in value1 ? -dirMult : dirMult;
        }
        return (parseInt(value1.collector_number!) - parseInt(value2.collector_number!)) * dirMult;
      }
      case 'id': {
        if (value1.kind != value2.kind) {
          return Object.values(HCKind).indexOf(value1.kind);
        }
        if (value1.kind == 'card' && value2.kind == 'card') {
          return (parseInt(value1.hcid) - parseInt(value2.hcid)) * dirMult;
        }

        if ((value1.kind == 'token' || value2.kind == 'token') && value1.kind != value2.kind) {
          return value1.kind == 'token' ? -dirMult : dirMult;
        }
        if (value1.name == value2.name) {
          return (toTokenNumber(value1) - toTokenNumber(value2)) * dirMult;
        }
        return value1.hcid < value2.hcid ? -dirMult : dirMult;
      }
      case 'name': {
        if (value1.name == value2.name) {
          return 0;
        }
        return value1.name < value2.name ? -dirMult : dirMult;
      }
      case 'set':
        return (allSetsList.indexOf(value1.set) - allSetsList.indexOf(value2.set)) * dirMult;
      case 'setnumber': {
        const set = (allSetsList.indexOf(value1.set) - allSetsList.indexOf(value2.set)) * dirMult;
        if (!set) {
          if (!value1.collector_number && !value2.collector_number) {
            if (parseInt(value1.id) == parseInt(value2.id)) {
              return (value1.id.charCodeAt(-1) - value2.id.charCodeAt(-1)) * dirMult;
            }
            return (parseInt(value1.id) - parseInt(value2.id)) * dirMult;
          }
          if ('collector_number' in value1 != 'collector_number' in value2) {
            return 'collector_number' in value1 ? -dirMult : dirMult;
          }
          return (
            (parseInt(value1.collector_number!) - parseInt(value2.collector_number!)) * dirMult
          );
        } else {
          return set;
        }
      }
    }
    return 0; // just in case
  },
  {
    invertOption: 'ignore' as invertOptionType,
    sort: 'id' as sortType,
    dir: 'asc' as dirType,
    toSummary: (operator: opType, value: HCCard.Any) => NOPRINT,
  }
);
