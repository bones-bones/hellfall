import { anyPropType, anyValueType } from '../cardHandling';

export type fireValueType<K extends anyPropType> = K extends 'color_identity_hybrid'
  ? string
  : anyValueType<K>;

export type firestoreCard = { [K in anyPropType]?: fireValueType<K> };
