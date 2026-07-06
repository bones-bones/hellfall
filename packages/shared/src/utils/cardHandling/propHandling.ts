import {
  HCCard,
  anyMappedType,
  getAnyEntries,
  getFaceEntries,
  getRootEntries,
} from '@hellfall/shared/types';

/**
 * A properly typed version of calling `Object.entries()` on `HCCard.Any`
 * @param card The card to get the entries of
 */
export const getCardEntries = (card: HCCard.Any) => getAnyEntries(card as anyMappedType);

/**
 * A properly typed version of calling `Object.entries()` on `card.card_faces[index ?? 0]`
 * @param card The card to get the entries of
 * @param index the index of the face to get the entries of
 */
export const getCardFaceEntries = (card: HCCard.AnyMultiFaced, index?: number) =>
  getFaceEntries(card.card_faces[index ?? 0]);
/**
 * A properly typed version of calling `Object.entries()` on a card root
 * @param card The card to get the entries of
 */
export const getCardRootEntries = (card: HCCard.Any) => getRootEntries(card);

// export const getFilteredRootEntries = (card: HCCard.Any, propList: rootPropType[]) => (Object.entries(card) as rootEntriesType).filter(([key, value]) => propList.includes(key));

// export const getFilteredFaceEntries = (
//   card: HCCard.Any,
//   propList: facePropType[],
//   index?: number
// ) =>
//   (
//     Object.entries('card_faces' in card ? card.card_faces[index ?? 0] : card) as faceEntriesType
//   ).filter(([key, value]) => propList.includes(key));

// export const getFilteredRootProps = (card: HCCard.Any, propList: rootPropType[]) =>
//   (Object.keys(card) as rootPropType[]).filter(key => propList.includes(key));
// export const getFilteredFaceProps = (card: HCCard.Any, propList: facePropType[], index?: number) =>
//   (Object.keys('card_faces' in card ? card.card_faces[index ?? 0] : card) as facePropType[]).filter(
//     key => propList.includes(key)
//   );
