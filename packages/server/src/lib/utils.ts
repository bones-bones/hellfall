import { CollectionReference, DocumentReference } from "@google-cloud/firestore";
import { HCCard } from "@hellfall/shared/types";
import { anyChange, applyChanges, CardMap, cardToFirestore, cleanParts, firestoreCard, firestoreToCard, setDerivedProps, updateParts } from "@hellfall/shared/utils";

export const getAllRelatedCollection = (card: HCCard.Any, cardsCol: CollectionReference) =>
  (card.all_parts?.map(part => part.id) ?? []).map(id => cardsCol.doc(id));

export const applyFromCollection = async (
  card: HCCard.Any,
  changeList: anyChange[],
  cardsCol: CollectionReference
) => {
  const oldRelateds: DocumentReference<firestoreCard, firestoreCard>[] = getAllRelatedCollection(
    card,
    cardsCol
  );
  if (!applyChanges(card, changeList)) return;
  const newRelateds = getAllRelatedCollection(card, cardsCol);
  setDerivedProps(card);
  const oldRelatedMap = new CardMap(
    await Promise.all(oldRelateds.map(async data => firestoreToCard(await data.get())))
  );
  const newRelatedMap = new CardMap(
    await Promise.all(newRelateds.map(async data => firestoreToCard(await data.get())))
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
