import { facePropType, HCCard, rootPropType, rootValueType } from '@hellfall/shared/types';
import {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeType,
  faceChange,
  faceChangeablePropType,
  isFaceArrayChange,
  isRootArrayChange,
  rootChange,
  rootChangeablePropType,
  tagChange,
} from './changeTypes';
import {
  addPropToRecord,
  deletePropFromRecord,
  toFaces,
  toMultiFaced,
  toSingleFaced,
  addPropToFace,
  addPropToRoot,
  deletePropFromFace,
  deletePropFromRoot,
  popPropFromFace,
  popPropFromRoot,
  pushPropToFace,
  pushPropToRoot,
} from '@hellfall/shared/utils';
import { partCheckProps } from './changeValidation';
import { addTagToBase, deleteTagFromBase, splitFullTag } from './tagHandling';

const rootDeriveProps: rootPropType[] = [];

/**
 * Apply a root change
 * @param card card to apply the root change to
 * @param change root change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyRootChange = (
  card: HCCard.Any,
  change: rootChange<changeType, rootChangeablePropType<changeType>>
): boolean => {
  if (change.change_type == 'add') {
    if (!isRootArrayChange(change)) {
      addPropToRoot(card, change.prop, change.value!);
    } else if (Array.isArray(change.value)) {
      const [artist, note] = change.value;
      if (!card.artists?.includes(artist)) {
        pushPropToRoot(card, 'artists', artist);
      }
      addPropToRecord(card, 'artist_notes', artist, note);
    } else {
      pushPropToRoot(card, change.prop, change.value!);
    }
  } else {
    if (!isRootArrayChange(change)) {
      deletePropFromRoot(card, change.prop);
    } else if (Array.isArray(change.value)) {
      const [artist, note] = change.value;
      deletePropFromRecord(card, 'artist_notes', artist);
      if (card.artist_notes && !Object.keys(card.artist_notes).length) {
        deletePropFromRoot(card, 'artist_notes');
      }
    } else {
      popPropFromRoot(card, change.prop, change.value!);
      if (change.prop == 'frame_effects' && !card.frame_effects?.length) {
        deletePropFromRoot(card, change.prop);
      }
    }
  }
  return rootDeriveProps.includes(change.prop);
};

const faceDeriveProps: facePropType[] = [
  'mana_cost',
  'oracle_text',
  'color_indicator',
  'supertypes',
  'types',
  'subtypes',
];

/**
 * Apply a face change
 * @param card card to apply the face change to
 * @param change face change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyFaceChange = (
  card: HCCard.Any,
  change: faceChange<changeType, faceChangeablePropType<changeType>>
): boolean => {
  if (change.change_type == 'add') {
    if (!isFaceArrayChange(change)) {
      addPropToFace(card, change.prop, change.value!, change.index);
    } else {
      pushPropToFace(card, change.prop, change.value!, change.index);
    }
  } else {
    if (!isFaceArrayChange(change)) {
      deletePropFromFace(card, change.prop, change.index);
    } else {
      popPropFromFace(card, change.prop, change.value!, change.index);
      if (
        change.prop == 'frame_effects' &&
        !toFaces(card)[change.index ?? 0].frame_effects?.length
      ) {
        deletePropFromFace(card, change.prop, change.index);
      }
    }
  }
  return faceDeriveProps.includes(change.prop);
};

/**
 * Apply a card_faces change
 * @param card card to apply the card_faces change to
 * @param change card_faces change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyCardFacesChange = (card: HCCard.Any, change: cardFacesChange): boolean => {
  if (change.change_type == 'delete') {
    if (!('card_faces' in card)) {
      console.error('Tried to delete a nonexistent face');
      return false;
    }
    card.card_faces.splice(change.index, 1);
    if (card.card_faces.length == 1) {
      toSingleFaced(card);
    }
  } else {
    if (!change.face) {
      console.error('Tried to add a nonexistent face');
      return false;
    }
    if (!('card_faces' in card)) {
      toMultiFaced(card);
    }
    // if (!('card_faces' in card)) {
    //   console.error('Something went very, very wrong');
    //   return false;
    // }
    (card as HCCard.AnyMultiFaced).card_faces.splice(change.index, 0, change.face);
  }
  return true;
};

/**
 * Apply an all_parts change
 * @param card card to apply the all_parts change to
 * @param change all_parts change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyAllPartsChange = (card: HCCard.Any, change: allPartsChange): boolean => {
  // TODO: make sure the new part gets pulled correctly and gets added to the other card correctly after doing this
  if (change.change_type == 'delete') {
    const index = card.all_parts?.findIndex(part => part[change.part_prop ?? 'id'] == change.id);
    if (index == undefined || index == -1) {
      console.error('Tried to delete a nonexistent part');
      return false;
    }
    card.all_parts?.splice(index, 1);
  } else if (!change.related) {
    console.error('Tried to add a nonexistent part');
    return false;
  } else {
    const part_prop = change.related.id ? 'id' : change.related.hcid ? 'hcid' : 'name';
    const part = card.all_parts?.find(part => part[part_prop] == change.related![part_prop]);
    if (!part) {
      pushPropToRoot(card, 'all_parts', change.related);
    } else {
      partCheckProps.forEach(prop => {
        if (part[prop] == change.related![prop]) return;
        if (change.related![prop] == undefined) {
          delete part[prop];
        } else {
          (part as any)[prop] = change.related![prop];
        }
      });
    }
  }
  return true;
};

/**
 * Apply a tag change
 * @param card card to apply the tag change to
 * @param change tag change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyTagChange = (card: HCCard.Any, change: tagChange) => {
  if (change.change_type == 'add') {
    if (card.base_tags) {
      addTagToBase(card.base_tags, change.full_tag);
    } else {
      card.base_tags = [change.full_tag];
    }
    const tag = change.tag ?? change.full_tag;
    if (!card.tags) {
      card.tags = [tag];
    } else if (!card.tags.includes(tag)) {
      card.tags.push(tag);
    }
    if (!change.note) return true;
    if (!card.tag_notes?.[tag]) {
      addPropToRecord(card, 'tag_notes', tag, change.note);
    }
  } else {
    if (card.base_tags) {
      deleteTagFromBase(card.base_tags, change.full_tag);
    }
    const tag = change.tag ?? change.full_tag;
    if (card.tags && !card.base_tags?.some(fullTag => splitFullTag(fullTag).tag == tag)) {
      const index = card.tags.indexOf(tag);
      if (index != undefined && index != -1) {
        card.tags.splice(index, 1);
      }
    }
    const note = card.tag_notes?.[tag];
    if (note && !card.base_tags?.some(fullTag => splitFullTag(fullTag).note == note)) {
      delete card.tag_notes![tag];
      if (!Object.keys(card.tag_notes!).length) {
        delete card.tag_notes;
      }
    }
  }
  return true;
};

/**
 * Apply a change
 * @param card card to apply the change to
 * @param change change to apply to the card
 * @returns whether the change could cause props to need to be rederived
 */
export const applyChange = (card: HCCard.Any, change: anyChange): boolean => {
  switch (change.location) {
    case 'root':
      return applyRootChange(card, change);
    case 'face':
      return applyFaceChange(card, change);
    case 'card_faces':
      return applyCardFacesChange(card, change);
    case 'all_parts':
      return applyAllPartsChange(card, change);
    case 'tag':
      return applyTagChange(card, change);
  }
};
