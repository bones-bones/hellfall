import { HCCard, HCCardFace, HCLayout, HCRelatedCard } from '../types';

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

export type facePropType = keyof HCCardFace.MultiFaced;
// export type excludeFacePropType = Exclude<facePropType, 'layout'>;
export type faceValueType<K extends facePropType> = HCCardFace.MultiFaced[K];
export type faceArrayElementType<K extends keyof HCCardFace.MultiFaced> = Exclude<
  HCCardFace.MultiFaced[K],
  undefined
> extends Array<infer U>
  ? U
  : never;

export type cardFaceType = { [F in facePropType]: faceValueType<F> /* & {layout?: HCLayout} */ };

export type cardObjectType = {
  [K in excludePropType]?: valueType<K>;
} & {
  layout?: HCLayout;
  card_faces: cardFaceType[];
};

export type partPropType = keyof HCRelatedCard;
export type partValueType<K extends partPropType> = HCRelatedCard[K];
