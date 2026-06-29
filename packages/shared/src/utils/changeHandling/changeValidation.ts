import {
  faceElementValueType,
  facePropType,
  faceValueType,
  getFaceEntries,
  HCCard,
  HCCardFace,
  HCColors,
  HCLegalitiesField,
  HCObject,
  HCRelatedCard,
  isBorderColor,
  isColor,
  isColors,
  isFinish,
  isFrame,
  isFrameEffect,
  isImageStatus,
  isLayout,
  isLegalitiesField,
  isRarity,
  partPropType,
  rootElementValueType,
  rootPropType,
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
  isChangeType,
  isNoListChangeType,
  rootChange,
  rootChangeableProps,
  rootChangeablePropType,
  tagChange,
} from './changeTypes';
import {
  arbAreEqual,
  listEquals,
  listsExactlyEqual,
  listShare,
  textEquals,
  toFaces,
} from '@hellfall/shared/utils';

const imageProps = [
  'image',
  'rotated_image',
  'still_image',
  'print_image',
  'rotated_print_image',
  'still_print_image',
];
const boolProps = [
  'id_is_scryfall',
  'oracle_id_is_scryfall',
  'not_directly_draftable',
  'has_draft_partners',
  'compress_face',
  'drop_face',
];

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
export const isRootChangeValueType = <T extends changeType, K extends rootChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: rootValueType<K>
): value is rootElementValueType<K> => {
  if (change_type == 'delete') {
    return value == undefined && currentValue != undefined;
  }
  if (value == undefined) {
    return false;
  }
  if (arbAreEqual(value, currentValue, true)) {
    return false;
  }
  switch (prop) {
    case 'colors':
      return isColors(value);
    case 'legalities':
      return isLegalitiesField(value);
    case 'id_is_scryfall':
    case 'oracle_id_is_scryfall':
    case 'not_directly_draftable':
    case 'has_draft_partners':
      return value === true;
    case 'image':
    case 'rotated_image':
    case 'still_image':
    case 'print_image':
    case 'rotated_print_image':
    case 'still_print_image':
      return typeof value == 'string' && value.startsWith('https://');
    case 'mana_value':
      return typeof value == 'number';
    case 'rarity':
      return isRarity(value);
    case 'layout':
      // TODO: more complex validation for layouts
      return isLayout(value);
    case 'finish':
      return isFinish(value);
    case 'border_color':
      return isBorderColor(value);
    case 'frame':
      return isFrame(value);
    case 'image_status':
    case 'print_image_status':
      return isImageStatus(value);
    case 'artist_notes': {
      if (!isArtistArray(value)) {
        return false;
      }
      return (
        (currentValue as Record<string, string>)[value[0]] !==
        (change_type == 'push' ? value[1] : undefined)
      );
    }
    case 'frame_effects':
      return (
        isFrameEffect(value) &&
        !!listShare(currentValue as string[], value) == (change_type == 'pop' ? true : false)
      );
    case 'keywords':
    case 'creators':
    case 'artists':
      return (
        typeof value == 'string' &&
        !!listShare(currentValue as string[], value) == (change_type == 'pop' ? true : false)
      );
  }
  return typeof value == 'string';
};

export const rootChangeIsValid = (
  card: HCCard.Any,
  value: any
): value is rootChange<changeType, rootChangeablePropType<changeType>> => {
  if (typeof value != 'object') return false;
  const change = value as rootChange<changeType, rootChangeablePropType<changeType>>;
  if (change.location != 'root') {
    return false;
  }
  if (!isChangeType(change.change_type)) {
    return false;
  }
  if (!isRootChangePropType(change.change_type, change.prop)) {
    return false;
  }
  if (!isRootChangeValueType(change.change_type, change.prop, change.value, card[change.prop])) {
    return false;
  }
  return true;
};
const attractionLightsAreValid = (lights: number[]) => {
  const lightList: number[] = [];
  for (const light of lights) {
    if (lightList.includes(light) || !Number.isInteger(light) || light < 1 || light > 6) {
      return false;
    } else {
      lightList.push(light);
    }
  }
  return true;
};
const isStringArray = (value: any): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v == 'string');

export const isFaceChangePropType = <T extends changeType>(
  change_type: T,
  value: any
): value is faceChangeablePropType<T> =>
  (faceChangeableProps[change_type] as any).includes(value as any);

export const isFaceChangeValueType = <T extends changeType, K extends faceChangeablePropType<T>>(
  change_type: T,
  prop: K,
  value: any,
  currentValue?: faceValueType<K>
): value is faceElementValueType<K> => {
  if (change_type == 'delete') {
    return value == undefined && currentValue != undefined;
  }
  if (value == undefined) {
    return false;
  }
  const shouldCheckOrder = ['supertypes', 'types', 'subtypes'].includes(prop);
  if (arbAreEqual(value, currentValue, !shouldCheckOrder)) {
    return false;
  }
  switch (prop) {
    case 'colors':
    case 'color_indicator':
      return isColors(value);
    case 'compress_face':
    case 'drop_face':
      return value === true;
    case 'image':
    case 'rotated_image':
    case 'still_image':
      return typeof value == 'string' && value.startsWith('https://');
    case 'mana_value':
      return typeof value == 'number';
    case 'attraction_lights':
      return attractionLightsAreValid(value);
    case 'layout':
      // TODO: more complex validation for layouts
      return isLayout(value);
    case 'finish':
      return isFinish(value);
    case 'border_color':
      return isBorderColor(value);
    case 'frame':
      return isFrame(value);
    case 'image_status':
      return isImageStatus(value);
    case 'supertypes':
    case 'types':
    case 'subtypes':
      return isStringArray(value);
    case 'frame_effects':
      return (
        isFrameEffect(value) &&
        !!listShare(currentValue as string[], value) == (change_type == 'pop' ? true : false)
      );
  }
  return typeof value == 'string';
};

