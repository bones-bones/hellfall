import { HCCard } from '@hellfall/shared/types';
import { cardStringFilter, opType, invertOptionType } from './types';
import { funcOp, opIsNegative, opToNot, opToDont } from './filterUtils';
import { canBeACommander } from '../canBeACommander';

export const filterIs: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const resolveIs = (criteria: string) => {
      switch (criteria) {
        case 'foil':
          return value1.finish == 'foil';
        case 'nonfoil':
          return value1.finish == 'nonfoil';
        case 'commander':
          return canBeACommander(value1);
      }
      return false;
    };
    return funcOp(operator, resolveIs, value2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      switch (value) {
        case 'foil':
          return `the card is ${opToNot(operator)} foil`;
        case 'nonfoil':
          return `the card is ${opToNot(operator)} nonfoil`;
        case 'commander':
          return `the card can${opIsNegative(operator) ? "'t" : ''} be your commander`;
      }
      return `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`;
    },
  }
);
export const filterHas: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const resolveHas = (criteria: string) => {
      switch (criteria) {
        case 'foil':
          return value1.finish == 'foil';
        case 'nonfoil':
          return value1.finish == 'nonfoil';
        case 'indicator':
          return Boolean(value1.toFaces().find(face => face.color_indicator));
        case 'frameeffect':
          return value1.toFaces().some(face => face.frame_effects) || Boolean(value1.frame_effects);
        case 'frameeffects':
          return value1.toFaces().some(face => face.frame_effects) || Boolean(value1.frame_effects);
      }
      return false;
    };
    return funcOp(operator, resolveHas, value2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      switch (value) {
        case 'foil':
          return `the card is ${opToNot(operator)} foil`;
        case 'nonfoil':
          return `the card is ${opToNot(operator)} nonfoil`;
        case 'indicator':
          return `the cards ${opToDont} have a color indicator`;
        case 'frameeffect':
          return `the cards ${opToDont} have a frame effect`;
        case 'frameeffects':
          return `the cards ${opToDont} have a frame effect`;
      }
      return `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`;
    },
  }
);
