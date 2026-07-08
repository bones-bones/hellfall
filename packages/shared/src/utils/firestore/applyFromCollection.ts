import type { CollectionReference } from '@google-cloud/firestore';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '../cardHandling';
import {
  applyChanges,
  anyChange,
  setDerivedProps,
  cleanParts,
  updateParts,
} from '../changeHandling';
import { getAllRelatedCollection } from './cardRefs';
import { cardToFirestore, firestoreToCard } from './cardConversion';

/**
 * Updates a card along with its related cards
 * @param card card to apply the changes to
 * @param changeList changes to apply to the card
 * @param cardsCol the collection of cards
 */
export const applyFromCollection = async (
  card: HCCard.Any,
  changeList: anyChange[],
  cardsCol: CollectionReference
) => {
  const oldRelateds: ReturnType<typeof getAllRelatedCollection> = getAllRelatedCollection(
    card,
    cardsCol
  );
  if (!applyChanges(card, changeList)) return;
  const newRelateds = getAllRelatedCollection(card, cardsCol);
  setDerivedProps(card);
  const oldRelatedMap = new CardMap(
    await Promise.all(
      oldRelateds.map(async data => firestoreToCard((await data.get()).data() ?? {}))
    )
  );
  const newRelatedMap = new CardMap(
    await Promise.all(
      newRelateds.map(async data => firestoreToCard((await data.get()).data() ?? {}))
    )
  );
  const bothRelatedMap = oldRelatedMap.getSubset(newRelatedMap.ids());
  oldRelatedMap.deleteMultiple(bothRelatedMap.ids());
  newRelatedMap.deleteMultiple(bothRelatedMap.ids());
  updateParts(card, newRelatedMap);
  updateParts(card, bothRelatedMap);
  cleanParts(card, bothRelatedMap);
  cleanParts(card, oldRelatedMap);
  oldRelateds.forEach(
    async data =>
      await data.set(cardToFirestore(oldRelatedMap.get(data.id) ?? bothRelatedMap.get(data.id)!))
  );
  newRelateds.forEach(
    async data =>
      await data.set(cardToFirestore(newRelatedMap.get(data.id) ?? bothRelatedMap.get(data.id)!))
  );
};
