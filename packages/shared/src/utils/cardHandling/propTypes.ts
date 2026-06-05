import { HCCard, HCCardFace, HCLayout, HCObject, HCRelatedCard } from '@hellfall/shared/types';

export type anyPropType =
  | keyof HCCard.AnySingleFaced
  | keyof HCCard.AnyMultiFaced
  | keyof HCCardFace.MultiFaced;

export type anyValueType<K extends anyPropType> = K extends keyof HCCard.AnySingleFaced
  ? HCCard.AnySingleFaced[K]
  : K extends keyof HCCard.AnyMultiFaced
  ? HCCard.AnyMultiFaced[K]
  : K extends keyof HCCardFace.MultiFaced
  ? HCCardFace.MultiFaced[K]
  : never;

export type anyArrayElementType<K extends anyPropType> = Exclude<
  anyValueType<K>,
  undefined
> extends Array<infer U>
  ? U
  : never;

export type colorPropType = 'colors' | 'color_indicator';
// export type facePropType = keyof HCCardFace.MultiFaced;
// // export type excludeFacePropType = Exclude<facePropType, 'layout'>;
// export type faceValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
// export type faceArrayElementType<K extends keyof HCCardFace.MultiFaced> = Exclude<
//   HCCardFace.MultiFaced[K],
//   undefined
// > extends Array<infer U>
//   ? U
//   : never;

type IntersectKeys<T, U> = Pick<T, keyof T & keyof U>;
export type faceType = Omit<
  IntersectKeys<HCCardFace.MultiFaced, HCCard.AnySingleFaced>,
  'object' | 'layout'
> & { layout?: HCLayout; object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace };

export type facePropType = keyof faceType;
// export type excludeFacePropType = Exclude<facePropType, 'layout'>;
export type defaultFaceValueType<K extends facePropType> = Exclude<faceType[K], undefined>;
export type faceValueType<K extends facePropType> = K extends
  | 'colors'
  | 'color_indicator'
  // | ''
  | 'supertypes'
  | 'types'
  | 'subtypes'
  | 'attraction_lights'
  ? Exclude<faceType[K], undefined>
  : Exclude<faceType[K], undefined> extends Array<infer U>
  ? U
  : Exclude<faceType[K], undefined>;

export type filterFaceValueType<K extends facePropType> = K extends 'colors'
  ? Exclude<faceType[K], undefined>
  : Exclude<faceType[K], undefined> extends Array<infer U>
  ? U
  : Exclude<faceType[K], undefined>;

// export type frontType = Omit<IntersectKeys<faceType, HCCard.AnyMultiFaced>, 'object' | 'layout'> & {
//   layout?: HCLayout
// };
export type rootPropType = keyof HCCard.Any;
export type defaultRootValueType<K extends rootPropType> = Exclude<HCCard.Any[K], undefined>;
export type rootValueType<K extends rootPropType> = K extends 'artist_notes'
  ? [string, string]
  : K extends
      | 'colors'
      | 'color_identity'
      | 'color_identity_hybrid'
      // | ''
      | 'supertypes'
      | 'types'
      | 'subtypes'
  ? // | 'all_parts'
    Exclude<HCCard.Any[K], undefined>
  : Exclude<HCCard.Any[K], undefined> extends Array<infer U>
  ? U
  : Exclude<HCCard.Any[K], undefined>;

export type allType = Omit<IntersectKeys<faceType, HCCard.AnyMultiFaced>, 'object' | 'layout'> & {
  layout?: HCLayout;
  object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace;
};
export type allPropType = keyof allType;
export type allValueType<K extends keyof allType> = Exclude<allType[K], undefined> extends Array<
  infer U
>
  ? U
  : Exclude<allType[K], undefined>;

// export type cardFaceType = { [F in facePropType]: faceValueType<F> /* & {layout?: HCLayout} */ };
// export type faceType = HCCard.AnySingleFaced | HCCardFace.MultiFaced;
// export type cardObjectType = {
//   [K in propType]?: valueType<K>;
// } & {
// //   layout?: HCLayout;
// //   card_faces: cardFaceType[];
// // };

export type partPropType = keyof HCRelatedCard;
export type partValueType<K extends partPropType> = HCRelatedCard[K];

export type rootMappedType = { [K in rootPropType]?: defaultRootValueType<K> };
export type faceMappedType = { [K in facePropType]?: defaultFaceValueType<K> };
export type partMappedType = { [K in partPropType]?: partValueType<K> };
export type anyMappedType = { [K in anyPropType]?: anyValueType<K> };

export type rootEntriesType = { [K in rootPropType]: [K, rootValueType<K>] }[rootPropType][];
export type faceEntriesType = { [K in facePropType]: [K, faceValueType<K>] }[facePropType][];
export type partEntriesType = { [K in partPropType]: [K, partValueType<K>] }[partPropType][];
export type anyEntriesType = { [K in anyPropType]: [K, anyValueType<K>] }[anyPropType][];
