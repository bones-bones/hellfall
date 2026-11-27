import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HCCard } from '@hellfall/shared/types';
import {
  MAX_SEARCH_LIMIT,
  filterOffensiveCards,
  parseSearchPagination,
  shouldExcludeOffensive,
  sliceSearchResults,
} from './searchPagination.ts';

describe('parseSearchPagination', () => {
  it('returns null limit (full dump) when limit is absent', () => {
    assert.deepEqual(parseSearchPagination({}), { limit: null, offset: 0 });
    assert.deepEqual(parseSearchPagination(undefined), { limit: null, offset: 0 });
  });

  it('parses limit and offset', () => {
    assert.deepEqual(parseSearchPagination({ limit: '50', offset: '100' }), {
      limit: 50,
      offset: 100,
    });
  });

  it('clamps negative offset to 0', () => {
    assert.deepEqual(parseSearchPagination({ limit: '10', offset: '-5' }), {
      limit: 10,
      offset: 0,
    });
  });

  it('clamps limit to MAX_SEARCH_LIMIT', () => {
    assert.deepEqual(parseSearchPagination({ limit: '9999' }), {
      limit: MAX_SEARCH_LIMIT,
      offset: 0,
    });
  });

  it('treats non-numeric limit as absent (full dump)', () => {
    assert.deepEqual(parseSearchPagination({ limit: 'abc', offset: '2' }), {
      limit: null,
      offset: 2,
    });
  });

  it('accepts limit 0', () => {
    assert.deepEqual(parseSearchPagination({ limit: '0' }), { limit: 0, offset: 0 });
  });

  it('uses first value when query params are arrays', () => {
    assert.deepEqual(parseSearchPagination({ limit: ['50', '10'], offset: ['3'] }), {
      limit: 50,
      offset: 3,
    });
  });
});

describe('shouldExcludeOffensive / filterOffensiveCards', () => {
  it('detects exclude=offensive', () => {
    assert.equal(shouldExcludeOffensive({ exclude: 'offensive' }), true);
    assert.equal(shouldExcludeOffensive({ exclude: 'Offensive,other' }), true);
    assert.equal(shouldExcludeOffensive({ exclude: 'tokens' }), false);
    assert.equal(shouldExcludeOffensive({}), false);
  });

  it('filters cards tagged offensive', () => {
    const cards = [
      { id: 'a', tags: ['offensive'] },
      { id: 'b', tags: ['fun'] },
      { id: 'c' },
    ] as HCCard.Any[];
    assert.deepEqual(
      filterOffensiveCards(cards).map(c => c.id),
      ['b', 'c']
    );
  });
});

describe('sliceSearchResults', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('returns full list when limit is null', () => {
    assert.deepEqual(sliceSearchResults(items, { limit: null, offset: 10 }), {
      data: items,
      total: 5,
    });
  });

  it('slices after the given offset with limit', () => {
    assert.deepEqual(sliceSearchResults(items, { limit: 2, offset: 1 }), {
      data: ['b', 'c'],
      total: 5,
      offset: 1,
      limit: 2,
    });
  });

  it('returns empty data past the end while preserving total', () => {
    assert.deepEqual(sliceSearchResults(items, { limit: 50, offset: 100 }), {
      data: [],
      total: 5,
      offset: 100,
      limit: 50,
    });
  });
});
