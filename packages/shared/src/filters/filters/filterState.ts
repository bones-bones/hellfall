import { HCCard } from '@hellfall/shared/types';
import { stateFilterFunction, opType } from '../types';
import {
  opIsNegative,
  opToNot,
  opToDont,
  opToNt,
  opAsBool,
  createCorrectedSummary,
} from '../utils';
import {
  unescapeText,
  getColorsFromFaces,
  getFromAll,
  getFromFaces,
  toFaces,
  toNumber,
  canBeACommander,
  textListsShare,
  textListIncludes,
  textListIncludesEvery,
} from '@hellfall/shared/utils';

const stateList = [
  'ruling',
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
  'reprint',
  'rebalanced',
  'bounceland',
  'dual',
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
export const isStateType = (value: any): value is stateType => stateList.includes(value);
const equivStateNames: Record<string, stateType> = {
  rulings: 'ruling',
  alchemy: 'rebalanced',
  alchemyrebalanced: 'rebalanced',
  rebalance: 'rebalanced',
  alchemyrebalance: 'rebalanced',
  ogdual: 'dual',
  shadowland: 'snarl',
  tricycle: 'triome',
  trikeland: 'triome',
  creatureland: 'manland',
};
const stateResolutions: Record<
  stateType,
  (value: HCCard.Any, dropFaces?: boolean) => boolean | undefined
> = {
  ruling: (value: HCCard.Any) => !!value.rulings,
  foil: (value: HCCard.Any) => value.finish == 'foil',
  nonfoil: (value: HCCard.Any) => value.finish == 'nonfoil',
  commander: (value: HCCard.Any) => canBeACommander(value),
  phyrexian: (value: HCCard.Any, dropFaces?: boolean) =>
    getFromFaces(value, 'mana_cost', dropFaces).some(cost => /\{H\//.test(cost)),
  hybrid: (value: HCCard.Any, dropFaces?: boolean) =>
    getFromFaces(value, 'mana_cost', dropFaces).some(cost => /(?<!\{H)\//.test(cost)),
  spell: (value: HCCard.Any, dropFaces?: boolean) =>
    value.tags?.includes('spell-land') ||
    toFaces(value, dropFaces).some(
      face =>
        textListsShare(face.types, [
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
  permanent: (value: HCCard.Any, dropFaces?: boolean) =>
    value.tags?.includes('spell-land') ||
    textListsShare(getFromFaces(value, 'types', dropFaces), [
      'artifact',
      'battle',
      'creature',
      'enchantment',
      'land',
      'planeswalker',
    ]),
  historic: (value: HCCard.Any, dropFaces?: boolean) =>
    textListIncludes(getFromFaces(value, 'supertypes', dropFaces), 'legendary') ||
    textListIncludes(getFromFaces(value, 'types', dropFaces), 'artifact') ||
    textListIncludes(getFromFaces(value, 'subtypes', dropFaces), 'saga'),
  party: (value: HCCard.Any, dropFaces?: boolean) =>
    textListsShare(getFromFaces(value, 'subtypes', dropFaces), [
      'cleric',
      'rogue',
      'warrior',
      'wizard',
    ]),
  outlaw: (value: HCCard.Any, dropFaces?: boolean) =>
    textListsShare(getFromFaces(value, 'subtypes', dropFaces), [
      'assassin',
      'goon',
      'mercenary',
      'pirate',
      'rogue',
      'warlock',
    ]),
  partner: (value: HCCard.Any) =>
    textListsShare(value.tags, ['partner-mechanic', 'unprinted-partner']),
  modal: (value: HCCard.Any, dropFaces?: boolean) =>
    value.tags?.includes('modal') ||
    textListIncludesEvery(getFromFaces(value, 'oracle_text', dropFaces), ['•', 'choose']),
  vanilla: (value: HCCard.Any) => value.tags?.includes('vanilla'),
  frenchvanilla: (value: HCCard.Any) => value.tags?.includes('french-vanilla'),
  bear: (value: HCCard.Any, dropFaces?: boolean) =>
    toFaces(value, dropFaces).some(
      face => toNumber(face.power) == 2 && toNumber(face.toughness) == 2 && face.mana_value == 2
    ),
  manland: (value: HCCard.Any) => value.tags?.includes('manland'),
  masterpiece: (value: HCCard.Any) => value.tags?.includes('masterpiece'),
  reprint: (value: HCCard.Any) => value.tags?.includes('reprint'),
  rebalanced: (value: HCCard.Any) => value.tags?.includes('alchemy-rebalance'),
  bounceland: (value: HCCard.Any) => value.tags?.includes('bounceland'),
  dual: (value: HCCard.Any) => value.tags?.includes('og-dual'),
  fastland: (value: HCCard.Any) => value.tags?.includes('fastland'),
  fetchland: (value: HCCard.Any) => value.tags?.includes('true-fetchland'),
  filterland: (value: HCCard.Any) => value.tags?.includes('filterland'),
  painland: (value: HCCard.Any) => value.tags?.includes('painland'),
  pathway: (value: HCCard.Any) => value.tags?.includes('pathway'),
  shockland: (value: HCCard.Any) => value.tags?.includes('shockland'),
  snarl: (value: HCCard.Any) => value.tags?.includes('snarl'),
  triome: (value: HCCard.Any) => value.tags?.includes('triome'),
};
const stateSummaries: Record<stateType, (operator: opType) => string> = {
  ruling: (operator: opType) => `the cards ${opToDont(operator)} have rulings`,
  foil: (operator: opType) => `the card is ${opToNot(operator)} foil`,
  nonfoil: (operator: opType) => `the card is ${opToNot(operator)} nonfoil`,
  commander: (operator: opType) =>
    `the card can${opIsNegative(operator) ? "'t" : ''} be your commander`,
  phyrexian: (operator: opType) => `the cards ${opToDont(operator)} have Phyrexian mana`,
  hybrid: (operator: opType) => `the cards ${opToDont(operator)} have hybrid mana`,
  spell: (operator: opType) => `the cards are${opToNt(operator)} spells`,
  permanent: (operator: opType) => `the cards ${opToDont(operator)} become permanents`,
  historic: (operator: opType) => `the cards are${opToNt(operator)} historic`,
  party: (operator: opType) =>
    `the cards are${opToNt(operator)} Clerics, Rogues, Warriors, or Wizards`,
  outlaw: (operator: opType) =>
    `the cards are${opToNt(operator)} Assassins, Goons, Mercenaries, Pirates, Rogues, or Warlocks`,
  modal: (operator: opType) => `the cards ${opToDont(operator)} have modal effects`,
  vanilla: (operator: opType) => `the cards are${opToNt(operator)} vanilla`,
  frenchvanilla: (operator: opType) => `the cards are${opToNt(operator)} French vanilla`,
  bear: (operator: opType) => `the cards are${opToNt(operator)} 2/2/2 bears`,
  manland: (operator: opType) => `the cards are${opToNt(operator)} lands that become creatures`,
  partner: (operator: opType) => `the cards ${opToDont(operator)} have multi-commander mechanics`,
  masterpiece: (operator: opType) => `the cards are${opToNt(operator)} masterpieces`,
  reprint: (operator: opType) => `the cards are${opToNt(operator)} reprints`,
  rebalanced: (operator: opType) => `the cards are${opToNt(operator)} rebalanced Alchemy cards`,
  dual: (operator: opType) => `the cards are${opToNt(operator)} dual lands`,
  bounceland: (operator: opType) => `the cards are${opToNt(operator)} land-bouncing duals`,
  fastland: (operator: opType) => `the cards are${opToNt(operator)} dual lands that are 'fast'`,
  fetchland: (operator: opType) =>
    `the cards are${opToNt(operator)} dual lands that filter mana into other colors`,
  filterland: (operator: opType) =>
    `the cards are${opToNt(operator)} dual lands that fetch lands from the library`,
  painland: (operator: opType) => `the cards are${opToNt(operator)} dual lands that damage you`,
  pathway: (operator: opType) => `the cards are${opToNt(operator)} Pathway duals`,
  shockland: (operator: opType) =>
    `the cards are${opToNt(operator)} dual lands that deal 2 damage to you`,
  snarl: (operator: opType) => `the cards are${opToNt(operator)} dual lands from the snarl cycle`,
  triome: (operator: opType) => `the cards are${opToNt(operator)} triomes`,
};

// const isList = ['persistent'] as const;
// type isType = (typeof isList)[number];
// export const isIsType = (value: any): value is isType => isList.includes(value);
// const equivIsNames: Record<string, isType> = {
// };
// const isResolutions: Record<isType, (value: HCCard.Any) => boolean | undefined> = {
//   // persistent: (value: HCCard.Any) => value.all_parts?.some(part => part.persistent) && !value.tags?.includes('persistent-tokens'),
// };
// const isSummaries: Record<isType, (operator: opType, value: string) => string> = {
//   persistent: (operator: opType, value: string) =>
//     `the cards ${opToDont(operator)} make persistent tokens`,
// };
const getIsName = (value: string): string | undefined =>
  equivStateNames[value] /* ?? equivIsNames[value] */ ??
  (isStateType(value) /* || isIsType(value) */ ? value : undefined);
/**
 * Checks to see if a card meets the given criterion
 * @param value1 card to check
 * @param operator operator to use
 * @param value2 criterion from the search
 * @param dropFaces whether to exclude faces with `drop_face: true` where appropriate
 */
export const isFilter: stateFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  dropFaces?: boolean
) =>
  opAsBool(
    (
      stateResolutions[getIsName(value2) as stateType] ??
      /* isResolutions[getIsName(value2) as isType] ?? */ (c => false)
    )(value1, dropFaces),
    operator
  );
/**
 * The summary for {@link isSummary}
 * @param operator the operator to use
 * @param value the criterion from the search
 * @param invert dummy
 */
export const isSummary = createCorrectedSummary(
  getIsName,
  (operator, value) =>
    stateSummaries[value as stateType](/*  ?? isSummaries[value as isType] */ operator),
  (operator, value) =>
    unescapeText(value) == 'funny'
      ? '!All hellscube cards are funny.'
      : `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`
);

const hasList = ['indicator', 'frameeffect', 'watermark'] as const;
type hasType = (typeof hasList)[number];
export const isHasType = (value: any): value is hasType => hasList.includes(value);
const equivHasNames: Record<string, hasType> = {
  fe: 'frameeffect',
  frameeffects: 'frameeffect',
  wm: 'watermark',
};
const hasResolutions: Record<
  hasType,
  (value: HCCard.Any, dropFaces?: boolean) => boolean | undefined
> = {
  indicator: (value: HCCard.Any, dropFaces?: boolean) =>
    Boolean(getColorsFromFaces(value, 'color_indicator', dropFaces).length),
  frameeffect: (value: HCCard.Any) => Boolean(getFromAll(value, 'frame_effects').length),
  watermark: (value: HCCard.Any) => Boolean(getFromFaces(value, 'watermark').length),
};
const hasSummaries: Record<hasType, (operator: opType) => string> = {
  indicator: (operator: opType) => `the cards ${opToDont(operator)} have a color indicator`,
  frameeffect: (operator: opType) => `the cards ${opToDont(operator)} have a frame effect`,
  watermark: (operator: opType) => `the cards ${opToDont(operator)} have watermarks`,
};

const getHasName = (value: string): string | undefined =>
  equivStateNames[value] ??
  equivHasNames[value] ??
  (isStateType(value) || isHasType(value) ? value : undefined);
/**
 * Checks to see if a card meets the given criterion
 * @param value1 card to check
 * @param operator operator to use
 * @param value2 criterion from the search
 * @param dropFaces whether to exclude faces with `drop_face: true` where appropriate
 */
export const hasFilter: stateFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  dropFaces?: boolean
) =>
  opAsBool(
    (
      stateResolutions[getIsName(value2) as stateType] ??
      hasResolutions[getHasName(value2) as hasType] ??
      (c => false)
    )(value1, dropFaces),
    operator
  );
/**
 * The summary for {@link hasSummary}
 * @param operator the operator to use
 * @param value the criterion from the search
 * @param invert dummy
 */
export const hasSummary = createCorrectedSummary(
  getIsName,
  (operator, value) =>
    (stateSummaries[value as stateType] ?? hasSummaries[value as hasType])(operator),
  (operator, value) =>
    unescapeText(value) == 'funny'
      ? '!All hellscube cards are funny.'
      : `!Checking if cards are ${opToNot(operator)} "${value}" is not supported`
);
