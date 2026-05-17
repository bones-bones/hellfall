import { HCCard, HCCardFace, HCColors } from '../types';
import {
  allPropType,
  allType,
  allValueType,
  arrayElementType,
  bothPropType,
  bothType,
  bothValueType,
  colorPropType,
  faceArrayElementType,
  facePropType,
  faceValueType,
  propType,
  valueType,
} from './propTypes';

/**
 * Converts the card to an array of its faces.
 * For single-faced cards, returns an array with the card itself.
 * For multi-faced cards, returns the card_faces array.
 * 
 * Make sure you only try to work with props that exist on both `HCCard.AnySingleFaced` and `HCCardFace.MultiFaced`.
 * @param card card to get the faces of
 * @returns
 */
export const toFaces = (card: HCCard.Any): bothType[] => {
  if ('card_faces' in card) {
    return card.card_faces as bothType[];
  }
  return [card] as bothType[];
};

const asArray = <T>(value: T) => {};

/**
 * Gets the value of a prop from each face of a card (excluding the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of (must be a prop that exists on both `HCCard.AnySingleFaced` and `HCCardFace.MultiFaced`)
 * @returns
 */
export const getFromFaces = <K extends bothPropType>(
  card: HCCard.Any,
  prop: K
): bothValueType<K>[] =>
  toFaces(card).flatMap(face =>
    Array.isArray(face[prop]) ? face[prop] : [face[prop] ?? []].flat()
  );

/**
 * Gets the value of a prop from each face of a card without flattening it (excluding the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of (must be a prop that exists on both `HCCard.Any` and `HCCardFace.MultiFaced`)
 * @returns
 */
export const getColorsFromFaces = (card: HCCard.Any, prop: colorPropType): HCColors[] =>
  toFaces(card).flatMap(face => [face[prop] ?? []]);

/**
 * Gets the value of a prop from each face of a card (including the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of
 * @returns
 */

export const getFromAll = <K extends allPropType>(card: HCCard.Any, prop: K): allValueType<K>[] => [
  ...('card_faces' in card ? (Array.isArray(card[prop]) ? card[prop] : [card[prop] ?? []]) : []),
  ...getFromFaces(card, prop),
];
