import type { HCObject } from '../Object';
import type { HCCard } from './Card';
import type { HCCardFace } from './CardFace';
import type { HCRelatedCard } from './RelatedCard';
import type { HCLayout } from './values';

const anyPropRecord = {
  object: 'object',
  kind: 'kind',
  id: 'id',
  id_is_scryfall: 'id_is_scryfall',
  oracle_id: 'oracle_id',
  oracle_id_is_scryfall: 'oracle_id_is_scryfall',
  hcid: 'hcid',
  name: 'name',
  flavor_name: 'flavor_name',
  export_name: 'export_name',
  set: 'set',
  collector_number: 'collector_number',
  rarity: 'rarity',
  layout: 'layout',
  image_status: 'image_status',
  image: 'image',
  rotated_image: 'rotated_image',
  still_image: 'still_image',
  mana_cost: 'mana_cost',
  mana_value: 'mana_value',
  supertypes: 'supertypes',
  types: 'types',
  subtypes: 'subtypes',
  type_line: 'type_line',
  oracle_text: 'oracle_text',
  flavor_text: 'flavor_text',
  power: 'power',
  toughness: 'toughness',
  loyalty: 'loyalty',
  defense: 'defense',
  hand_modifier: 'hand_modifier',
  life_modifier: 'life_modifier',
  attraction_lights: 'attraction_lights',
  colors: 'colors',
  color_indicator: 'color_indicator',
  color_identity: 'color_identity',
  color_identity_hybrid: 'color_identity_hybrid',
  print_image_status: 'print_image_status',
  print_image: 'print_image',
  rotated_print_image: 'rotated_print_image',
  still_print_image: 'still_print_image',
  not_directly_draftable: 'not_directly_draftable',
  has_draft_partners: 'has_draft_partners',
  keywords: 'keywords',
  legalities: 'legalities',
  creators: 'creators',
  artists: 'artists',
  artist_notes: 'artist_notes',
  rulings: 'rulings',
  finish: 'finish',
  watermark: 'watermark',
  border_color: 'border_color',
  frame: 'frame',
  frame_effects: 'frame_effects',
  tags: 'tags',
  tag_notes: 'tag_notes',
  base_tags: 'base_tags',
  card_faces: 'card_faces',
  all_parts: 'all_parts',
  compress_face: 'compress_face',
  drop_face: 'drop_face',
  toJSON: 'toJSON',
} as const satisfies Record<anyPropType, string>;
export const anyPropOrder: anyPropType[] = Object.values(anyPropRecord);
const rootPropRecord = {
  object: 'object',
  kind: 'kind',
  id: 'id',
  id_is_scryfall: 'id_is_scryfall',
  oracle_id: 'oracle_id',
  oracle_id_is_scryfall: 'oracle_id_is_scryfall',
  hcid: 'hcid',
  name: 'name',
  flavor_name: 'flavor_name',
  export_name: 'export_name',
  set: 'set',
  collector_number: 'collector_number',
  rarity: 'rarity',
  layout: 'layout',
  image_status: 'image_status',
  image: 'image',
  rotated_image: 'rotated_image',
  still_image: 'still_image',
  mana_cost: 'mana_cost',
  mana_value: 'mana_value',
  type_line: 'type_line',
  colors: 'colors',
  color_identity: 'color_identity',
  color_identity_hybrid: 'color_identity_hybrid',
  print_image_status: 'print_image_status',
  print_image: 'print_image',
  rotated_print_image: 'rotated_print_image',
  still_print_image: 'still_print_image',
  not_directly_draftable: 'not_directly_draftable',
  has_draft_partners: 'has_draft_partners',
  keywords: 'keywords',
  legalities: 'legalities',
  creators: 'creators',
  artists: 'artists',
  artist_notes: 'artist_notes',
  rulings: 'rulings',
  finish: 'finish',
  border_color: 'border_color',
  frame: 'frame',
  frame_effects: 'frame_effects',
  tags: 'tags',
  tag_notes: 'tag_notes',
  base_tags: 'base_tags',
  all_parts: 'all_parts',
  toJSON: 'toJSON',
} as const satisfies Record<rootPropType, string>;
export const rootPropOrder: rootPropType[] = Object.values(rootPropRecord);
const facePropRecord = {
  object: 'object',
  name: 'name',
  flavor_name: 'flavor_name',
  export_name: 'export_name',
  layout: 'layout',
  image_status: 'image_status',
  image: 'image',
  rotated_image: 'rotated_image',
  still_image: 'still_image',
  mana_cost: 'mana_cost',
  mana_value: 'mana_value',
  supertypes: 'supertypes',
  types: 'types',
  subtypes: 'subtypes',
  type_line: 'type_line',
  oracle_text: 'oracle_text',
  flavor_text: 'flavor_text',
  power: 'power',
  toughness: 'toughness',
  loyalty: 'loyalty',
  defense: 'defense',
  hand_modifier: 'hand_modifier',
  life_modifier: 'life_modifier',
  attraction_lights: 'attraction_lights',
  colors: 'colors',
  color_indicator: 'color_indicator',
  finish: 'finish',
  watermark: 'watermark',
  border_color: 'border_color',
  frame: 'frame',
  frame_effects: 'frame_effects',
  compress_face: 'compress_face',
  drop_face: 'drop_face',
} as const satisfies Record<facePropType, string>;
export const facePropOrder: facePropType[] = Object.values(facePropRecord);

