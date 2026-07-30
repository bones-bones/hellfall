import { HCObject } from '../Object';
import { isSetCode } from '../Set';
import { HCCardFace } from './CardFace';
import { getPartEntries, partPropType, facePropType, getFaceEntries } from './Props';
import { HCRelatedCard, isComponent } from './RelatedCard';
import { isBorderColor, isColors, isFrame, isFrameEffect, isImageStatus, isLayout } from './values';
// Reimplemented here to prevent circularity
const isInteger = (num: string) => {
  return num == parseInt(num).toString();
};

/**
 * Checks if a value is a {@linkcode HCRelatedCard}
 * @param value the value to check
 */
export const isRelatedCard = (value: any): value is HCRelatedCard => {
  if (typeof value != 'object' || value == null) return false;
  const part = value as HCRelatedCard;
  if (
    !getPartEntries(part).every(([prop, value]) => {
      switch (prop) {
        case 'object':
          return value == HCObject.ObjectType.RelatedCard;
        case 'set':
          return isSetCode(value) || value === '';
        case 'image':
          return typeof value == 'string' && (value.startsWith('https://') || value === '');
        case 'component':
          return isComponent(value);
        case 'is_draft_partner':
        case 'persistent':
          return value === true;
        case 'count':
          return typeof value == 'string' && (isInteger(value) || value == 'x');
      }
      return ['id', 'hcid', 'name', 'type_line'].includes(prop) && typeof value == 'string';
    })
  ) {
    return false;
  }
  return ['object', 'id', 'hcid', 'image', 'name', 'set', 'type_line', 'component'].every(
    prop => part[prop as partPropType] != undefined
  );
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

/**
 * Checks if a value is a {@linkcode HCCardFace.MultiFaced}
 * @param value the value to check
 */
export const isCardFace = (value: any): value is HCCardFace.MultiFaced => {
  if (typeof value != 'object' || value == null) return false;
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
          return typeof value == 'string' && value.startsWith('https://');
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
