import {
  attractionLightsAreValid,
  faceElementValueType,
  faceValueType,
  HCCard,
  isBorderColor,
  isCardFace,
  isColors,
  isFinish,
  isFrame,
  isFrameEffect,
  isImageStatus,
  isLayout,
  isLegalitiesField,
  isRarity,
  isRelatedCard,
  partPropType,
  rootElementValueType,
  rootValueType,
} from '@hellfall/shared/types';
import {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeType,
  faceChange,
  faceChangeableProps,
  faceChangeablePropType,
  isChangeLocation,
  isChangeType,
  isNoListChangeType,
  rootChange,
  rootChangeableProps,
  rootChangeablePropType,
  tagChange,
} from './changeTypes';
import { arbAreEqual, listShare, splitFullTag, textEquals, toFaces } from '@hellfall/shared/utils';

// const imageProps = [
//   'image',
//   'rotated_image',
//   'still_image',
//   'print_image',
//   'rotated_print_image',
//   'still_print_image',
// ];
// const boolProps = [
//   'id_is_scryfall',
//   'oracle_id_is_scryfall',
//   'not_directly_draftable',
//   'has_draft_partners',
//   'compress_face',
//   'drop_face',
// ];

const isArtistArray = (value: any): value is [string, string] =>
  Array.isArray(value) &&
  value.length == 2 &&
  typeof value[0] == 'string' &&
  typeof value[1] == 'string';

export const isRootChangePropType = <T extends changeType>(
  change_type: T,
  value: any
): value is rootChangeablePropType<T> =>
  (rootChangeableProps[change_type] as any).includes(value as any);

export const rootValueErrorMessage = <T extends changeType, K extends rootChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: rootValueType<K>,
  comparingNew?: boolean
) => {
  if (change_type == 'delete') {
    return value == undefined && currentValue != undefined
      ? undefined
      : `invalid change for change_type == 'delete': ${
          value != undefined ? `value == ${JSON.stringify(value)}, but it must be undefined` : ''
        }${value != undefined && currentValue == undefined ? ', and ' : ''}${
          currentValue == undefined ? `currentValue == undefined, but it cannot be undefined` : ''
        }`;
  }
  if (value == undefined) {
    return `invalid change for change_type == '${change_type}': value == undefined, but it cannot be undefined`;
  }
  if (arbAreEqual(value, currentValue, true)) {
    return `invalid change: value is equal to currentValue: value == ${JSON.stringify(value)}`;
  }
  switch (prop) {
    case 'colors':
      return isColors(value)
        ? undefined
        : `invalid change: ${JSON.stringify(value)} is not a valid list of colors`;
    case 'legalities':
      return isLegalitiesField(value)
        ? undefined
        : `invalid change: ${JSON.stringify(value)} is not a valid legalities object`;
    case 'id_is_scryfall':
    case 'oracle_id_is_scryfall':
    case 'not_directly_draftable':
    case 'has_draft_partners':
      return value === true ? undefined : `invalid change for prop == '${prop}': ${value} !== true`;
    case 'image':
    case 'rotated_image':
    case 'still_image':
    case 'print_image':
    case 'rotated_print_image':
    case 'still_print_image':
      return typeof value == 'string' && value.startsWith('https://')
        ? undefined
        : `invalid change for prop == '${prop}': ${value} is not a valid url`;
    case 'mana_value':
      return typeof value == 'number'
        ? undefined
        : `invalid change for mana value: ${value} is not a number`;
    case 'rarity':
      return isRarity(value) ? undefined : `invalid change: ${value} is not a rarity`;
    case 'layout':
      // TODO: more complex validation for layouts
      return isLayout(value) ? undefined : `invalid change: ${value} is not a layout`;
    case 'finish':
      return isFinish(value) ? undefined : `invalid change: ${value} is not a finish`;
    case 'border_color':
      return isBorderColor(value) ? undefined : `invalid change: ${value} is not a border color`;
    case 'frame':
      return isFrame(value) ? undefined : `invalid change: ${value} is not a rarity`;
    case 'image_status':
    case 'print_image_status':
      return isImageStatus(value)
        ? undefined
        : `invalid change for prop == '${prop}': ${value} is not an image status`;
    case 'artist_notes': {
      if (!isArtistArray(value)) {
        return `invalid change: ${value} is not a valid artist array`;
      }
      return (currentValue as Record<string, string>)[value[0]] !== value[1]
        ? undefined
        : `invalid change: artist note is equal to current one: '${value[1]}'`;
      // return (
      //   // (change_type == 'push' ? value[1] : undefined)
      // );
    }
    case 'frame_effects': {
      if (!isFrameEffect(value)) {
        return `invalid change: ${value} is not a frame`;
      }
      if (
        listShare(currentValue as string[], value) ==
        (change_type == 'pop' && !comparingNew ? true : false)
      ) {
        return;
      } else {
        return `invalid change for prop == ${prop}: ${value} is ${
          change_type == 'pop' && !comparingNew ? 'not ' : ''
        }included in currentValue: ${JSON.stringify(currentValue ?? [])}`;
      }
    }
    case 'keywords':
    case 'creators':
    case 'artists': {
      if (typeof value != 'string') {
        return `invalid change for prop == ${prop}: ${value} is not a string`;
      }
      if (
        listShare(currentValue as string[], value) ==
        (change_type == 'pop' && !comparingNew ? true : false)
      ) {
        return;
      } else {
        return `invalid change for prop == ${prop}: ${value} is ${
          change_type == 'pop' && !comparingNew ? 'not ' : ''
        }included in currentValue: ${JSON.stringify(currentValue ?? [])}`;
      }
    }
  }
  return typeof value == 'string'
    ? undefined
    : `invalid change for prop == ${prop}: ${value} is not a string`;
};
export const isRootChangeValueType = <T extends changeType, K extends rootChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: rootValueType<K>,
  comparingNew?: boolean
): value is rootElementValueType<K> =>
  !rootValueErrorMessage(change_type, prop, value, currentValue, comparingNew);

