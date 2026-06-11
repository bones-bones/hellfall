import { anyPropType, getFireEntries, updateValueType } from '../cardHandling';
import { FieldValue } from '@google-cloud/firestore';
import { arbAreEqual } from '../listHandling';
import { firestoreCard } from './firestoreTypes';

export type cardUpdate = { [K in anyPropType]?: updateValueType<K> | FieldValue };

const deleteField = FieldValue.delete();

export const getUpdateObject = (oldCard: firestoreCard, newCard: firestoreCard): cardUpdate => {
  const update: cardUpdate = {};
  getFireEntries(newCard).forEach(([prop, value]) => {
    if (!arbAreEqual(value, oldCard[prop])) {
      if (value != undefined) {
        (update as any)[prop] = value;
      } else {
        update[prop] = deleteField;
      }
    }
  });
  getFireEntries(oldCard).forEach(([prop, value]) => {
    if (!(prop in newCard)) {
      (update as any)[prop] = deleteField;
    }
  });
  return update;
};
