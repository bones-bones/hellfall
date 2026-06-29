import { facePropType, HCCard, rootPropType } from '@hellfall/shared/types';
import {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeType,
  faceChange,
  faceChangeablePropType,
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

export const applyRootChange = (
  card: HCCard.Any,
  change: rootChange<changeType, rootChangeablePropType<changeType>>
): boolean => {
  switch (change.change_type) {
    case 'add': {
      addPropToRoot(card, change.prop, change.value!);
      break;
    }
    case 'push': {
      if (Array.isArray(change.value)) {
        const [artist, note] = change.value;
        if (!card.artists?.includes(artist)) {
          pushPropToRoot(card, 'artists', artist);
        }
        addPropToRecord(card, 'artist_notes', artist, note);
        break;
      }
      pushPropToRoot(card, change.prop, change.value!);
      break;
    }
    case 'delete':
      deletePropFromRoot(card, change.prop);
      break;
    case 'pop':
      if (Array.isArray(change.value)) {
        const [artist, note] = change.value;
        deletePropFromRecord(card, 'artist_notes', artist);
        break;
      }
      if (change.prop == 'artists') {
        deletePropFromRecord(card, 'artist_notes', change.value as string);
      }
      popPropFromRoot(card, change.prop, change.value!);
      if (change.prop == 'frame_effects' && !card.frame_effects?.length) {
        deletePropFromRoot(card, change.prop);
      }
      break;
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

export const applyFaceChange = (
  card: HCCard.Any,
  change: faceChange<changeType, faceChangeablePropType<changeType>>
): boolean => {
  switch (change.change_type) {
    case 'add': {
      addPropToFace(card, change.prop, change.value!, change.index);
      break;
    }
    case 'push': {
      pushPropToFace(card, change.prop, change.value!, change.index);
      break;
    }
    case 'delete':
      deletePropFromFace(card, change.prop, change.index);
      break;
    case 'pop':
      popPropFromFace(card, change.prop, change.value!, change.index);
      if (
        change.prop == 'frame_effects' &&
        !toFaces(card)[change.index ?? 0].frame_effects?.length
      ) {
        deletePropFromFace(card, change.prop, change.index);
      }
      break;
  }
  return faceDeriveProps.includes(change.prop);
};

export const applyCardFacesChange = (card: HCCard.Any, change: cardFacesChange): boolean => {
  if (change.change_type == 'delete') {
    if (!('card_faces' in card)) {
      throw console.error('Tried to delete a nonexistent face');
    }
    card.card_faces.splice(change.index, 1);
    if (card.card_faces.length == 1) {
      toSingleFaced(card);
    }
  } else {
    if (!change.face) {
      throw console.error('Tried to add a nonexistent face');
    }
    if (!('card_faces' in card)) {
      toMultiFaced(card);
    }
    // if (!('card_faces' in card)) {
    //   throw console.error('Something went very, very wrong')
    // }
    (card as HCCard.AnyMultiFaced).card_faces.splice(change.index, 0, change.face);
  }
  return true;
};

export const applyAllPartsChange = (card: HCCard.Any, change: allPartsChange): boolean => {
  // TODO: make sure the new part gets pulled correctly and gets added to the other card correctly after doing this
  if (change.change_type == 'delete') {
    const index = card.all_parts?.findIndex(part => part[change.part_prop ?? 'id'] == change.id);
    if (index == undefined || index == -1) {
      throw console.error('Tried to delete a nonexistent part');
    }
    card.all_parts?.splice(index, 1);
  } else if (!change.related) {
    throw console.error('Tried to add a nonexistent part');
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
 * Returns true if the change can affect derived props
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
