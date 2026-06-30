import { HCObject } from '../Object';
import { HCCardFields } from './CardFields.ts';
import { facePropType, getFaceEntries } from './Props.ts';
import { isBorderColor } from './values/BorderColor.ts';
import { isColors } from './values/Color.ts';
import { isFrame } from './values/Frame.ts';
import { isFrameEffect } from './values/FrameEffect.ts';
import { isImageStatus } from './values/ImageStatus.ts';
import { isLayout } from './values/Layout.ts';

/**
 * A collection of types representing card faces of each possible type.
 *
 * @see {@link https://scryfall.com/docs/api/layouts#card-faces}
 */
export namespace HCCardFace {
  /**
   * The abstract root implementation of card faces.
   */
  export type AbstractCardFace = HCObject.Object<HCObject.ObjectType.CardFace>;

  /**
   * A card face found on cards with multiple faces.
   */
  export type MultiFaced = AbstractCardFace &
    HCCardFields.Gameplay.CardFaceSpecific &
    HCCardFields.Print.CardFaceSpecific;
}

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
