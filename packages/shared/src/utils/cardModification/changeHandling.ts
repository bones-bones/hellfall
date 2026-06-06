import {
  formatList,
  HCCard,
  HCCardFace,
  HCColor,
  HCColors,
  HCImageStatus,
  HCKind,
  HCLayout,
  HCLegalitiesField,
  HCLegality,
  HCObject,
  HCRarity,
  HCRelatedCard,
} from '@hellfall/shared/types';
import {
  CardMap,
  faceEntriesType,
  facePropType,
  faceValueType,
  getAllRelated,
  getAllRelatedCollection,
  rootPropType,
  rootValueType,
  toFaces,
} from '../cardHandling';
import {
  addPropToRecord,
  deletePropFromRecord,
  doubleListEquals,
  listEquals,
  listsAreEqual,
  listShare,
} from '../listHandling';
import {
  addPropToFace,
  addPropToRoot,
  deletePropFromFace,
  deletePropFromRoot,
  popPropFromFace,
  popPropFromRoot,
  pushPropToFace,
  pushPropToRoot,
} from './modificationHandling';
import { setDerivedProps } from './derivedProps';
import { cleanParts, updateParts } from './partsHandling';
import { textEquals } from '../textHandling';
import { toMultiFaced, toSingleFaced } from './defaults';
import type { CollectionReference, DocumentReference } from '@google-cloud/firestore';
import { cardToFirestore, firestoreCard, firestoreToCard } from '../firestore';
import type {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeType,
  faceChange,
  rootChange,
  tagChange,
} from './changeTypes';

export type {
  allPartsChange,
  anyChange,
  cardFacesChange,
  changeLocation,
  changeType,
  faceChange,
  rootChange,
  tagChange,
} from './changeTypes';
// commented out = currently done automatically via tags, but could concievable be done manually in the future
export const rootChangeableProps: Record<changeType, rootPropType[]> = {
  add: [
    'id_is_scryfall',
    // 'oracle_id',
    'oracle_id_is_scryfall',
    'name',
    // 'flavor_name',
    'set',
    // 'collector_number',
    'rarity',
    // 'layout',
    // 'image_status',
    'image',
    // 'rotated_image',
    // 'still_image',
    'mana_value',
    'colors',
    // 'draft_image_status',
    // 'draft_image',
    // 'rotated_draft_image',
    // 'still_draft_image',
    // 'not_directly_draftable',
    // 'has_draft_partners',
    'legalities',
    'rulings',
    // 'finish',
    // 'border_color',
    // 'frame',
  ],
  push: [
    'keywords',
    'creators',
    'artists',
    'artist_notes',
    // 'frame_effects',
    // 'tags',
    // 'tag_notes',
    // 'tag_state',
  ],
  delete: [
    'id_is_scryfall',
    'oracle_id_is_scryfall',
    // 'flavor_name',
    'rarity',
    // 'image',
    // 'rotated_image',
    // 'still_image',
    // 'draft_image_status',
    // 'draft_image',
    // 'rotated_draft_image',
    // 'still_draft_image',
    // 'not_directly_draftable',
    // 'has_draft_partners',
  ],
  pop: [
    'keywords',
    'creators',
    'artists',
    'artist_notes',
    // 'frame_effects',
    // 'tags',
    // 'tag_notes',
    // 'tag_state',
  ],
};
export const faceChangeableProps: Record<changeType, facePropType[]> = {
  add: [
    'name',
    // 'flavor_name',
    // 'layout',
    // 'image_status',
    'image',
    // 'rotated_image',
    // 'still_image',
    'mana_cost',
    'mana_value',
    'supertypes',
    'types',
    'subtypes',
    'oracle_text',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'hand_modifier',
    'life_modifier',
    'attraction_lights',
    'colors',
    'color_indicator',
    // 'finish',
    // 'watermark',
    // 'border_color',
    // 'frame',
    // 'compress_face',
    // 'drop_face',
  ],
  push: [
    // 'frame_effects',
  ],
  delete: [
    // 'flavor_name',
    // 'image_status',
    'image',
    // 'rotated_image',
    // 'still_image',
    'mana_cost',
    'mana_value',
    'supertypes',
    'types',
    'subtypes',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'hand_modifier',
    'life_modifier',
    'attraction_lights',
    'color_indicator',
    // 'watermark',
    // 'frame',
    // 'compress_face',
    // 'drop_face',
  ],
  pop: [
    // 'frame_effects',
  ],
};
export const colorsAreValid = (colors: HCColors): boolean => {
  const colorList: HCColors = [];
  for (const color of colors) {
    if (colorList.includes(color) || !Object.values(HCColor).includes(color as HCColor)) {
      return false;
    } else {
      colorList.push(color);
    }
  }
  return true;
};

