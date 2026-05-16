import { HCCard } from '@hellfall/shared/types';
import { cardStringFilter, opType, invertOptionType } from './types';
import { funcOp, opIsNegative, opToNot, opToDont, opToNt } from './filterUtils';
import { canBeACommander } from '../canBeACommander';
import { textListEquals, textListShares } from '@hellfall/shared/utils';

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
        case 'phyrexian':
          return value1
            .toFaces()
            .map(face => face.mana_cost)
            .some(cost => /\{H\//.test(cost));
        case 'hybrid':
          return value1
            .toFaces()
            .map(face => face.mana_cost)
            .some(cost => /(?<!\{H)\//.test(cost));
        case 'historic':
          return (
            textListEquals(
              value1.toFaces().flatMap(face => face.supertypes ?? []),
              'legendary'
            ) ||
            textListEquals(
              value1.toFaces().flatMap(face => face.types ?? []),
              'artifact'
            ) ||
            textListEquals(
              value1.toFaces().flatMap(face => face.subtypes ?? []),
              'saga'
            )
          );
        case 'party':
          return textListShares(
            value1.toFaces().flatMap(face => face.subtypes ?? []),
            ['cleric', 'rogue', 'warrior', 'wizard']
          );
        case 'outlaw':
          return textListShares(
            value1.toFaces().flatMap(face => face.subtypes ?? []),
            ['assassin', 'goon', 'mercenary', 'pirate', 'rogue', 'warlock']
          );
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
        case 'phyrexian':
          return `the cards ${opToDont(operator)} have Phyrexian mana`;
        case 'hybrid':
          return `the cards ${opToDont(operator)} have hybrid mana`;
        case 'historic':
          return `the cards are${opToNt(operator)} historic`;
        case 'party':
          return `the cards are${opToNt(operator)} Clerics, Rogues, Warriors, or Wizards`;
        case 'outlaw':
          return `the cards are${opToNt(
            operator
          )} Assassins, Goons, Mercenaries, Pirates, Rogues, or Warlocks`;
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
        case 'frameeffects':
          return value1.toFaces().some(face => face.frame_effects) || Boolean(value1.frame_effects);
        case 'watermark':
        case 'wm':
          return value1.toFaces().some(face => face.watermark);
        case 'phyrexian':
          return value1
            .toFaces()
            .map(face => face.mana_cost)
            .some(cost => /\{H\//.test(cost));
        case 'hybrid':
          return value1
            .toFaces()
            .map(face => face.mana_cost)
            .some(cost => /(?<!\{H)\//.test(cost));
        case 'historic':
          return (
            textListEquals(
              value1.toFaces().flatMap(face => face.supertypes ?? []),
              'legendary'
            ) ||
            textListEquals(
              value1.toFaces().flatMap(face => face.types ?? []),
              'artifact'
            ) ||
            textListEquals(
              value1.toFaces().flatMap(face => face.subtypes ?? []),
              'saga'
            )
          );
        case 'party':
          return textListShares(
            value1.toFaces().flatMap(face => face.subtypes ?? []),
            ['cleric', 'rogue', 'warrior', 'wizard']
          );
        case 'outlaw':
          return textListShares(
            value1.toFaces().flatMap(face => face.subtypes ?? []),
            ['assassin', 'goon', 'mercenary', 'pirate', 'rogue', 'warlock']
          );
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
        case 'frameeffects':
          return `the cards ${opToDont} have a frame effect`;
        case 'phyrexian':
          return `the cards ${opToDont(operator)} have Phyrexian mana`;
        case 'hybrid':
          return `the cards ${opToDont(operator)} have hybrid mana`;
        case 'historic':
          return `the cards are${opToNt(operator)} historic`;
        case 'party':
          return `the cards are${opToNt(operator)} Clerics, Rogues, Warriors, or Wizards`;
        case 'outlaw':
          return `the cards are${opToNt(
            operator
          )} Assassins, Goons, Mercenaries, Pirates, Rogues, or Warlocks`;
      }
      return `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`;
    },
  }
);
