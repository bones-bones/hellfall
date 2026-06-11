import { CollectionReference } from '@google-cloud/firestore';
import { anyPropType, anyValueType } from '../cardHandling';
import { Changeset } from '../cardModification';

export type fireValueType<K extends anyPropType> = K extends 'color_identity_hybrid'
  ? string
  : anyValueType<K>;

export type firestoreCard = { [K in anyPropType]?: fireValueType<K> };

export type cardsCollection = CollectionReference<firestoreCard, firestoreCard>;

export type changesetCollection = CollectionReference<Changeset, Changeset>;