export const legalitiesAreValid = (
  legalities: HCLegalitiesField,
  current: HCLegalitiesField
): boolean =>
  doubleListEquals(formatList, Object.keys(legalities)) &&
  Object.values(legalities).every(legality => Object.values(HCLegality).includes(legality)) &&
  Object.entries(legalities).some(([format, legality]) => current[format] != legality);

export const rootChangeIsValid = <K extends rootPropType>(
  card: HCCard.Any,
  change: rootChange<K>
) => {
  if (card.kind == 'scryfall') {
    return false;
  }
  if (!rootChangeableProps[change.change_type].includes(change.prop)) {
    return false;
  }
  const currentValue = card[change.prop];
  switch (change.change_type) {
    case 'add': {
      if (change.value == undefined) {
        return false;
      }
      if (change.prop == 'colors') {
        return (
          colorsAreValid(change.value as HCColors) &&
          !listEquals(change.value as HCColors, currentValue as HCColors)
        );
      }
      if (change.prop == 'legalities') {
        return legalitiesAreValid(
          change.value as HCLegalitiesField,
          currentValue as HCLegalitiesField
        );
      }
      if (change.value == currentValue) {
        return false;
      }
      if (['id_is_scryfall', 'oracle_id_is_scryfall'].includes(change.prop)) {
        return change.value === true && change.value != currentValue;
      }
      if (change.prop == 'image') {
        return (
          typeof change.value == 'string' &&
          change.value.startsWith('https://') &&
          change.value != currentValue
        );
      }
      if (change.prop == 'mana_value') {
        return typeof change.value == 'number';
      }
      if (change.prop == 'rarity') {
        return Object.values(HCRarity).includes(change.value as HCRarity);
      }
      return typeof change.value == 'string';
    }
    case 'push': {
      if (change.prop == 'artist_notes') {
        return (
          Array.isArray(change.value) &&
          change.value.length == 2 &&
          typeof change.value[0] == 'string' &&
          typeof change.value[1] == 'string' &&
          change.value[1] != (currentValue as Record<string, string>)[change.value[0]]
        );
      }
      return typeof change.value == 'string' && !listShare(currentValue as string[], change.value);
    }
    case 'delete':
      return change.prop in card;
    case 'pop':
      if (change.prop == 'artist_notes') {
        return (
          Array.isArray(change.value) &&
          (currentValue as Record<string, string>)?.[(change.value as [string, string])[0]] !=
            undefined
        );
      }
      return typeof change.value == 'string' && !!listShare(currentValue as string[], change.value);
  }
};