export const rootChangeErrorMessage = (card: HCCard.Any, value: any) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as rootChange<changeType, rootChangeablePropType<changeType>>;
  if (change.location != 'root') {
    return `invalid change: location == '${change.location}', which does not equal 'root'`;
  }
  if (!isChangeType(change.change_type)) {
    return `invalid change: change_type == '${change.change_type}', which is invalid`;
  }
  if (!isRootChangePropType(change.change_type, change.prop)) {
    return `invalid change: prop == '${change.prop}', which is invalid for a location of 'root' and a change_type of '${change.change_type}'`;
  }
  return rootValueErrorMessage(change.change_type, change.prop, change.value, card[change.prop]);
};

export const rootChangeIsValid = (
  card: HCCard.Any,
  value: any
): value is rootChange<changeType, rootChangeablePropType<changeType>> =>
  !rootChangeErrorMessage(card, value);

const isStringArray = (value: any): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v == 'string');

export const isFaceChangePropType = <T extends changeType>(
  change_type: T,
  value: any
): value is faceChangeablePropType<T> =>
  (faceChangeableProps[change_type] as any).includes(value as any);

export const faceValueErrorMessage = <T extends changeType, K extends faceChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: faceValueType<K>,
  comparingNew?: boolean
) => {
  if (change_type == 'delete') {
    return value == undefined && currentValue != undefined
      ? undefined
      : `invalid change for change_type == 'delete': ${
          value != undefined ? `value == ${JSON.stringify(value)}, but it must be undefined` : ''
        }${value != undefined && currentValue == undefined ? ', and ' : ''}${
          currentValue == undefined ? `currentValue == undefined, but it cannot be undefined` : ''
        }`;
  }
  if (value == undefined) {
    return `invalid change for change_type == '${change_type}': value == undefined, but it cannot be undefined`;
  }
  const shouldCheckOrder = ['supertypes', 'types', 'subtypes'].includes(prop);
  if (arbAreEqual(value, currentValue, !shouldCheckOrder)) {
    return `invalid change: value is equal to currentValue: value == ${JSON.stringify(value)}`;
  }
  switch (prop) {
    case 'colors':
    case 'color_indicator':
      return isColors(value)
        ? undefined
        : `invalid change: ${JSON.stringify(value)} is not a valid list of colors`;
    case 'compress_face':
    case 'drop_face':
      return value === true ? undefined : `invalid change for prop == '${prop}': ${value} !== true`;
    case 'image':
    case 'rotated_image':
    case 'still_image':
      return typeof value == 'string' && value.startsWith('https://')
        ? undefined
        : `invalid change for prop == '${prop}': ${value} is not a valid url`;
    case 'mana_value':
      return typeof value == 'number'
        ? undefined
        : `invalid change for mana value: ${value} is not a number`;
    case 'attraction_lights':
      return attractionLightsAreValid(value)
        ? undefined
        : `invalid change: ${JSON.stringify(value)} is not a valid attraction light list`;
    case 'layout':
      // TODO: more complex validation for layouts
      return isLayout(value) ? undefined : `invalid change: ${value} is not a layout`;
    case 'finish':
      return isFinish(value) ? undefined : `invalid change: ${value} is not a finish`;
    case 'border_color':
      return isBorderColor(value) ? undefined : `invalid change: ${value} is not a border color`;
    case 'frame':
      return isFrame(value) ? undefined : `invalid change: ${value} is not a rarity`;
    case 'image_status':
      return isImageStatus(value)
        ? undefined
        : `invalid change for prop == '${prop}': ${value} is not an image status`;
    case 'supertypes':
    case 'types':
    case 'subtypes':
      return isStringArray(value)
        ? undefined
        : `invalid change for prop == '${prop}': ${JSON.stringify(
            value
          )} is not an array of strings`;
    case 'frame_effects':
      if (!isFrameEffect(value)) {
        return `invalid change: ${value} is not a frame`;
      }
      if (
        listShare(currentValue as string[], value) ==
        (change_type == 'pop' && !comparingNew ? true : false)
      ) {
        return;
      } else {
        return `invalid change for prop == ${prop}: ${value} is ${
          change_type == 'pop' && !comparingNew ? 'not ' : ''
        }included in currentValue: ${JSON.stringify(currentValue ?? [])}`;
      }
  }
  return typeof value == 'string'
    ? undefined
    : `invalid change for prop == ${prop}: ${value} is not a string`;
};

