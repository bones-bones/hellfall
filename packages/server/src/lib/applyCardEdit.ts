import { FieldValue } from '@google-cloud/firestore';
import type { HCCard } from '@hellfall/shared/types';
import type { anyChange } from '@hellfall/shared/utils';
import {
  applyFromCollection,
  cardToFirestore,
  cardsCollection,
  firestoreToCard,
  getUpdateObject,
} from '@hellfall/shared/utils/firestore';

/** Apply ops to the live card document. Does not write a review changeset. */
export async function applyCardEdit(
  cardsCol: cardsCollection,
  cardId: string,
  changes: anyChange[]
): Promise<HCCard.Any> {
  const cardRef = cardsCol.doc(cardId);
  const snap = await cardRef.get();
  const fire = snap.data();
  if (!snap.exists || !fire) {
    throw new Error('card_not_found');
  }
  const card = firestoreToCard(fire);
  const updated = structuredClone(card);
  await applyFromCollection(updated, changes, cardsCol);
  const update = getUpdateObject(fire, cardToFirestore(updated));
  update.last_modified = FieldValue.serverTimestamp();
  await cardRef.update(update);
  return updated;
}
