/**
 * Restore Hellscube-Database.json defaults for string fields omitted from Firestore
 * (migrate drops attributes whose value was "").
 */

const ROOT_STRING_DEFAULTS = [
  'collector_number',
  'mana_cost',
  'type_line',
  'oracle_text',
  'rulings',
] as const;

const FACE_STRING_DEFAULTS = ['name', 'mana_cost', 'type_line', 'oracle_text'] as const;

const RELATED_PART_STRING_DEFAULTS = ['id', 'hcid', 'name', 'type_line', 'set'] as const;

function hydrateStringsOnRecord(record: Record<string, unknown>, fields: readonly string[]): void {
  for (const key of fields) {
    if (record[key] === undefined || record[key] === null) {
      record[key] = '';
    }
  }
}

/** Fill missing catalog string fields with `""` so clients match bundled JSON shape. */
export function hydrateCatalogCard(card: Record<string, unknown>): void {
  hydrateStringsOnRecord(card, ROOT_STRING_DEFAULTS);

  if (Array.isArray(card.card_faces)) {
    for (const face of card.card_faces) {
      if (face && typeof face === 'object' && !Array.isArray(face)) {
        hydrateStringsOnRecord(face as Record<string, unknown>, FACE_STRING_DEFAULTS);
      }
    }
  }

  if (Array.isArray(card.all_parts)) {
    for (const part of card.all_parts) {
      if (part && typeof part === 'object' && !Array.isArray(part)) {
        hydrateStringsOnRecord(part as Record<string, unknown>, RELATED_PART_STRING_DEFAULTS);
      }
    }
  }
}