export const isFaceChangeValueType = <T extends changeType, K extends faceChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: faceValueType<K>,
  comparingNew?: boolean
): value is faceElementValueType<K> =>
  !faceValueErrorMessage(change_type, prop, value, currentValue, comparingNew);

export const faceChangeErrorMessage = (card: HCCard.Any, value: any) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as faceChange<changeType, faceChangeablePropType<changeType>>;
  if (change.location != 'face') {
    return `invalid change: location == '${change.location}', which does not equal 'face'`;
  }
  if (!isChangeType(change.change_type)) {
    return `invalid change: change_type == '${change.change_type}', which is invalid`;
  }
  if (!isFaceChangePropType(change.change_type, change.prop)) {
    return `invalid change: prop == '${change.prop}', which is invalid for a location of 'root' and a change_type of '${change.change_type}'`;
  }
  if (change.index != undefined) {
    if (!Number.isInteger(change.index)) {
      return `invalid change: index == ${change.index}, but it must be either an integer or undefined`;
    }
    if (change.index < 0) {
      return `invalid change: index == ${change.index}, but it must be nonnegative`;
    }
    if ('card_faces' in card) {
      if (change.index >= card.card_faces.length) {
        return `invalid change: index == ${change.index}, but it must be less than the number of faces, ${card.card_faces.length}`;
      }
    } else if (change.index !== 0) {
      return `invalid change: index == ${change.index}, but it must be 0 or undefined`;
    }
  }
  return faceValueErrorMessage(
    change.change_type,
    change.prop,
    change.value,
    toFaces(card)[change.index ?? 0][change.prop],
    false
  );
};

export const faceChangeIsValid = (
  card: HCCard.Any,
  value: any
): value is faceChange<changeType, faceChangeablePropType<changeType>> =>
  !faceChangeErrorMessage(card, value);

export const cardFacesChangeErrorMessage = (card: HCCard.Any, value: any) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as cardFacesChange;
  if (change.location != 'card_faces') {
    return `invalid change: location == '${change.location}', which does not equal 'card_faces'`;
  }
  if (!isNoListChangeType(change.change_type)) {
    return `invalid change: change_type == '${change.change_type}', which is invalid`;
  }
  // if (typeof change.index != 'number') {
  //   return false;
  // }
  if ('card_faces' in card) {
    if (!Number.isInteger(change.index)) {
      return `invalid change: index == ${change.index}, but it must be an integer`;
    }
    if (change.index < 0) {
      return `invalid change: index == ${change.index}, but it must be nonnegative`;
    }
    if (change.change_type == 'add') {
      if (change.index > card.card_faces.length) {
        return `invalid change: index == ${change.index}, but it must be less than or equal to the number of faces, ${card.card_faces.length}`;
      }
    } else {
      if (change.index > card.card_faces.length) {
        return `invalid change: index == ${change.index}, but it must be less than the number of faces, ${card.card_faces.length}`;
      }
    }
  } else {
    if (change.change_type == 'delete') {
      return `invalid change: cannot delete only remaining face`;
    }
    if (![0, 1].includes(change.index)) {
      return `invalid change: cannot insert a new face except at 0 or 1`;
    }
  }
  if (change.change_type == 'delete') {
    return change.face
      ? `invalid change for change_type == 'delete': face must be undefined`
      : undefined;
  }
  return isCardFace(change.face)
    ? undefined
    : `invalid change: card face is invalid: ${JSON.stringify(change.face)}`;
};

// TODO: Make sure this properly handles when multiple card faces are being added
export const cardFacesChangeIsValid = (card: HCCard.Any, value: any): value is cardFacesChange =>
  !cardFacesChangeErrorMessage(card, value);

