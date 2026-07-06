import { CollectionReference, FieldValue } from '@google-cloud/firestore';
import { anyValueType, anyPropType, getAnyEntries, anyMappedType } from '@hellfall/shared/types';
import { Changeset } from '../changeHandling';

/**
 * The exact value that corresponds to `anyPropType` in firestore. Use this for `cardUpdate`
 */
export type fireValueType<K extends anyPropType> = K extends 'color_identity_hybrid'
  ? string
  : anyValueType<K>;

export type cardUpdate = { [K in anyPropType]?: fireValueType<K> | FieldValue };

export type firestoreCard = { [K in anyPropType]?: fireValueType<K> };

export type cardsCollection = CollectionReference<firestoreCard, firestoreCard>;

export type changesetCollection = CollectionReference<Changeset, Changeset>;
/**
 * A properly typed version of calling `Object.entries()` on `firestoreCard`
 * @param card The card to get the entries of
 */
export const getFireEntries = (card: firestoreCard) => getAnyEntries(card as anyMappedType);