export const faceChangeIsValid = (
  card: HCCard.Any,
  value: any
): value is faceChange<changeType, faceChangeablePropType<changeType>> => {
  if (typeof value != 'object') return false;
  const change = value as faceChange<changeType, faceChangeablePropType<changeType>>;
  if (change.location != 'face') {
    return false;
  }
  if (!isChangeType(change.change_type)) {
    return false;
  }
  if (!isFaceChangePropType(change.change_type, change.prop)) {
    return false;
  }
  if ('card_faces' in card) {
    if (
      change.index != undefined &&
      (!Number.isInteger(change.index) ||
        change.index < 0 ||
        change.index >= card.card_faces.length)
    ) {
      return false;
    }
  } else if (change.index /* != undefined */) {
    return false;
  }
  if (
    !isFaceChangeValueType(
      change.change_type,
      change.prop,
      change.value,
      toFaces(card)[change.index ?? 0][change.prop]
    )
  ) {
    return false;
  }
  return true;
};

export const isCardFace = (value: any): value is HCCardFace.MultiFaced => {
  if (typeof value != 'object') return false;
  const face = value as HCCardFace.MultiFaced;
  if (
    !getFaceEntries(face).every(([prop, value]) => {
      switch (prop) {
        case 'object':
          return value == HCObject.ObjectType.CardFace;
        case 'layout':
          return isLayout(value);
        case 'image_status':
          return isImageStatus(value);
        case 'image':
          return value.startsWith('https://');
        case 'mana_value':
          return typeof value == 'number';
        case 'attraction_lights':
          return attractionLightsAreValid(value);
        case 'colors':
        case 'color_indicator':
          return isColors(value);
        case 'supertypes':
        case 'types':
        case 'subtypes':
          return Array.isArray(value) && value.every(v => typeof v == 'string');
        case 'frame':
          return isFrame(value);
        case 'border_color':
          return isBorderColor(value);
        case 'frame_effects':
          return Array.isArray(value) && value.every(v => isFrameEffect(v));
      }
      return (
        [
          'name',
          'mana_cost',
          'oracle_text',
          'flavor_text',
          'power',
          'toughness',
          'loyalty',
          'defense',
          'hand_modifier',
          'life_modifier',
          'type_line',
        ].includes(prop) && typeof prop == 'string'
      );
    })
  ) {
    return false;
  }
  return [
    'object',
    'layout',
    'name',
    'mana_cost',
    'mana_value',
    'type_line',
    'oracle_text',
    'colors',
  ].every(prop => face[prop as facePropType] != undefined);
};

export const cardFacesChangeIsValid = (card: HCCard.Any, value: any): value is cardFacesChange => {
  // TODO: Make sure this properly handles when multiple card faces are being added
  if (typeof value != 'object') return false;
  const change = value as cardFacesChange;
  if (change.location != 'card_faces') {
    return false;
  }
  if (!isNoListChangeType(change.change_type)) {
    return false;
  }
  // if (typeof change.index != 'number') {
  //   return false;
  // }

  if (
    !('card_faces' in card) &&
    (change.change_type == 'delete' || ![0, 1].includes(change.index))
  ) {
    return false;
  }
  if (
    'card_faces' in card &&
    (change.index == undefined ||
      !Number.isInteger(change.index) ||
      change.index < 0 ||
      change.index > card.card_faces.length ||
      (change.index == card.card_faces.length && change.change_type == 'delete'))
  ) {
    return false;
  }
  if (change.change_type == 'delete') {
    return true;
  }
  return isCardFace(change.face);
};

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
export const allPartsChangeIsValid = (
  card: HCCard.Any,
  value: any,
  index?: number
): value is allPartsChange => {
  if (typeof value != 'object') return false;
  const change = value as allPartsChange;
  if (change.location != 'all_parts') {
    return false;
  }
  if (!isNoListChangeType(change.change_type)) {
    return false;
  }
  if (index == undefined) {
    index = getPartChangeIndex(card, change);
  }
  switch (change.change_type) {
    case 'add': {
      if (!change.related) return false;
      if (index == undefined) return true;
      for (const prop of partCheckProps) {
        if (
          card.all_parts![index][prop] != change.related[prop] &&
          !(change.no_blank && change.related[prop] === '')
        )
          return true;
      }
      return false;
    }
    case 'delete':
      return index != undefined;
  }
};

export const tagChangeIsValid = (card: HCCard.Any, value: any): value is tagChange => {
  if (typeof value != 'object') return false;
  const change = value as tagChange;
  if (change.location != 'tag' || !change.full_tag) {
    return false;
  }
  if (!isNoListChangeType(change.change_type)) {
    return false;
  }
  if (change.change_type == 'add') {
    return !card.base_tags?.includes(change.full_tag);
  }
  return card.base_tags?.includes(change.full_tag) ?? false;
};
export const changeIsValid = (card: HCCard.Any, value: any): value is anyChange => {
  if (typeof value != 'object') return false;
  const change = value as anyChange;
  try {
    switch (change.location) {
      case 'root':
        return rootChangeIsValid(card, change);
      case 'face':
        return faceChangeIsValid(card, change);
      case 'card_faces':
        return cardFacesChangeIsValid(card, change);
      case 'all_parts':
        return allPartsChangeIsValid(card, change);
      case 'tag':
        return tagChangeIsValid(card, change);
    }
  } catch (error) {
    return false;
  }
  return false; // fallback just in case
};
