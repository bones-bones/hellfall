import { HCCard } from '@hellfall/shared/types';

/** Turn literal `\n` sequences into real newlines (bad GCS catalog data). */
const unescapeNewlines = (text: string): string => text.replaceAll('\\n', '\n');

/**
 * Normalize escaped newlines on card / face text fields in place.
 * Safe no-op when fields already use real newlines.
 */
export const unescapeCardNewlines = <T extends HCCard.Any>(card: T): T => {
  const root = card as HCCard.Any & {
    oracle_text?: string;
    flavor_text?: string;
  };
  if (typeof root.oracle_text === 'string') {
    root.oracle_text = unescapeNewlines(root.oracle_text);
  }
  if (typeof root.flavor_text === 'string') {
    root.flavor_text = unescapeNewlines(root.flavor_text);
  }
  if (typeof card.rulings === 'string') {
    card.rulings = unescapeNewlines(card.rulings);
  }
  if ('card_faces' in card && Array.isArray(card.card_faces)) {
    for (const face of card.card_faces) {
      if (typeof face.oracle_text === 'string') {
        face.oracle_text = unescapeNewlines(face.oracle_text);
      }
      if (typeof face.flavor_text === 'string') {
        face.flavor_text = unescapeNewlines(face.flavor_text);
      }
    }
  }
  return card;
};
