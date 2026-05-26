import { facePropType, partPropType, propType } from './propTypes';

export const propOrder: propType[] = [
  'object',
  'id',
  'scryfall_id',
  'oracle_id',
  'name',
  'flavor_name',
  'export_name',
  'set',
  'collector_number',
  'rarity',
  'layout',
  'image_status',
  'image',
  'rotated_image',
  'still_image',
  'mana_cost',
  'mana_value',
  'supertypes',
  'types',
  'subtypes',
  'type_line',
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
  'color_identity',
  'color_identity_hybrid',
  'draft_image_status',
  'draft_image',
  'rotated_draft_image',
  'still_draft_image',
  'not_directly_draftable',
  'has_draft_partners',
  'keywords',
  'legalities',
  'creators',
  'artists',
  'artist_notes',
  'rulings',
  'finish',
  'watermark',
  'border_color',
  'frame',
  'frame_effects',
  'tags',
  'tag_notes',
  'token_id',
  'variation',
  'variation_of',
  'isActualToken',
  'card_faces',
  'all_parts',
];
export const facePropOrder: facePropType[] = [
  'object',
  'name',
  'flavor_name',
  'export_name',
  'layout',
  'image_status',
  'image',
  'rotated_image',
  'still_image',
  'mana_cost',
  'mana_value',
  'supertypes',
  'types',
  'subtypes',
  'type_line',
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
  'finish',
  'watermark',
  'border_color',
  'frame',
  'frame_effects',
  'compress_face',
  'drop_face',
];
export const partPropOrder: partPropType[] = [
  'object',
  'id',
  'name',
  'set',
  'image',
  'type_line',
  'component',
  'is_draft_partner',
  'count',
  'persistent',
];

export const orderCardProps = (props: propType[]) =>
  props.sort((a, b) => {
    if (!propOrder.includes(a) || !propOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return propOrder.indexOf(a) - propOrder.indexOf(b);
  });

export const orderFaceProps = (props: facePropType[]) =>
  props.sort((a, b) => {
    if (!facePropOrder.includes(a) || !facePropOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return facePropOrder.indexOf(a) - facePropOrder.indexOf(b);
  });

export const orderPartProps = (props: partPropType[]) =>
  props.sort((a, b) => {
    if (!partPropOrder.includes(a) || !partPropOrder.includes(b)) {
      throw new Error(`You have an extra prop. a: ${a}, b: ${b}`);
    }
    return partPropOrder.indexOf(a) - partPropOrder.indexOf(b);
  });