export const partCheckProps: partPropType[] = [
  'component',
  'is_draft_partner',
  'count',
  'persistent',
];

export const getPartChangeIndex = (
  card: HCCard.Any,
  change: allPartsChange
): number | undefined => {
  switch (change.change_type) {
    case 'add': {
      if (!change.related) return undefined;
      const part_prop = change.related.id ? 'id' : change.related.hcid ? 'hcid' : 'name';
      const index = card.all_parts?.findIndex(part => {
        switch (part_prop) {
          case 'id':
            return part.id == change.related!.id;
          case 'hcid':
            return textEquals(part.hcid, change.related!.hcid);
          case 'name':
            return (
              textEquals(part.name, change.related!.name) &&
              part.hcid.replace(/\d+$/, '') != change.related!.name
            );
        }
        return false;
      });
      return index == -1 ? undefined : index;
    }

    case 'delete': {
      const index = card.all_parts?.findIndex(part => part[change.part_prop ?? 'id'] == change.id);
      return index == -1 ? undefined : index;
    }
  }
};
export const allPartsChangeErrorMessage = (card: HCCard.Any, value: any, index?: number) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as allPartsChange;
  if (change.location != 'all_parts') {
    return `invalid change: location == '${change.location}', which does not equal 'all_parts'`;
  }
  if (!isNoListChangeType(change.change_type)) {
    return `invalid change: change_type == '${change.change_type}', which is invalid`;
  }
  if (index == undefined) {
    index = getPartChangeIndex(card, change);
  }
  switch (change.change_type) {
    case 'add': {
      if (!isRelatedCard(change.related)) {
        return `invalid change: related card is invalid: ${JSON.stringify(change.related)}`;
      }
      if (index == undefined) return;
      for (const prop of partCheckProps) {
        if (
          card.all_parts![index][prop] != change.related[prop] &&
          !(change.no_blank && change.related[prop] === '')
        )
          return;
      }
      return `invalid change: related card doesn't change anything: ${JSON.stringify(
        change.related
      )}`;
    }
    case 'delete':
      return index == undefined
        ? `invalid change: can't delete a nonexistent related card`
        : undefined;
  }
};

export const allPartsChangeIsValid = (
  card: HCCard.Any,
  value: any,
  index?: number
): value is allPartsChange => !allPartsChangeErrorMessage(card, value, index);

export const tagChangeErrorMessage = (card: HCCard.Any, value: any) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as tagChange;
  if (change.location != 'tag') {
    return `invalid change: location == '${change.location}', which does not equal 'tag'`;
  }
  if (typeof change.full_tag != 'string') {
    return `invalid change: missing or invalid full_tag`;
  }
  if (change.tag && typeof change.tag != 'string') {
    return `invalid change: invalid tag`;
  }
  if (change.note && typeof change.note != 'string') {
    return `invalid change: invalid note`;
  }
  if (!isNoListChangeType(change.change_type)) {
    return `invalid change: change_type == '${change.change_type}', which is invalid`;
  }
  if (change.change_type == 'add') {
    if (card.base_tags?.includes(change.full_tag)) {
      return `invalid change: ${change.full_tag} is already included in base_tags: ${JSON.stringify(
        card.base_tags ?? []
      )}`;
    }
  } else {
    if (card.base_tags?.includes(change.full_tag)) {
      return;
    }
    if (
      card.base_tags &&
      change.tag &&
      card.base_tags.some(full_tag => splitFullTag(full_tag).tag == change.tag)
    ) {
      return `invalid change: ${change.full_tag} is not included in base_tags: ${JSON.stringify(
        card.base_tags ?? []
      )}`;
    }
  }
};

export const tagChangeIsValid = (card: HCCard.Any, value: any): value is tagChange =>
  !tagChangeErrorMessage(card, value);

export const changeErrorMessage = (card: HCCard.Any, value: any) => {
  if (typeof value != 'object') {
    return `invalid change: change isn't an object`;
  }
  const change = value as anyChange;
  if (!isChangeLocation(change.location)) {
    return `invalid change: ${change.location} is not a valid location`;
  }
  switch (change.location) {
    case 'root':
      return rootChangeErrorMessage(card, change);
    case 'face':
      return faceChangeErrorMessage(card, change);
    case 'card_faces':
      return cardFacesChangeErrorMessage(card, change);
    case 'all_parts':
      return allPartsChangeErrorMessage(card, change);
    case 'tag':
      return tagChangeErrorMessage(card, change);
  }
};

export const changeIsValid = (card: HCCard.Any, value: any): value is anyChange =>
  !changeErrorMessage(card, value);
