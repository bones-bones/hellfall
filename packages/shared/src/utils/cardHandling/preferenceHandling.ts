import {
  AtypicalFrameEffects,
  AtypicalFrames,
  faceType,
  HCCard,
  HCCardFace,
  SetType,
} from '@hellfall/shared/types';
import { dateSort } from './sortMethods';
import { createSortFunc, textListIncludes, textListsShare } from '../listHandling';
import { getSet } from '../setDateHandling';

/**
 * the list of preference options
 */
export const preferTypeList = [
  'none',
  'exotic',
  'newest',
  'oldest',
  'default',
  'atypical',
] as const;
/**
 * a preference option
 */
export type preferType = (typeof preferTypeList)[number];

const reverseDateSort = (value1: HCCard.Any, value2: HCCard.Any) => dateSort(value1, value2, -1);

const partIsAtypical = (part: HCCard.Any | HCCardFace.MultiFaced | faceType) =>
  textListIncludes(AtypicalFrames, part.frame) ||
  textListsShare(AtypicalFrameEffects, part.frame_effects);

/**
 * Checks whether a card isn't printed with standard frames and effects
 * @param card card to check
 */
export const cardIsAtypical = (card: HCCard.Any) =>
  partIsAtypical(card) || ('card_faces' in card && partIsAtypical(card.card_faces[0]));

/**
 * Checks whether a card is printed with standard frames and effects
 * @param card card to check
 */
export const cardIsDefault = (card: HCCard.Any) => !cardIsAtypical(card);

/**
 * Sorts two cards based on their atypicality
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
const atypicalSort = createSortFunc(cardIsDefault, dateSort);

const typicalSort = (value1: HCCard.Any, value2: HCCard.Any) => atypicalSort(value1, value2, -1);

const setTypeIsExtra = (setType?: SetType) =>
  setType && ![SetType.Land, SetType.Main, SetType.Side].includes(setType);

const outCube = (card: HCCard.Any) => setTypeIsExtra(getSet(card.set)?.set_type);

/**
 * Necessary props:
 */
/**
 * Sorts two cards by default
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
const defaultSort = createSortFunc(outCube, cardIsAtypical, dateSort);

const exoticSort = (value1: HCCard.Any, value2: HCCard.Any) => defaultSort(value1, value2, -1);

const preferToCompare: Record<preferType, (value1: HCCard.Any, value2: HCCard.Any) => number> = {
  none: defaultSort,
  exotic: exoticSort,
  newest: reverseDateSort,
  oldest: dateSort,
  atypical: atypicalSort,
  default: typicalSort,
};

/**
 * Gets the preferred version of a card based on a {@linkcode preferType}
 * @param cards all prints of the card
 * @param prefer preference option; defaults to none
 */
export const getPreference = (cards: HCCard.Any[], prefer?: preferType): HCCard.Any => {
  const compare = preferToCompare[prefer ?? 'none'];
  return cards.reduce((curr, next) => (compare(curr, next) < 0 ? curr : next));
};

/**
 * Determines whether to swap default ids
 * @param newCard the new card to check
 * @param oldCard the old card to check
 */
export const shouldSwap = (newCard: HCCard.Any, oldCard?: HCCard.Any): boolean => {
  if (!oldCard) {
    return true;
  }
  return defaultSort(newCard, oldCard) < 0;
};
