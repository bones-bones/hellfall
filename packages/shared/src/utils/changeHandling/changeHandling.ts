import { allPropType, HCCard } from '@hellfall/shared/types';
import { anyChange } from './changeTypes';
import { changeErrorMessage, changeIsValid } from './changeValidation';
import { applyChange } from './changeApply';
import { arbAreEqual } from '../listHandling';

const isChangeLike = (value: unknown): value is anyChange =>
  value != null && typeof value === 'object' && 'location' in value && 'change_type' in value;

/** Coerce stored/API change payloads into a change array (handles legacy single-object shapes). */
export const normalizeChangeList = (changes: unknown): anyChange[] => {
  const normalizeChange = (change: anyChange): anyChange => {
    if (change.location === 'tag' && !change.full_tag && typeof change.tag === 'string') {
      return { ...change, full_tag: change.tag };
    }
    return change;
  };

  if (Array.isArray(changes)) {
    return changes.filter(isChangeLike).map(normalizeChange);
  }
  if (isChangeLike(changes)) {
    return [normalizeChange(changes)];
  }
  if (changes != null && typeof changes === 'object') {
    const parsed = Object.values(changes as Record<string, unknown>)
      .filter(isChangeLike)
      .map(normalizeChange);
    if (parsed.length) return parsed;
  }
  return [];
};

// commented out = currently done automatically via tags, but could concievable be done manually in the future

const multiIgnoreDeleteProps: allPropType[] = ['image', 'frame', 'frame_effects'];
const multiIgnoreAddProps: allPropType[] = ['image_status'];

export const removeDuplicateChanges = (changeList: anyChange[]) => {
  for (let i = changeList.length - 1; i >= 0; i--) {
    if (changeList.slice(0, i).some(change => arbAreEqual(change, changeList[i]))) {
      changeList.splice(i, 1);
    }
  }
};

/**
 * Apply a change
 * @param card card to apply the changes to
 * @param changeList changes to apply to the card
 * @param applyingFromSheet whether the changes are coming from the google sheet (also whether to throw errors or just log them)
 * @returns whether the changes caused props to need to be rederived
 */
export const applyChanges = (
  card: HCCard.Any,
  changeList: anyChange[] | unknown,
  applyingFromSheet?: boolean
  // applyingMode: 'sheet'|'server'|'client'='client'
): boolean => {
  const changes = Array.isArray(changeList) ? changeList : normalizeChangeList(changeList);
  let setDerived = false;
  changes.forEach((change, index) => {
    if (!(changeIsValid(card, change) as boolean)) {
      // bool cast is necessary for proper error handling
      if (
        !('card_faces' in card) &&
        change.location == 'face' &&
        !change.index &&
        changes
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
        change.change_type == 'delete' &&
        changes.some(
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
        (change.change_type == 'delete' ? multiIgnoreDeleteProps : multiIgnoreAddProps).includes(
          change.prop as allPropType
        ) &&
        changes.some(other => other.location == 'card_faces')
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
      for (let i = changes.length - 1; i > index; i--) {
        const otherChange = changes[i];
        if (
          otherChange.location == 'root' ||
          otherChange.location == 'all_parts' ||
          otherChange.location == 'tag' ||
          otherChange.index == undefined
        )
          continue;
        if (change.change_type == 'delete' && otherChange.index == face) {
          changes.splice(i, 1);
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
