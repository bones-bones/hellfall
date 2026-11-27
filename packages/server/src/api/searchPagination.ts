import type { HCCard } from '@hellfall/shared/types';

export const MAX_SEARCH_LIMIT = 200;

export type SearchPagination = {
  /** When null, return the full result set (no pagination). */
  limit: number | null;
  offset: number;
};

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Parse `offset` / `limit` from search query params.
 * - Absent `limit` → no pagination (full dump).
 * - Present non-negative integer `limit` → paginate; clamp to [0, MAX_SEARCH_LIMIT].
 * - `offset` defaults to 0; negatives clamp to 0.
 */
export function parseSearchPagination(
  query: Record<string, string | string[]> | undefined
): SearchPagination {
  const offsetRaw = firstQueryValue(query?.offset);
  let offset = 0;
  if (offsetRaw != null && /^-?\d+$/.test(offsetRaw)) {
    offset = Math.max(0, Number(offsetRaw));
  }

  const limitRaw = firstQueryValue(query?.limit);
  if (limitRaw == null || limitRaw === '' || !/^\d+$/.test(limitRaw)) {
    return { limit: null, offset };
  }

  return {
    limit: Math.min(MAX_SEARCH_LIMIT, Number(limitRaw)),
    offset,
  };
}

/** True when `exclude=offensive` (or includes that token) is requested. */
export function shouldExcludeOffensive(
  query: Record<string, string | string[]> | undefined
): boolean {
  const raw = firstQueryValue(query?.exclude);
  if (!raw) return false;
  return raw
    .split(',')
    .map(part => part.trim().toLowerCase())
    .includes('offensive');
}

export function filterOffensiveCards<T extends HCCard.Any>(cards: T[]): T[] {
  return cards.filter(card => !card.tags?.includes('offensive'));
}

/**
 * Slice already-sorted results. `total` is the pre-slice length.
 * No-ops when `limit` is null.
 */
export function sliceSearchResults<T>(
  results: T[],
  pagination: SearchPagination
): { data: T[]; total: number; offset?: number; limit?: number } {
  const total = results.length;
  if (pagination.limit == null) {
    return { data: results, total };
  }
  const { offset, limit } = pagination;
  return {
    data: results.slice(offset, offset + limit),
    total,
    offset,
    limit,
  };
}