const partPropRecord = {
  object: 'object',
  id: 'id',
  hcid: 'hcid',
  name: 'name',
  set: 'set',
  image: 'image',
  type_line: 'type_line',
  component: 'component',
  is_draft_partner: 'is_draft_partner',
  count: 'count',
  persistent: 'persistent',
} as const satisfies Record<partPropType, string>;
export const partPropOrder: partPropType[] = Object.values(partPropRecord);

/**
 * Any prop of a card or face
 */
export type anyPropType =
  | keyof HCCard.AnySingleFaced
  | keyof HCCard.AnyMultiFaced
  | keyof HCCardFace.MultiFaced;
export const isAnyPropType = (value: any): value is anyPropType => anyPropOrder.includes(value);
/**
 * The exact value that corresponds to {@link anyPropType}. Use this if you're overwriting lists/records wholesale
 */
export type anyValueType<K extends anyPropType> = K extends keyof HCCard.AnySingleFaced
  ? HCCard.AnySingleFaced[K]
  : K extends keyof HCCard.AnyMultiFaced
  ? HCCard.AnyMultiFaced[K]
  : K extends keyof HCCardFace.MultiFaced
  ? HCCardFace.MultiFaced[K]
  : never;
/**
 * The value that corresponds to {@link anyPropType}. For arrays, uses the value of members of that array
 */
export type anyElementValueType<K extends anyPropType> = Exclude<
  anyValueType<K>,
  undefined
> extends Array<infer U>
  ? U
  : anyValueType<K>;

export type colorPropType = 'colors' | 'color_indicator';
// export type facePropType = keyof HCCardFace.MultiFaced;
// // export type excludeFacePropType = Exclude<facePropType, 'layout'>;
// export type faceElementValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
// export type faceArrayElementType<K extends keyof HCCardFace.MultiFaced> = Exclude<
//   HCCardFace.MultiFaced[K],
//   undefined
// > extends Array<infer U>
//   ? U
//   : never;

/**
 * Any prop of a root
 */
export type rootPropType = keyof HCCard.Any;
export const isRootPropType = (value: any): value is rootPropType => rootPropOrder.includes(value);
/**
 * The exact value that corresponds to {@link rootPropType}. Use this if you're overwriting lists/records wholesale
 */
export type rootValueType<K extends rootPropType> = Exclude<HCCard.Any[K], undefined>;
/**
 * The value that corresponds to {@link rootPropType}. For arrays other than color ones and `base_tags`, uses the value of members of that array
 */
export type rootElementValueType<K extends rootPropType> = K extends 'artist_notes'
  ? [string, string]
  : K extends 'colors' | 'color_identity' | 'color_identity_hybrid' | 'base_tags'
  ? // | 'all_parts'
    Exclude<HCCard.Any[K], undefined>
  : Exclude<HCCard.Any[K], undefined> extends Array<infer U>
  ? U
  : Exclude<HCCard.Any[K], undefined>;

type IntersectKeys<T, U> = Pick<T, keyof T & keyof U>;

/**
 * An object that represents a generic card face. Only contains props that are on both {@link HCCardFace.MultiFaced} and {@link HCCard.AnySingleFaced}
 */
export type faceType = Omit<
  IntersectKeys<HCCardFace.MultiFaced, HCCard.AnySingleFaced>,
  'object' | 'layout'
> & { layout?: HCLayout; object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace };

/**
 * Any prop of a face
 */
export type facePropType = keyof faceType;
export const isFacePropType = (value: any): value is facePropType => facePropOrder.includes(value);
/**
 * The exact value that corresponds to {@link facePropType}. Use this if you're overwriting lists/records wholesale
 */
export type faceValueType<K extends facePropType> = Exclude<faceType[K], undefined>;
/**
 * The value that corresponds to {@link facePropType}. For arrays other than color ones and `attraction_lights`, uses the value of members of that array
 */
export type faceElementValueType<K extends facePropType> = K extends
  | 'colors'
  | 'color_indicator'
  // | ''
  // | 'supertypes'
  // | 'types'
  // | 'subtypes'
  | 'attraction_lights'
  ? Exclude<faceType[K], undefined>
  : Exclude<faceType[K], undefined> extends Array<infer U>
  ? U
  : Exclude<faceType[K], undefined>;

