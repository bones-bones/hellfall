import { FieldValue } from '@google-cloud/firestore';
import { arbAreEqual } from '../listHandling';
import { cardUpdate, firestoreCard, getFireEntries } from './firestoreTypes';

const deleteField = FieldValue.delete();

/**
 * Gets the appropriate {@linkcode cardUpdate} for two versions of a card
 *
 * This cuts down on db writes (as opposed to just wholesale overwriting everything)
 * @param oldCard the old version of the card
 * @param newCard the new version of the card
 */
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
