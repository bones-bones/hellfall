import type { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { toFaces } from '../cardHandling';
import { applyChanges, normalizeChangeList } from './changeHandling';
import type { anyChange, ChangesetDiffRow, allPartsChange } from './changeTypes';
import { splitFullTag } from './tagHandling';
import { changeIsValid, getPartChangeIndex } from './changeValidation';

function humanizeField(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Compact one-line label for a related-card entry in changeset diffs. */
function formatRelatedCardDisplay(part: HCRelatedCard): string {
  const component = part.component?.replace(/_/g, ' ');
  const setLine =
    part.set != null && part.collector_number != null
      ? `, ${part.set} #${part.collector_number}`
      : '';
  const componentLine = component ? ` (${component})` : '';
  return `${part.name}${setLine}${componentLine}`;
}

function readAllPartsDisplayValue(card: HCCard.Any, change: allPartsChange): unknown {
  if (change.change_type === 'delete') {
    if (!card.all_parts?.length) return undefined;
    const index = getPartChangeIndex(card, change);
    const part = index != null ? card.all_parts[index] : undefined;
    return part ? formatRelatedCardDisplay(part) : change.id ?? undefined;
  }

  // add / update — resolve the single affected part, never the whole all_parts array
  if (!change.related) return undefined;
  const index = getPartChangeIndex(card, change);
  const part = index != null ? card.all_parts?.[index] : undefined;
  return part ? formatRelatedCardDisplay(part) : undefined;
}

export function changeFieldLabel(change: anyChange): string {
  switch (change.location) {
    case 'root':
      return humanizeField(String(change.prop));
    case 'face': {
      const suffix = change.index != null && change.index > 0 ? ` (face ${change.index + 1})` : '';
      return `${humanizeField(String(change.prop))}${suffix}`;
    }
    case 'tag':
      return 'Tag';
    case 'card_faces':
      return `Face ${change.index + 1}`;
    case 'all_parts':
      return 'Related card';
    case 'card':
      return change.change_type === 'add' ? 'Create card' : 'Delete card';
  }
}

function readChangeDisplayValue(card: HCCard.Any, change: anyChange): unknown {
  switch (change.location) {
    case 'root':
      return (card as Record<string, unknown>)[change.prop];
    case 'face': {
      const face = toFaces(card)[change.index ?? 0];
      return face ? (face as Record<string, unknown>)[change.prop] : undefined;
    }
    case 'tag': {
      if (change.change_type == 'delete') {
        const deletedTags = card.base_tags?.filter(
          full_tag => splitFullTag(full_tag).tag == (change.tag ?? change.full_tag)
        );
        if (deletedTags && deletedTags.length) {
          return deletedTags;
        }
      }
      return card.base_tags?.includes(change.full_tag) ? change.full_tag : undefined;
    }
    case 'card_faces': {
      if (!('card_faces' in card)) return undefined;
      const face = card.card_faces[change.index];
      return face?.name ?? face;
    }
    case 'all_parts':
      return readAllPartsDisplayValue(card, change);
    case 'card':
      return card.name ?? card.hcid ?? card.id;
  }
}

function cardDocumentDiffRows(
  card: HCCard.Any | null,
  change: Extract<anyChange, { location: 'card' }>
): ChangesetDiffRow[] {
  if (change.change_type === 'add' && change.card) {
    const payload = change.card;
    return [
      { field: 'Create card', before: undefined, after: payload.name },
      { field: 'Set', before: undefined, after: payload.set },
      { field: 'Creators', before: undefined, after: payload.creators },
      { field: 'Kind', before: undefined, after: payload.kind },
      { field: 'Image', before: undefined, after: payload.image },
      { field: 'HCID', before: undefined, after: payload.hcid },
    ];
  }
  if (change.change_type === 'delete' && card) {
    return [
      {
        field: 'Delete card',
        before: card.name ?? card.hcid ?? card.id,
        after: undefined,
      },
    ];
  }
  return [{ field: changeFieldLabel(change), before: undefined, after: undefined }];
}

/** Field-level before/after rows for a changeset against the current card state. */
export function getChangesetDiffRows(
  card: HCCard.Any | null,
  changes: unknown
): ChangesetDiffRow[] {
  const normalized = normalizeChangeList(changes);
  const cardDoc = normalized.find(change => change.location === 'card');
  if (cardDoc) {
    return cardDocumentDiffRows(card, cardDoc);
  }
  if (!card) {
    return [];
  }
  const working = structuredClone(card);
  const rows: ChangesetDiffRow[] = [];

  for (const change of normalized) {
    if (!changeIsValid(working, change)) {
      continue;
    }
    const before = readChangeDisplayValue(working, change);
    const preview = structuredClone(working);
    applyChanges(preview, [change]);
    const after = readChangeDisplayValue(preview, change);
    rows.push({
      field: changeFieldLabel(change),
      before,
      after,
    });
    applyChanges(working, [change]);
  }

  return rows;
}

export function formatChangesetDiffValue(val: unknown): string {
  if (val == null || val === '') return '(empty)';
  if (Array.isArray(val)) {
    return (
      val
        .map(item =>
          item != null && typeof item === 'object' ? JSON.stringify(item) : String(item)
        )
        .join(', ') || '(empty)'
    );
  }
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}