// export type faceElementValueType<K extends facePropType> =
// // K extends 'colors'
//   // ? Exclude<faceType[K], undefined>
//   // :
//   Exclude<faceType[K], undefined> extends Array<infer U>
//   ? U
//   : Exclude<faceType[K], undefined>;

/**
 * An object that represents a generic card or card face. Only contains props that are on both {@link HCCardFace.MultiFaced} and {@link HCCard.Any}
 */
export type allType = Omit<IntersectKeys<faceType, HCCard.AnyMultiFaced>, 'object' | 'layout'> & {
  layout?: HCLayout;
  object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace;
};
/**
 * Any prop that can be all cards and faces
 */
export type allPropType = keyof allType;
export const isAllPropType = (value: any): value is allPropType =>
  rootPropOrder.includes(value) && facePropOrder.includes(value);
/**
 * The exact value that corresponds to {@link allPropType}. Use this if you're overwriting lists/records wholesale
 */
export type allValueType<K extends allPropType> = Exclude<allType[K], undefined>;
/**
 * The value that corresponds to {@link allPropType}. For arrays, uses the value of members of that array
 */
export type allElementValueType<K extends keyof allType> = Exclude<
  allType[K],
  undefined
> extends Array<infer U>
  ? U
  : Exclude<allType[K], undefined>;

// export type cardFaceType = { [F in facePropType]: faceElementValueType<F> /* & {layout?: HCLayout} */ };
// export type faceType = HCCard.AnySingleFaced | HCCardFace.MultiFaced;
// export type cardObjectType = {
//   [K in propType]?: valueType<K>;
// } & {
// //   layout?: HCLayout;
// //   card_faces: cardFaceType[];
// // };

/**
 * Any prop of a related card
 */
export type partPropType = keyof HCRelatedCard;
export const isPartPropType = (value: any): value is partPropType => partPropOrder.includes(value);
/**
 * The value that corresponds to {@link partPropType}.
 */
export type partValueType<K extends partPropType> = HCRelatedCard[K];

/**
 * An object that maps {@link anyPropType} to {@link anyValueType}
 */
export type anyMappedType = { [K in anyPropType]?: anyValueType<K> };
/**
 * An object that maps {@link anyPropType} to {@link anyElementValueType}
 */
export type anyElementMappedType = { [K in anyPropType]?: anyElementValueType<K> };
/**
 * An object that maps {@link rootPropType} to {@link rootValueType}
 */
export type rootMappedType = { [K in rootPropType]?: rootValueType<K> };
/**
 * An object that maps {@link rootPropType} to {@link rootElementValueType}
 */
export type rootElementMappedType = { [K in rootPropType]?: rootElementValueType<K> };
/**
 * An object that maps {@link facePropType} to {@link faceValueType}
 */
export type faceMappedType = { [K in facePropType]?: faceValueType<K> };
/**
 * An object that maps {@link facePropType} to {@link faceElementValueType}
 */
export type faceElementMappedType = { [K in facePropType]?: faceElementValueType<K> };
/**
 * An object that maps {@link partPropType} to {@link partValueType}
 */
export type partMappedType = { [K in partPropType]?: partValueType<K> };

/**
 * The return type of calling {@link Object.entries()} on {@link anyMappedType}
 */
export type anyEntriesType = { [K in anyPropType]: [K, anyValueType<K>] }[anyPropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link anyElementMappedType}
 */
export type anyElementEntriesType = {
  [K in anyPropType]: [K, anyElementValueType<K>];
}[anyPropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link rootMappedType}
 */
export type rootEntriesType = { [K in rootPropType]: [K, rootValueType<K>] }[rootPropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link rootElementMappedType}
 */
export type rootElementEntriesType = {
  [K in rootPropType]: [K, rootElementValueType<K>];
}[rootPropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link faceMappedType}
 */
export type faceEntriesType = { [K in facePropType]: [K, faceValueType<K>] }[facePropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link faceElementMappedType}
 */
export type faceElementEntriesType = {
  [K in facePropType]: [K, faceElementValueType<K>];
}[facePropType][];
/**
 * The return type of calling {@link Object.entries()} on {@link partMappedType}
 */
export type partEntriesType = { [K in partPropType]: [K, partValueType<K>] }[partPropType][];

/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getAnyEntries = (record: anyMappedType) => Object.entries(record) as anyEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getAnyElementEntries = (record: anyElementMappedType) =>
  Object.entries(record) as anyElementEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getRootEntries = (record: rootMappedType) => Object.entries(record) as rootEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getRootElementEntries = (record: rootElementMappedType) =>
  Object.entries(record) as rootElementEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getFaceEntries = (record: faceMappedType) => Object.entries(record) as faceEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getFaceElementEntries = (record: faceElementMappedType) =>
  Object.entries(record) as faceElementEntriesType;
/**
 * A properly typed version of calling `Object.entries()` on a mapped type
 * @param record The record to get the entries of
 */
export const getPartEntries = (record: partMappedType) => Object.entries(record) as partEntriesType;
