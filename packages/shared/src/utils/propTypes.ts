import { HCCard, HCCardFace, HCLayout, HCObject, HCRelatedCard } from '../types';

export type propType = keyof HCCard.AnySingleFaced | keyof HCCard.AnyMultiFaced;
export type excludePropType = Exclude<propType, 'layout' | 'card_faces'>;

export type valueType<K extends propType> = K extends keyof HCCard.AnySingleFaced
  ? HCCard.AnySingleFaced[K]
  : K extends keyof HCCard.AnyMultiFaced
  ? HCCard.AnyMultiFaced[K]
  : never;

export type arrayElementType<K extends propType> = Exclude<valueType<K>, undefined> extends Array<
  infer U
>
  ? U
  : never;

type FaceProps = keyof HCCardFace.MultiFaced;
type CardProps = keyof HCCard.AnySingleFaced;
type Conflicting = Omit<HCCardFace.MultiFaced, 'object'> & Omit<HCCard.AnySingleFaced, 'object'>;

export type colorPropType = 'colors' | 'color_indicator';
export type facePropType = keyof HCCardFace.MultiFaced;
// export type excludeFacePropType = Exclude<facePropType, 'layout'>;
export type faceValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
export type faceArrayElementType<K extends keyof HCCardFace.MultiFaced> = Exclude<
  HCCardFace.MultiFaced[K],
  undefined
> extends Array<infer U>
  ? U
  : never;

type IntersectKeys<T, U> = Pick<T, keyof T & keyof U>;
export type bothType = Omit<
  IntersectKeys<HCCardFace.MultiFaced, HCCard.AnySingleFaced>,
  'object' | 'layout'
> & { layout?: HCLayout; object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace };

export type bothPropType = keyof bothType;
// export type excludeFacePropType = Exclude<facePropType, 'layout'>;
export type bothValueType<K extends bothPropType> = Exclude<bothType[K], undefined> extends Array<
  infer U
>
  ? U
  : Exclude<bothType[K], undefined>;

export type allType = Omit<IntersectKeys<bothType, HCCard.AnyMultiFaced>, 'object' | 'layout'> & {
  layout?: HCLayout;
  object: HCObject.ObjectType.Card | HCObject.ObjectType.CardFace;
};
export type allPropType = keyof allType;
export type allValueType<K extends keyof allType> = Exclude<allType[K], undefined> extends Array<
  infer U
>
  ? U
  : Exclude<allType[K], undefined>;

export type cardFaceType = { [F in facePropType]: faceValueType<F> /* & {layout?: HCLayout} */ };

export type cardObjectType = {
  [K in excludePropType]?: valueType<K>;
} & {
  layout?: HCLayout;
  card_faces: cardFaceType[];
};

export type partPropType = keyof HCRelatedCard;
export type partValueType<K extends partPropType> = HCRelatedCard[K];
