import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  Timestamp,
} from '@google-cloud/firestore';
import { anyValueType, anyPropType, getAnyEntries, anyMappedType } from '@hellfall/shared/types';
import { Changeset } from '../changeHandling';

/**
 * The exact value that corresponds to {@linkcode anyPropType} in firestore.
 * Use this for {@linkcode cardUpdate}
 * @template K the type of the prop to get the type of value for
 */
export type fireValueType<K extends anyPropType> = K extends 'color_identity_hybrid'
  ? string
  : anyValueType<K>;

/**
 * A card update object
 */
export type cardUpdate = { [K in anyPropType]?: fireValueType<K> | FieldValue } & {
  last_modified?: FieldValue;
};

/**
 * A firestore card
 */
export type firestoreCard = { [K in anyPropType]?: fireValueType<K> } & {
  last_modified?: Timestamp;
};

/**
 * A collection of firestore cards
 */
export type cardsCollection = CollectionReference<firestoreCard, firestoreCard>;

/**
 * A collection of changesets
 */
export type changesetCollection = CollectionReference<Changeset, Changeset>;

export type cardDocRefType = DocumentReference<firestoreCard, firestoreCard>;

/**
 * A properly typed version of calling `Object.entries()` on {@linkcode firestoreCard}
 * @param card The card to get the entries of
 */
export const getFireEntries = (card: firestoreCard) => getAnyEntries(card as anyMappedType);
