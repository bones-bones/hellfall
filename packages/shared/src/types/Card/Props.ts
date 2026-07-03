import type { HCObject } from '../Object';
import type { HCCard } from './Card';
import type { HCCardFace } from './CardFace';
import type { HCRelatedCard } from './RelatedCard';
import type { HCLayout } from './values';

/**
 * Any prop of a card or face
 */
export type anyPropType =
  | keyof HCCard.AnySingleFaced
  | keyof HCCard.AnyMultiFaced
  | keyof HCCardFace.MultiFaced;

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