export const attractionLightsAreValid = (lights: number[]) => {
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
export const faceChangeIsValid = <K extends facePropType>(
  card: HCCard.Any,
  change: faceChange<K>
) => {
  if (card.kind == 'scryfall') {
    return false;
  }
  if (!faceChangeableProps[change.change_type].includes(change.prop)) {
    return false;
  }
  if ('card_faces' in card) {
    if (
      change.index == undefined ||
      !Number.isInteger(change.index) ||
      change.index < 0 ||
      change.index >= card.card_faces.length
    ) {
      return false;
    }
  } else if (change.index /* != undefined */) {
    return false;
  }
  const face = toFaces(card)[change.index ?? 0];
  const currentValue = face[change.prop];
  switch (change.change_type) {
    case 'add': {
      if (change.value == undefined) {
        return false;
      }
      if (change.prop == 'colors' || change.prop == 'color_indicator') {
        return (
          colorsAreValid(change.value as HCColors) &&
          !listEquals(change.value as HCColors, currentValue as HCColors)
        );
      }
      if (change.prop == 'attraction_lights') {
        return (
          attractionLightsAreValid(change.value as number[]) &&
          !listEquals(change.value as number[], currentValue as number[])
        );
      }
      if (['supertypes', 'types', 'subtypes'].includes(change.prop)) {
        return (
          Array.isArray(change.value) &&
          change.value.every(v => typeof v == 'string') &&
          !listsAreEqual(change.value, currentValue as string[])
        );
      }
      if (change.value == currentValue) {
        return false;
      }
      if (change.prop == 'image') {
        return typeof change.value == 'string' && change.value.startsWith('https://');
      }
      if (change.prop == 'mana_value') {
        return typeof change.value == 'number';
      }
      return typeof change.value == 'string';
    }
    case 'push':
      return typeof change.value == 'string' && !listShare(currentValue as string[], change.value);
    case 'delete':
      return change.prop in face;
    case 'pop':
      return typeof change.value == 'string' && !!listShare(currentValue as string[], change.value);
  }
};
export const cardFacesChangeIsValid = (card: HCCard.Any, change: cardFacesChange): boolean => {
  // TODO: Make sure this properly handles when multiple card faces are being added
  if (card.kind == 'scryfall') {
    return false;
  }
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
  if (!change.face) {
    return false;
  }
  if (
    !(Object.entries(change.face) as faceEntriesType).every(([prop, value]) => {
      switch (prop) {
        case 'object':
          return value == HCObject.ObjectType.CardFace;
        case 'layout':
          return Object.values(HCLayout).includes(value);
        case 'image_status':
          return Object.values(HCImageStatus).includes(value);
        case 'image':
          return value.startsWith('https://');
        case 'mana_value':
          return typeof value == 'number';
        case 'attraction_lights':
          return attractionLightsAreValid(value);
        case 'colors':
        case 'color_indicator':
          return colorsAreValid(value);
        case 'supertypes':
        case 'types':
        case 'subtypes':
          return Array.isArray(value) && value.every(v => typeof v == 'string');
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
  ].every(prop => change.face![prop as facePropType] != undefined);
};

const partCheckProps: (keyof HCRelatedCard)[] = [
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
  change: allPartsChange,
  index?: number
): boolean => {
  if (index == undefined) {
    index = getPartChangeIndex(card, change);
  }
  switch (change.change_type) {
    case 'add': {
      if (!change.related) return false;
      if (index == undefined) return true;
      if (change.no_overwrite) return false;
      for (const prop of partCheckProps) {
        if (card.all_parts![index][prop] != change.related[prop]) return true;
      }
      return false;
    }

    case 'delete':
      return index != undefined;
  }
};

export const tagChangeIsValid = (card: HCCard.Any, change: tagChange): boolean => {
  // TODO: add logic here?
  return true;
};

export const changeIsValid = (card: HCCard.Any, change: anyChange): boolean => {
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
};

const rootDeriveProps: rootPropType[] = [];

export const applyRootChange = <K extends rootPropType>(
  card: HCCard.Any,
  change: rootChange<K>
): boolean => {
  switch (change.change_type) {
    case 'add': {
      addPropToRoot(card, change.prop, change.value!);
      break;
    }
    case 'push': {
      if (change.prop == 'artist_notes') {
        const [artist, note] = change.value as [string, string];
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
      if (change.prop == 'artist_notes') {
        const [artist, note] = change.value as [string, string];
        deletePropFromRecord(card, 'artist_notes', artist);
        break;
      }
      if (change.prop == 'artists') {
        deletePropFromRecord(card, 'artist_notes', change.value as string);
      }
      popPropFromRoot(card, change.prop, change.value!);
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

export const applyFaceChange = <K extends facePropType>(
  card: HCCard.Any,
  change: faceChange<K>
): boolean => {
  switch (change.change_type) {
    case 'add': {
      addPropToFace(card, change.prop, change.value!);
      break;
    }
    case 'push': {
      pushPropToFace(card, change.prop, change.value!);
      break;
    }
    case 'delete':
      deletePropFromFace(card, change.prop);
      break;
    case 'pop':
      popPropFromFace(card, change.prop, change.value!);
      break;
  }
  return faceDeriveProps.includes(change.prop);
};

export const applyCardFacesChange = (card: HCCard.Any, change: cardFacesChange): boolean => {
  // TODO: make sure this works when using toSingleFaced/toMultiFaced (i.e. that it actually modifies the original)
  if (change.change_type == 'delete') {
    if (!('card_faces' in card)) {
      throw console.error('Tried to delete a nonexistent face');
    }
    card.card_faces.splice(change.index, 1);
    if (card.card_faces.length == 1) {
      card = toSingleFaced(card);
    }
  } else {
    if (!change.face) {
      throw console.error('Tried to add a nonexistent face');
    }
    if (!('card_faces' in card)) {
      card = toMultiFaced(card);
    }
    // if (!('card_faces' in card)) {
    //   throw console.error('Something went very, very wrong')
    // }
    card.card_faces.splice(change.index, 0, change.face);
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
  // TODO: add logic here?
  return false;
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
      return false;
  }
};

// can add even if empty
const rootBlankableProps: Partial<Record<HCKind, rootPropType[]>> = {
  card: ['mana_cost', 'mana_value', 'rulings', 'collector_number'],
  notmagic: ['mana_cost', 'mana_value'],
};

const faceBlankableProps: Partial<Record<HCKind, facePropType[]>> = {
  card: ['mana_cost', 'mana_value', 'oracle_text'],
  notmagic: ['mana_cost', 'mana_value', 'oracle_text'],
};

// can delete
const rootRemovableProps: Partial<Record<HCKind, rootPropType[]>> = {
  card: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  token: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  land: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
  notmagic: [
    'flavor_name',
    'export_name',
    'collector_number',
    'image',
    'rotated_image',
    'still_image',
    'draft_image_status',
    'draft_image',
    'rotated_draft_image',
    'still_draft_image',
    'not_directly_draftable',
    'has_draft_partners',
    'artists',
    'artist_notes',
    'frame_effects',
    'tags',
    'tag_notes',
    'all_parts',
  ],
};
const faceRemovableProps: Partial<Record<HCKind, facePropType[]>> = {
  card: [
    'flavor_name',
    'export_name',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'watermark',
    'frame',
    'frame_effects',
    'compress_face',
    'drop_face',
  ],
  token: [
    'flavor_name',
    'export_name',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'power',
    'toughness',
    'watermark',
    'frame',
    'frame_effects',
  ],
  land: [
    'flavor_name',
    'export_name',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'watermark',
    'frame',
    'frame_effects',
  ],
  notmagic: [
    'flavor_name',
    'export_name',
    'image',
    'rotated_image',
    'still_image',
    'supertypes',
    'types',
    'subtypes',
    'flavor_text',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'color_indicator',
    'watermark',
    'frame',
    'frame_effects',
  ],
};

const rootIgnoreProps: Record<HCKind, rootPropType[]> = {
  card: ['keywords', 'image_status', 'draft_image_status'],
  token: ['mana_cost', 'mana_value', 'colors', 'rulings', 'image_status', 'draft_image_status'],
  land: ['keywords', 'image_status', 'draft_image_status'],
  front: ['keywords', 'image_status', 'draft_image_status'],
  scryfall: [],
  notmagic: ['keywords', 'image_status', 'draft_image_status'],
};
const faceIgnoreProps: Partial<Record<HCKind, facePropType[]>> = {
  card: ['colors'],
  token: ['mana_cost', 'mana_value', 'subtypes', 'oracle_text', 'colors'],
  land: ['colors'],
  front: ['colors'],
  scryfall: ['colors'],
  notmagic: ['colors'],
};

export const changeTypeOrder = ['delete', 'pop', 'add', 'push'];
export const locationOrder = ['card_faces', 'all_parts', 'face', 'root'];

export const sortChanges = (a: anyChange, b: anyChange): number =>
  locationOrder.indexOf(a.location) - locationOrder.indexOf(b.location) ||
  changeTypeOrder.indexOf(a.change_type) - changeTypeOrder.indexOf(b.change_type);

export const getChangesFromDifferences = (
  existingCard: HCCard.Any,
  newCard: HCCard.Any,
  pullingFromSheet?: boolean
): anyChange[] => {
  const changeList: anyChange[] = [];
  (Object.entries(rootChangeableProps) as [changeType, rootPropType[]][]).forEach(
    ([change_type, props]) => {
      props.forEach(prop => {
        switch (change_type) {
          case 'add': {
            const value = newCard[prop] as rootValueType<typeof prop>;
            if (value == undefined) return;
            if (pullingFromSheet) {
              if (!value && !rootBlankableProps[existingCard.kind]?.includes(prop)) return;
              if (rootIgnoreProps[existingCard.kind]?.includes(prop)) return;
              // if (prop == 'image_status') return
            }
            const change: rootChange<typeof prop> = {
              location: 'root',
              change_type,
              prop,
              value,
            };
            if (rootChangeIsValid(existingCard, change)) {
              changeList.push(change);
            }
            break;
          }
          case 'push': {
            if (prop == 'artist_notes') {
              const artists = newCard[prop] as Record<string, string>;
              if (artists == undefined) return;
              Object.entries(artists).forEach(([artist, note]) => {
                const change: rootChange<typeof prop> = {
                  location: 'root',
                  change_type,
                  prop,
                  value: [artist, note],
                };
                if (rootChangeIsValid(existingCard, change)) {
                  changeList.push(change);
                }
              });
              return;
            }
            const values = newCard[prop] as rootValueType<typeof prop>[];
            if (values == undefined) return;
            values.forEach(value => {
              const change: rootChange<typeof prop> = {
                location: 'root',
                change_type,
                prop,
                value,
              };
              if (rootChangeIsValid(existingCard, change)) {
                changeList.push(change);
              }
            });
            break;
          }
          case 'delete': {
            const value = newCard[prop] as rootValueType<typeof prop>;
            if (value != undefined) return;
            if (pullingFromSheet) {
              if (!rootRemovableProps[existingCard.kind]?.includes(prop)) return;
              if (rootIgnoreProps[existingCard.kind]?.includes(prop)) return;
            }
            const change: rootChange<typeof prop> = {
              location: 'root',
              change_type,
              prop,
            };
            if (rootChangeIsValid(existingCard, change)) {
              changeList.push(change);
            }
            break;
          }
          case 'pop': {
            if (prop == 'artist_notes') {
              const artists = existingCard[prop] as Record<string, string>;
              if (artists == undefined) return;
              Object.entries(artists).forEach(([artist, note]) => {
                const change: rootChange<typeof prop> = {
                  location: 'root',
                  change_type,
                  prop,
                  value: [artist, note],
                };
                if (newCard[prop]?.[artist] == undefined) {
                  changeList.push(change);
                }
              });
              return;
            }
            const values = existingCard[prop] as rootValueType<typeof prop>[];
            if (values == undefined) return;
            if (pullingFromSheet) {
              if (rootIgnoreProps[existingCard.kind]?.includes(prop)) return;
            }
            values.forEach(value => {
              const change: rootChange<typeof prop> = {
                location: 'root',
                change_type,
                prop,
                value,
              };
              if (!(newCard[prop] as rootValueType<typeof prop>[])?.includes(value)) {
                changeList.push(change);
              }
            });
            break;
          }
        }
      });
    }
  );
  // if ('card_faces' in existingCard != 'card_faces' in newCard) {
  //   throw console.error('You really shouldn\'t try to use this to compare between single cards and multiface cards.')
  // }
  for (
    let index = 0;
    index <
    Math.max(
      'card_faces' in existingCard ? existingCard.card_faces.length : 1,
      'card_faces' in newCard ? newCard.card_faces.length : 1
    );
    index++
  ) {
    const existingFace = toFaces(existingCard)[index];
    const newFace = toFaces(newCard)[index];
    if (!existingFace) {
      const change: cardFacesChange = {
        location: 'card_faces',
        index,
        change_type: 'add',
        face: newFace as HCCardFace.MultiFaced,
      };
      changeList.push(change);
      continue;
    }
    if (!newFace) {
      const change: cardFacesChange = {
        location: 'card_faces',
        index,
        change_type: 'delete',
      };
      changeList.push(change);
      continue;
    }
    (Object.entries(faceChangeableProps) as [changeType, facePropType[]][]).forEach(
      ([change_type, props]) => {
        props.forEach(prop => {
          switch (change_type) {
            case 'add': {
              const value = newFace[prop] as faceValueType<typeof prop>;
              if (value == undefined) return;
              if (pullingFromSheet) {
                if (!value && !faceBlankableProps[existingCard.kind]?.includes(prop)) return;
                if (faceIgnoreProps[existingCard.kind]?.includes(prop)) return;
                if (prop == 'image_status' && newFace.image) return;
              }
              const change: faceChange<typeof prop> = {
                location: 'face',
                change_type,
                prop,
                value,
                index,
              };
              if (faceChangeIsValid(existingCard, change)) {
                changeList.push(change);
              }
              break;
            }
            case 'push': {
              const values = newFace[prop] as faceValueType<typeof prop>[];
              if (values == undefined) return;
              if (pullingFromSheet) {
                if (faceIgnoreProps[existingCard.kind]?.includes(prop)) return;
              }
              values.forEach(value => {
                const change: faceChange<typeof prop> = {
                  location: 'face',
                  change_type,
                  prop,
                  value,
                  index,
                };

                if (faceChangeIsValid(existingCard, change)) {
                  changeList.push(change);
                }
              });
              break;
            }
            case 'delete': {
              const value = newFace[prop] as faceValueType<typeof prop>;
              if (value != undefined) return;
              if (pullingFromSheet) {
                if (!faceRemovableProps[existingCard.kind]?.includes(prop)) return;
                if (faceIgnoreProps[existingCard.kind]?.includes(prop)) return;
              }
              const change: faceChange<typeof prop> = {
                location: 'face',
                change_type,
                prop,
                index,
              };
              if (faceChangeIsValid(existingCard, change)) {
                changeList.push(change);
              }
              break;
            }
            case 'pop': {
              const values = existingFace[prop] as faceValueType<typeof prop>[];
              if (values == undefined) return;
              values.forEach(value => {
                const change: faceChange<typeof prop> = {
                  location: 'face',
                  change_type,
                  prop,
                  value,
                  index,
                };
                if (!(newFace[prop] as faceValueType<typeof prop>[])?.includes(value)) {
                  changeList.push(change);
                }
              });
              break;
            }
          }
        });
      }
    );
  }

  const foundIndices: number[] = [];
  newCard.all_parts?.forEach(newPart => {
    const change: allPartsChange = {
      location: 'all_parts',
      change_type: 'add',
      related: newPart,
    };
    if (pullingFromSheet) {
      change.no_overwrite = true;
    }
    const index = getPartChangeIndex(existingCard, change);
    if (index != undefined) {
      foundIndices.push(index);
      if (allPartsChangeIsValid(existingCard, change, index)) {
        changeList.push(change);
      }
    } else {
      changeList.push(change);
    }
  });
  existingCard.all_parts
    ?.filter((part, i) => !foundIndices.includes(i))
    .forEach(part => {
      const change: allPartsChange = {
        location: 'all_parts',
        change_type: 'delete',
      };
      if (part.id) {
        change.id = part.id;
      } else if (part.hcid) {
        change.id = part.hcid;
        change.part_prop = 'hcid';
      } else if (part.name) {
        change.id = part.name;
        change.part_prop = 'name';
      } else {
        return;
      }
      changeList.push(change);
    });
  return changeList.sort(sortChanges);
};

export const applyChanges = (card: HCCard.Any, changeList: anyChange[]): boolean => {
  let setDerived = false;
  changeList.forEach((change, index) => {
    if (!changeIsValid(card, change)) throw console.error('invalid change got passed in');
    if (applyChange(card, change)) {
      setDerived = true;
    }
    if (change.location == 'card_faces') {
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
  if (applyChanges(existingCard, changeList) && newCard.kind != 'scryfall') {
    setDerivedProps(existingCard);
  }
  if (newCard.kind == 'scryfall') {
    newCard.all_parts = existingCard.all_parts;
    setDerivedProps(newCard);
    return newCard;
  }
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
export const applyFromCollection = async (
  card: HCCard.Any,
  changeList: anyChange[],
  cardsCol: CollectionReference
) => {
  const oldRelateds: DocumentReference<firestoreCard, firestoreCard>[] = getAllRelatedCollection(
    card,
    cardsCol
  );
  if (!applyChanges(card, changeList)) return;
  const newRelateds = getAllRelatedCollection(card, cardsCol);
  setDerivedProps(card);
  const oldRelatedMap = new CardMap(
    await Promise.all(oldRelateds.map(async data => firestoreToCard(await data.get())))
  );
  const newRelatedMap = new CardMap(
    await Promise.all(newRelateds.map(async data => firestoreToCard(await data.get())))
  );
  const bothRelatedMap = oldRelatedMap.getSubset(newRelatedMap.ids());
  oldRelatedMap.deleteMultiple(bothRelatedMap.ids());
  newRelatedMap.deleteMultiple(bothRelatedMap.ids());
  updateParts(card, newRelatedMap);
  updateParts(card, bothRelatedMap);
  cleanParts(card, bothRelatedMap);
  cleanParts(card, oldRelatedMap);
  oldRelateds.forEach(
    async data =>
      await data.set(cardToFirestore(oldRelatedMap.get(data.id) ?? bothRelatedMap.get(data.id)!))
  );
  newRelateds.forEach(
    async data =>
      await data.set(cardToFirestore(newRelatedMap.get(data.id) ?? bothRelatedMap.get(data.id)!))
  );
};
