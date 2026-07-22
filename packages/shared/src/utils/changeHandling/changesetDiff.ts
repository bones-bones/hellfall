import type { HCCard } from '@hellfall/shared/types';
import { toFaces } from '../cardHandling';
import { applyChanges, normalizeChangeList } from './changeHandling';
import type { anyChange, ChangesetDiffRow } from './changeTypes';
import { splitFullTag } from './tagHandling';
import { changeIsValid } from './changeValidation';

function humanizeField(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
      return change.part_prop ? humanizeField(change.part_prop) : 'Related card';
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
    case 'all_parts': {
      if (!card.all_parts?.length) return undefined;
      if (change.id) {
        const part = card.all_parts.find(p => p.id === change.id);
        return part?.name ?? part?.hcid ?? change.id;
      }
      return card.all_parts;
    }
  }
}

/** Field-level before/after rows for a changeset against the current card state. */
export function getChangesetDiffRows(card: HCCard.Any, changes: unknown): ChangesetDiffRow[] {
  const normalized = normalizeChangeList(changes);
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
  if (Array.isArray(val)) return val.map(String).join(', ') || '(empty)';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}
