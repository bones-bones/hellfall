import type { HCCard } from '@hellfall/shared/types';
import { applyChanges, changeIsValid, normalizeChangeList } from '@hellfall/shared/utils';
import type { anyChange } from '@hellfall/shared/utils';

export function getPrimaryImageUrl(card: HCCard.Any): string | undefined {
  if ('card_faces' in card && card.layout === 'meld_part' && card.card_faces[0]?.image) {
    return card.card_faces[0].image;
  }
  return card.image;
}

export function previewCardWithChanges(
  card: HCCard.Any,
  changes: anyChange[] | unknown
): HCCard.Any {
  const preview = structuredClone(card);
  const normalized = normalizeChangeList(changes);
  const applicable = normalized.filter(change => changeIsValid(preview, change));
  applyChanges(preview, applicable);
  return preview;
}
