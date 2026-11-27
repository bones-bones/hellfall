import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CardMap } from '@hellfall/shared/utils';
import {
  cardMapFromCatalogJson,
  getCardMap,
  releaseServerCardMap,
  reloadServerCardMap,
  seedServerCardMapForTests,
} from './serverCardMap.ts';

function sampleFullCache() {
  return {
    idMap: {
      a: {
        object: 'card' as const,
        id: 'a',
        oracle_id: 'oa',
        name: 'Alpha',
        hcid: 'Alpha',
        set: 'hcs' as const,
        collector_number: '1',
        layout: 'normal' as const,
      },
      b: {
        object: 'card' as const,
        id: 'b',
        oracle_id: 'ob',
        name: 'Beta',
        hcid: 'Beta',
        set: 'hcs' as const,
        collector_number: '2',
        layout: 'normal' as const,
      },
    },
    nameMap: {},
    aliasMap: {},
    hcidMap: {},
    oracleMap: { oa: ['a'], ob: ['b'] },
  };
}

describe('cardMapFromCatalogJson', () => {
  it('builds a CardMap from fullCache JSON', () => {
    const map = cardMapFromCatalogJson(sampleFullCache());
    assert.ok(map instanceof CardMap);
    assert.equal(map.size, 2);
    assert.equal(map.get('a')?.name, 'Alpha');
    assert.equal(map.get('b')?.oracle_id, 'ob');
  });

  it('builds a CardMap from a card array', () => {
    const map = cardMapFromCatalogJson([
      {
        object: 'card',
        id: 'c',
        oracle_id: 'oc',
        name: 'Gamma',
        hcid: 'Gamma',
        set: 'hcs',
        collector_number: '3',
        layout: 'normal',
      },
    ]);
    assert.equal(map.size, 1);
    assert.equal(map.getFromName('Gamma')?.id, 'c');
  });

  it('builds a CardMap from { data }', () => {
    const map = cardMapFromCatalogJson({
      data: [
        {
          object: 'card',
          id: 'd',
          oracle_id: 'od',
          name: 'Delta',
          hcid: 'Delta',
          set: 'hcs',
          collector_number: '4',
          layout: 'normal',
        },
      ],
    });
    assert.equal(map.size, 1);
    assert.equal(map.get('d')?.name, 'Delta');
  });
});

describe('getCardMap / release / reload', () => {
  it('coalesces concurrent getCardMap calls onto one instance', async () => {
    releaseServerCardMap();
    seedServerCardMapForTests(cardMapFromCatalogJson(sampleFullCache()));
    const [a, b] = await Promise.all([getCardMap(), getCardMap()]);
    assert.equal(a, b);
    assert.equal(a.size, 2);
  });

  it('returns the cached instance until release', async () => {
    releaseServerCardMap();
    seedServerCardMapForTests(cardMapFromCatalogJson(sampleFullCache()));
    const first = await getCardMap();
    const second = await getCardMap();
    assert.equal(first, second);

    releaseServerCardMap();
    seedServerCardMapForTests(cardMapFromCatalogJson(sampleFullCache()));
    const third = await getCardMap();
    assert.notEqual(first, third);
    assert.equal(third.size, 2);
  });

  it('reloadServerCardMap replaces the resident map', async () => {
    // Force bundled fallback (no network): empty object name that 404s is noisy;
    // seed then reload will hit GCS/bundled — skip GCS by temporarily clearing bucket via
    // seating after reload is hard. Instead verify release + get after seed cycle.
    releaseServerCardMap();
    const before = cardMapFromCatalogJson(sampleFullCache());
    seedServerCardMapForTests(before);
    assert.equal(await getCardMap(), before);

    releaseServerCardMap();
    const after = cardMapFromCatalogJson(sampleFullCache());
    seedServerCardMapForTests(after);
    assert.notEqual(before, after);
    assert.equal(await getCardMap(), after);
    // reloadServerCardMap exercises load path; only assert it returns a CardMap when
    // SERVER_CARDMAP_FORCE_BUNDLED is set (see below).
    process.env.SERVER_CARDMAP_FORCE_BUNDLED = '1';
    try {
      const reloaded = await reloadServerCardMap();
      assert.ok(reloaded instanceof CardMap);
      assert.ok(reloaded.size > 0);
      assert.equal(await getCardMap(), reloaded);
    } finally {
      delete process.env.SERVER_CARDMAP_FORCE_BUNDLED;
      releaseServerCardMap();
    }
  });
});
