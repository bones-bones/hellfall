import { formatList, HCCard, HCCardFace, HCColor, HCColors, HCImageStatus, HCLayout, HCLegalitiesField, HCLegality, HCObject, HCRarity } from "@hellfall/shared/types"
import { allPropType, bothPropType, bothValueType, frontPropType, frontValueType, propType } from "../cardHandling"
import { doubleListEquals } from "../listHandling"
import { isValidV4UUID } from "../textHandling"

export type changeType = 'add'|'push'|'delete'|'pop'
// commented out = currently done automatically via tags, but could concievable be done manually in the future
export const frontChangeableProps: Record<changeType,frontPropType[]> = {
  'add': [
    'id_is_scryfall',
    // 'oracle_id',
    'oracle_id_is_scryfall',
    // 'flavor_name',
    // 'set',
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
  'push': [
    'keywords',
    'creators',
    'artists',
    // 'artist_notes',
    // 'frame_effects',
    // 'tags',
    // 'tag_notes',
    // 'tag_state',
  ],
  'delete': [
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
  'pop': [
    'keywords',
    'creators',
    'artists',
    // 'artist_notes',
    // 'frame_effects',
    // 'tags',
    // 'tag_notes',
    // 'tag_state',
  ],
}
export const faceChangeableProps: Record<changeType,bothPropType[]> = {
  'add': [
    'name',
    // 'flavor_name',
    // 'layout',
    // 'image_status',
    'image',
    // 'rotated_image',
    // 'still_image',
    'mana_cost',
    'mana_value',
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
  'push': [
    'supertypes',
    'types',
    'subtypes',
    // 'frame_effects',
  ],
  'delete': [
    // 'flavor_name',
    // 'image_status',
    'image',
    // 'rotated_image',
    // 'still_image',
    'mana_cost',
    'mana_value',
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
  'pop': [
    'supertypes',
    'types',
    'subtypes',
    // 'frame_effects',
  ],
}
export type changeLocation = 'front' | 'face' | 'card_faces' | 'all_parts'
export type frontChange<K extends frontPropType> = {
  location:'front';
  change_type:changeType;
  prop:K;
  value?:frontValueType<K>
}
export type faceChange<K extends bothPropType> = {
  location:'face'
  change_type:changeType;
  prop:K;
  value?:bothValueType<K>;
  index?:number;
}
export type cardFacesChange = {
  location: 'card_faces'
  index:number;
  change_type: 'add'|'delete';
  face?:HCCardFace.MultiFaced;
}
export type allPartsChange = {
  location: 'all_parts';
  change_type: 'add'|'delete';
  id:string;
}

export const colorsAreValid = (colors:HCColors):boolean => {
  const colorList:HCColors = [];
  for (const color of colors) {
    if (colorList.includes(color) || !Object.values(HCColor).includes(color as HCColor)) {
      return false;
    } else {
      colorList.push(color)
    }
  }
  return true;
}

export const legalitiesAreValid = (legalities: HCLegalitiesField):boolean => doubleListEquals(formatList,Object.keys(legalities)) && Object.values(legalities).every(legality=>Object.values(HCLegality).includes(legality))

export const rederiveValueProps:(frontPropType|bothPropType)[] = []

export type anyChange = frontChange<frontPropType> | faceChange<bothPropType> | cardFacesChange | allPartsChange;

export const frontChangeIsValid = <K extends frontPropType>(card:HCCard.Any, change:frontChange<K>) => {
  if (card.kind == 'scryfall') {
    return false;
  }
  if (!frontChangeableProps[change.change_type].includes(change.prop)) {
    return false;
  }
  switch (change.change_type) {
    case 'add': {
      if (change.value == undefined) {
        return false;
      }
      if (change.prop == 'colors') {
        return colorsAreValid(change.value as HCColors)
      }
      if (['id_is_scryfall','oracle_id_is_scryfall'].includes(change.prop)) {
        return change.value === true;
      }
      if (change.prop == 'image') {
        return typeof change.value == 'string' && change.value.startsWith('https://')
      }
      if (change.prop == 'mana_value') {
        return typeof change.value == 'number';
      }
      if (change.prop == 'legalities') {
        return legalitiesAreValid(change.value as HCLegalitiesField)
      }
      if (change.prop == 'rarity') {
        return Object.values(HCRarity).includes(change.value as HCRarity) 
      }
      if (change.prop == 'rulings') {
        return typeof change.value == 'string';
      }
      return false;
    }
    case 'push': 
      return typeof change.value == 'string'
    case 'delete':
      return true;
    case 'pop': 
      return typeof change.value == 'string'
  }
}

export const attractionLightsAreValid = (lights:number[]) => {
  const lightList:number[] = [];
  for (const light of lights) {
    if (lightList.includes(light) || !Number.isInteger(light) || light < 1 || light > 6) {
      return false;
    } else {
      lightList.push(light)
    }
  }
  return true;
}
export const faceChangeIsValid = <K extends bothPropType>(card:HCCard.Any, change:faceChange<K>) => {
  if (!faceChangeableProps[change.change_type].includes(change.prop)) {
    return false;
  }
  if (card.kind == 'scryfall') {
    return false;
  }
  if ('card_faces' in card) {
    if (change.index == undefined || !Number.isInteger(change.index) || change.index < 0 || change.index >= card.card_faces.length) {
      return false
    }
  } else if (change.index != undefined) {
    return false;
  }
  switch (change.change_type) {
    case 'add': {
      if (change.value == undefined) {
        return false;
      }
      if (change.prop == 'colors' || change.prop == 'color_indicator') {
        return colorsAreValid(change.value as HCColors)
      }
      if (change.prop == 'image') {
        return typeof change.value == 'string' && change.value.startsWith('https://')
      }
      if (change.prop == 'mana_value') {
        return typeof change.value == 'number';
      }
      if (change.prop == 'attraction_lights') {
        return attractionLightsAreValid(change.value as number[])
      }
      return typeof change.value == 'string';
    }
    case 'push': 
      return typeof change.value == 'string'
    case 'delete':
      return true;
    case 'pop': 
      return typeof change.value == 'string'
  }
}
export const cardFacesChangeIsValid = (card:HCCard.Any, change:cardFacesChange):boolean => {
  // TODO: build more robust handling for switching between a single faced card and a multiface card and vice versa
  if (card.kind == 'scryfall') {
    return false;
  }
  if (!('card_faces' in card) && (change.change_type == 'delete' || [0,1].includes(change.index))) {
    return false;
  }
  if ('card_faces' in card && (change.index == undefined || !Number.isInteger(change.index) || change.index < 0 || change.index > card.card_faces.length || (change.index == card.card_faces.length && change.change_type == 'delete'))) {
    return false;
  }
  if (change.change_type == 'delete') {
    return true;
  }
  if (!change.face) {
    return false;
  }
  if (!(Object.entries(change.face) as { [K in bothPropType]: [K, bothValueType<K>] }[bothPropType][]).every(([prop, value])=> {
    switch(prop) {
      case 'object': return value == HCObject.ObjectType.CardFace;
      case 'layout': return Object.values(HCLayout).includes(value);
      case 'image_status': return Object.values(HCImageStatus).includes(value);
      case 'image': return value.startsWith('https://')
      case 'mana_value':return typeof value == 'number';
      case 'attraction_lights': return attractionLightsAreValid(value);
      case 'colors':
      case 'color_indicator':
        return colorsAreValid(value)
      case 'supertypes':
      case 'types':
      case 'subtypes':
        return Array.isArray(value) && value.every(v=>typeof v == 'string'); 
    }
    return ['name', 'mana_cost','oracle_text','flavor_text','power','toughness','loyalty','defense','hand_modifier','life_modifier','type_line'].includes(prop) && typeof prop == 'string';
  })) {
    return false;
  }
  return ['object','layout','name','mana_cost','mana_value','type_line','oracle_text','colors'].every(prop=>change.face![prop as bothPropType] != undefined)
}

export const allPartsChangeIsValid = (card:HCCard.Any, change:allPartsChange):boolean => {
  switch(change.change_type) {
    case 'add': return isValidV4UUID(change.id) && !card.all_parts?.some(part=>part.id == change.id);
    case 'delete': return !!card.all_parts?.some(part=>part.id == change.id);
  }
}

export const changeIsValid = (card:HCCard.Any, change:anyChange):boolean => {
  // once I build applyChange, make sure to take whatever I make in there to check if the change does anything and stick a call to it here
  try {
    switch (change.location) {
      case 'front': return frontChangeIsValid(card,change)
      case 'face': return faceChangeIsValid(card,change)
      case 'card_faces': return cardFacesChangeIsValid(card,change)
      case 'all_parts': return allPartsChangeIsValid(card,change)
    }
  } catch (error) {
    return false;
  }

}