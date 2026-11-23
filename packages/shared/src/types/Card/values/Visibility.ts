/**
 * Catalog visibility for a card document.
 * Absent/`live` = included in the published catalog; `pending` = hidden until accept.
 */
export type HCVisibility = 'pending' | 'live';

export const visibilityList: HCVisibility[] = ['pending', 'live'];

export const isVisibility = (value: unknown): value is HCVisibility =>
  typeof value === 'string' && visibilityList.includes(value as HCVisibility);

/** Missing visibility is treated as live (legacy cards). */
export const isCardCatalogVisible = (card: { visibility?: string }): boolean =>
  card.visibility !== 'pending';
