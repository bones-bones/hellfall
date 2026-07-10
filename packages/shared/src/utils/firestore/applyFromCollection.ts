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
import { ensureRelatedPartsResolved, fetchRelatedCardsFromCollection } from './cardRefs';
import { cardToFirestore } from './cardConversion';

export const applyFromCollection = async (
  card: HCCard.Any,
  changeList: anyChange[],
  cardsCol: CollectionReference
) => {
  const oldParts = card.all_parts ? structuredClone(card.all_parts) : undefined;
  if (!applyChanges(card, changeList)) return;
  setDerivedProps(card);

  const oldRelatedMap = await fetchRelatedCardsFromCollection(
    { ...card, all_parts: oldParts },
    cardsCol
  );
  const newRelatedMap = await fetchRelatedCardsFromCollection(card, cardsCol);
  const allRelatedMap = new CardMap([...oldRelatedMap.cards(), ...newRelatedMap.cards()]);

  await ensureRelatedPartsResolved(card, allRelatedMap, cardsCol);

  updateParts(card, allRelatedMap);
  cleanParts(card, oldRelatedMap);

  await Promise.all(
    allRelatedMap.cards().map(related => cardsCol.doc(related.id).set(cardToFirestore(related)))
  );
};
