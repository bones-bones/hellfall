import { HCCard } from '@hellfall/shared/types';
import { cardStringFilter, opType, invertOptionType } from './types';
import { funcOp, opIsNegative, opToNot, opToDont, opToNt } from './filterUtils';
import {
  getColorsFromFaces,
  getFromAll,
  getFromFaces,
  textListEquals,
  textListIncludes,
  textListShares,
  toFaces,
  toNumber,
  canBeACommander,
  textListIncludesEvery,
} from '@hellfall/shared/utils';

const stateList = [
  'foil',
  'nonfoil',
  'commander',
  'phyrexian',
  'hybrid',
  'spell',
  'permanent',
  'historic',
  'party',
  'outlaw',
  'modal',
  'vanilla',
  'frenchvanilla',
  'bear',
  'manland',
  'partner',
  'masterpiece',
  'rebalanced',
  'bounceland',
  'fastland',
  'fetchland',
  'filterland',
  'painland',
  'pathway',
  'shockland',
  'snarl',
  'triome',
] as const;
type stateType = (typeof stateList)[number];
const equivStateNames: Record<string, stateType> = {
  alchemy: 'rebalanced',
  alchemyrebalanced: 'rebalanced',
  rebalance: 'rebalanced',
  alchemyrebalance: 'rebalanced',
  shadowland: 'snarl',
  tricycle: 'triome',
  trikeland: 'triome',
  creatureland: 'manland',
};
const stateResolutions: Record<stateType, (value: HCCard.Any) => boolean | undefined> = {
  foil: (value: HCCard.Any) => value.finish == 'foil',
  nonfoil: (value: HCCard.Any) => value.finish == 'nonfoil',
  commander: (value: HCCard.Any) => canBeACommander(value),
  phyrexian: (value: HCCard.Any) =>
    getFromFaces(value, 'mana_cost').some(cost => /\{H\//.test(cost)),
  hybrid: (value: HCCard.Any) =>
    getFromFaces(value, 'mana_cost').some(cost => /(?<!\{H)\//.test(cost)),
  spell: (value: HCCard.Any) =>
    value.tags?.includes('spell-land') ||
    toFaces(value).some(
      face =>
        textListShares(face.types, [
          'artifact',
          'battle',
          'creature',
          'enchantment',
          'instant',
          'planeswalker',
          'sorcery',
          'gleeporzob',
        ]) && !textListIncludes(face.types, 'land')
    ),
  permanent: (value: HCCard.Any) =>
    value.tags?.includes('spell-land') ||
    textListShares(getFromFaces(value, 'types'), [
      'artifact',
      'battle',
      'enchantment',
      'instant',
      'land',
      'planeswalker',
    ]),
  historic: (value: HCCard.Any) =>
    textListEquals(getFromFaces(value, 'supertypes'), 'legendary') ||
    textListEquals(getFromFaces(value, 'types'), 'artifact') ||
    textListEquals(getFromFaces(value, 'subtypes'), 'saga'),
  party: (value: HCCard.Any) =>
    textListShares(getFromFaces(value, 'subtypes'), ['cleric', 'rogue', 'warrior', 'wizard']),
  outlaw: (value: HCCard.Any) =>
    textListShares(getFromFaces(value, 'subtypes'), [
      'assassin',
      'goon',
      'mercenary',
      'pirate',
      'rogue',
      'warlock',
    ]),
  partner: (value: HCCard.Any) =>
    textListShares(value.tags, ['partner-mechanic', 'unprinted-partner']),
  modal: (value: HCCard.Any) =>
    value.tags?.includes('modal') ||
    textListIncludesEvery(getFromFaces(value, 'oracle_text'), ['•', 'choose']),
  vanilla: (value: HCCard.Any) => value.tags?.includes('vanilla'),
  frenchvanilla: (value: HCCard.Any) => value.tags?.includes('french-vanilla'),
  bear: (value: HCCard.Any) =>
    toFaces(value).some(
      face => toNumber(face.power) == 2 && toNumber(face.toughness) == 2 && face.mana_value == 2
    ),
  manland: (value: HCCard.Any) => value.tags?.includes('manland'),
  masterpiece: (value: HCCard.Any) => value.tags?.includes('masterpiece'),
  rebalanced: (value: HCCard.Any) => value.tags?.includes('alchemy-rebalance'),
  bounceland: (value: HCCard.Any) => value.tags?.includes('bounceland'),
  fastland: (value: HCCard.Any) => value.tags?.includes('fastland'),
  fetchland: (value: HCCard.Any) => value.tags?.includes('true-fetchland'),
  filterland: (value: HCCard.Any) => value.tags?.includes('filterland'),
  painland: (value: HCCard.Any) => value.tags?.includes('painland'),
  pathway: (value: HCCard.Any) => value.tags?.includes('pathway'),
  shockland: (value: HCCard.Any) => value.tags?.includes('shockland'),
  snarl: (value: HCCard.Any) => value.tags?.includes('snarl'),
  triome: (value: HCCard.Any) => value.tags?.includes('triome'),
};
const stateSummaries: Record<stateType, (operator: opType, value: string) => string> = {
  foil: (operator: opType, value: string) => `the card is ${opToNot(operator)} foil`,
  nonfoil: (operator: opType, value: string) => `the card is ${opToNot(operator)} nonfoil`,
  commander: (operator: opType, value: string) =>
    `the card can${opIsNegative(operator) ? "'t" : ''} be your commander`,
  phyrexian: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} have Phyrexian mana`,
  hybrid: (operator: opType, value: string) => `the cards ${opToDont(operator)} have hybrid mana`,
  spell: (operator: opType, value: string) => `the cards are${opToNt(operator)} spells`,
  permanent: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} become permanents`,
  historic: (operator: opType, value: string) => `the cards are${opToNt(operator)} historic`,
  party: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} Clerics, Rogues, Warriors, or Wizards`,
  outlaw: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} Assassins, Goons, Mercenaries, Pirates, Rogues, or Warlocks`,
  modal: (operator: opType, value: string) => `the cards ${opToDont(operator)} have modal effects`,
  vanilla: (operator: opType, value: string) => `the cards are${opToNt(operator)} vanilla`,
  frenchvanilla: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} French vanilla`,
  bear: (operator: opType, value: string) => `the cards are${opToNt(operator)} 2/2/2 bears`,
  manland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} lands that become creatures`,
  partner: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} have multi-commander mechanics`,
  masterpiece: (operator: opType, value: string) => `the cards are${opToNt(operator)} masterpieces`,
  rebalanced: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} rebalanced Alchemy cards`,
  bounceland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} land-bouncing duals`,
  fastland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands that are 'fast'`,
  fetchland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands that filter mana into other colors`,
  filterland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands that fetch lands from the library`,
  painland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands that damage you`,
  pathway: (operator: opType, value: string) => `the cards are${opToNt(operator)} Pathway duals`,
  shockland: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands that deal 2 damage to you`,
  snarl: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} dual lands from the snarl cycle`,
  triome: (operator: opType, value: string) => `the cards are${opToNt(operator)} triomes`,
};

const isList = ['draftpartner', 'token', 'tokenmaker', 'persistent'] as const;
type isType = (typeof isList)[number];
const equivIsNames: Record<string, isType> = {
  dp: 'draftpartner',
  dps: 'draftpartner',
  draftpartners: 'draftpartner',
  tokens: 'token',
  tm: 'tokenmaker',
  tms: 'tokenmaker',
  tokenmakers: 'tokenmaker',
  persistents: 'persistent',
  persistenttoken: 'persistent',
  persistenttokens: 'persistent',
};
const isResolutions: Record<isType, (value: HCCard.Any) => boolean | undefined> = {
  draftpartner: (value: HCCard.Any) => value.has_draft_partners && value.not_directly_draftable,
  token: (value: HCCard.Any) => value.all_parts?.some(part => part.component == 'token_maker'),
  tokenmaker: (value: HCCard.Any) => value.all_parts?.some(part => part.component == 'token'),
  persistent: (value: HCCard.Any) =>
    value.all_parts?.some(part => part.persistent) && !value.tags?.includes('persistent-tokens'),
};
const isSummaries: Record<isType, (operator: opType, value: string) => string> = {
  draftpartner: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} draftpartners`,
  token: (operator: opType, value: string) => `the cards are${opToNt(operator)} tokens`,
  tokenmaker: (operator: opType, value: string) => `the cards ${opToDont(operator)} make tokens`,
  persistent: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} make persistent tokens`,
};

const hasList = [
  'indicator',
  'frameeffect',
  'watermark',
  'draftpartner',
  'token',
  'tokenmaker',
  'persistent',
] as const;
type hasType = (typeof hasList)[number];
const equivHasNames: Record<string, hasType> = {
  fe: 'frameeffect',
  frameeffects: 'frameeffect',
  wm: 'watermark',
  dp: 'draftpartner',
  dps: 'draftpartner',
  draftpartners: 'draftpartner',
  tokens: 'token',
  tm: 'tokenmaker',
  tms: 'tokenmaker',
  tokenmakers: 'tokenmaker',
  persistents: 'persistent',
  persistenttoken: 'persistent',
  persistenttokens: 'persistent',
};
const hasResolutions: Record<hasType, (value: HCCard.Any) => boolean | undefined> = {
  indicator: (value: HCCard.Any) => Boolean(getColorsFromFaces(value, 'color_indicator').length),
  frameeffect: (value: HCCard.Any) => Boolean(getFromAll(value, 'frame_effects').length),
  watermark: (value: HCCard.Any) => Boolean(getFromFaces(value, 'watermark').length),
  draftpartner: (value: HCCard.Any) => value.has_draft_partners && !value.not_directly_draftable,
  token: (value: HCCard.Any) => value.all_parts?.some(part => part.component == 'token'),
  tokenmaker: (value: HCCard.Any) => value.all_parts?.some(part => part.component == 'token_maker'),
  persistent: (value: HCCard.Any) =>
    value.all_parts?.some(part => part.persistent) && value.tags?.includes('persistent-tokens'),
};
const hasSummaries: Record<hasType, (operator: opType, value: string) => string> = {
  indicator: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} have a color indicator`,
  frameeffect: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} have a frame effect`,
  watermark: (operator: opType, value: string) => `the cards ${opToDont(operator)} have watermarks`,
  draftpartner: (operator: opType, value: string) =>
    `the cards ${opToDont(operator)} hve draftpartners`,
  token: (operator: opType, value: string) => `the cards ${opToDont(operator)} make tokens`,
  tokenmaker: (operator: opType, value: string) => `the cards are${opToNt(operator)} tokens`,
  persistent: (operator: opType, value: string) =>
    `the cards are${opToNt(operator)} persistent tokens`,
};

export const filterIs: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const resolveIs = (criteria: string): boolean | undefined => {
      if (criteria in stateResolutions) {
        return stateResolutions[criteria as stateType](value1);
      }
      if (criteria in equivStateNames) {
        return stateResolutions[equivStateNames[criteria]](value1);
      }
      if (criteria in isResolutions) {
        return isResolutions[criteria as isType](value1);
      }
      if (criteria in equivIsNames) {
        return isResolutions[equivIsNames[criteria] as isType](value1);
      }
      return false;
    };
    return funcOp(operator, resolveIs, value2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      if (value in stateSummaries) {
        return stateSummaries[value as stateType](operator, value);
      }
      if (value in equivStateNames) {
        return stateSummaries[equivStateNames[value]](operator, value);
      }
      if (value in isSummaries) {
        return isSummaries[value as isType](operator, value);
      }
      if (value in equivIsNames) {
        return isSummaries[equivIsNames[value]](operator, value);
      }
      return `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`;
    },
  }
);
export const filterHas: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: opType, value2: string) => {
    const resolveHas = (criteria: string): boolean | undefined => {
      if (criteria in stateResolutions) {
        return stateResolutions[criteria as stateType](value1);
      }
      if (criteria in equivStateNames) {
        return stateResolutions[equivStateNames[criteria]](value1);
      }
      if (criteria in hasResolutions) {
        return hasResolutions[criteria as hasType](value1);
      }
      if (criteria in equivHasNames) {
        return hasResolutions[equivHasNames[criteria]](value1);
      }
      return false;
    };
    return funcOp(operator, resolveHas, value2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      if (value in stateSummaries) {
        return stateSummaries[value as stateType](operator, value);
      }
      if (value in equivStateNames) {
        return stateSummaries[equivStateNames[value]](operator, value);
      }
      if (value in hasSummaries) {
        return hasSummaries[value as hasType](operator, value);
      }
      if (value in equivHasNames) {
        return hasSummaries[equivHasNames[value]](operator, value);
      }
      return `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`;
    },
  }
);
