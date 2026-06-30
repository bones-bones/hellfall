import { allPropType, HCCard } from '@hellfall/shared/types';
import { CardMap, getAllRelated } from '../cardHandling';
import { setDerivedProps } from '../cardModification/derivedProps';
import { cleanParts, updateParts } from '../cardModification/partsHandling';
import { anyChange } from './changeTypes';
import { changeErrorMessage, changeIsValid } from './changeValidation';
import { applyChange } from './changeApply';
import { getChangesFromDifferences } from './getCardDiff';

// commented out = currently done automatically via tags, but could concievable be done manually in the future

const multiIgnoreDeleteProps: allPropType[] = ['image', 'frame', 'frame_effects'];
const multiIgnoreAddProps: allPropType[] = ['image_status'];

export const changeTypeOrder = ['delete', 'pop', 'add', 'push'];
// export const locationOrder = ['tag', 'card_faces', 'all_parts', 'face', 'root'];
export const locationOrder = ['tag', 'card_faces', 'all_parts', 'root', 'face'];

export const sortChanges = (a: anyChange, b: anyChange): number =>
  locationOrder.indexOf(a.location) - locationOrder.indexOf(b.location) ||
  changeTypeOrder.indexOf(a.change_type) - changeTypeOrder.indexOf(b.change_type);

export const applyChanges = (
  card: HCCard.Any,
  changeList: anyChange[],
  applyingFromSheet?: boolean
  // applyingMode: 'sheet'|'server'|'client'='client'
): boolean => {
  let setDerived = false;
  changeList.forEach((change, index) => {
    if (!(changeIsValid(card, change) as boolean)) {
      // bool cast is necessary for proper error handling
      if (
        !('card_faces' in card) &&
        change.location == 'face' &&
        !change.index &&
        changeList
          .slice(0, index)
          .some(
            other =>
              other.location == 'root' &&
              other.change_type == change.change_type &&
              other.prop == change.prop &&
              other.value == change.value
          )
      ) {
        return;
      }
      if (
        change.location == 'root' &&
        change.prop == 'artist_notes' &&
        change.change_type == 'pop' &&
        changeList.some(
          other =>
            other.location == 'root' &&
            other.change_type == change.change_type &&
            other.prop == 'artists' &&
            other.value == (change.value as [string, string])[0]
        )
      ) {
        return;
      }
      if (
        'card_faces' in card &&
        change.location == 'face' &&
        !change.index &&
        (change.change_type == 'delete' || change.change_type == 'pop'
          ? multiIgnoreDeleteProps
          : multiIgnoreAddProps
        ).includes(change.prop as allPropType) &&
        changeList.some(other => other.location == 'card_faces')
      ) {
        return;
      }
      if (applyingFromSheet) {
        throw new Error(changeErrorMessage(card, change));
      } else {
        console.error(changeErrorMessage(card, change));
        return;
      }
    }
    if (applyChange(card, change)) {
      setDerived = true;
    }
    if (change.location == 'card_faces' && !applyingFromSheet) {
      const face = change.index;
      for (let i = changeList.length - 1; i > index; i--) {
        const otherChange = changeList[i];
        if (
          otherChange.location == 'root' ||
          otherChange.location == 'all_parts' ||
          otherChange.location == 'tag' ||
          otherChange.index == undefined
        )
          continue;
        if (change.change_type == 'delete' && otherChange.index == face) {
          changeList.splice(i, 1);
          continue;
        }
        if (otherChange.index >= face) {
          otherChange.index += change.change_type == 'delete' ? -1 : 1;
        }
      }
    }
  });
  return setDerived;
};

/**
 * Merges an existing card and a card from the google sheet
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
export const mergeFromSheet = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  const changeList = getChangesFromDifferences(existingCard, newCard, true);
  if (newCard.kind != 'scryfall') {
    applyChanges(existingCard, changeList, true);
    setDerivedProps(existingCard);
  } else {
    newCard.all_parts = existingCard.all_parts;
    setDerivedProps(newCard);
    return newCard;
  }
  // if (newCard.base_tags) {
  //   existingCard.base_tags = newCard.base_tags;
  // } else {
  //   delete existingCard.base_tags;
  // }
  return existingCard;
};
/**
 * Updates a card along with its related cards
 * @param existingCard The card from the card map
 * @returns
 */
export const applyFromMap = (card: HCCard.Any, changeList: anyChange[], cardMap: CardMap) => {
  const oldRelateds = getAllRelated(card, cardMap);
  if (!applyChanges(card, changeList)) return;
  const newRelateds = getAllRelated(card, cardMap);
  setDerivedProps(card);
  updateParts(card, newRelateds);
  cleanParts(card, oldRelateds);
};
