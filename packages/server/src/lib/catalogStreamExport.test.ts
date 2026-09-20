import assert from 'node:assert/strict';
import { Transform, Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { gunzipSync } from 'node:zlib';
import { describe, it } from 'node:test';
import { CardMap } from '@hellfall/shared/utils';
import { gzipCatalogCardsToStream } from './catalogStreamExport.ts';

async function* fromArray<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

function sampleCard(overrides: Partial<{ id: string; name: string; oracle_id: string }> = {}) {
  const id = overrides.id ?? 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const name = overrides.name ?? 'Alpha';
  return {
    object: 'card' as const,
    id,
    oracle_id: overrides.oracle_id ?? `oracle-${id}`,
    name,
    hcid: name,
    set: 'hcs' as const,
    collector_number: '1',
    layout: 'normal' as const,
  };
}

describe('gzipCatalogCardsToStream', () => {
  it('writes a gzip fullCache without buffering cards on the writable', async () => {
    const cards = [
      sampleCard({ id: 'a', name: 'Alpha', oracle_id: 'oa' }),
      sampleCard({ id: 'b', name: 'Beta', oracle_id: 'ob' }),
    ];
    const chunks: Buffer[] = [];
    const dest = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk as Buffer);
        cb();
      },
    });

    const { cardCount } = await gzipCatalogCardsToStream(fromArray(cards), dest);
    const parsed = JSON.parse(gunzipSync(Buffer.concat(chunks)).toString('utf-8'));
    const map = new CardMap(parsed);

    assert.equal(cardCount, 2);
    assert.ok('idMap' in parsed);
    assert.ok('nameMap' in parsed);
    assert.ok('oracleMap' in parsed);
    assert.equal(map.size, 2);
    assert.equal(map.get('a')?.name, 'Alpha');
    assert.equal(map.getFromName('Beta')?.id, 'b');
  });

  it('writes an empty fullCache', async () => {
    const chunks: Buffer[] = [];
    const dest = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk as Buffer);
        cb();
      },
    });

    const { cardCount } = await gzipCatalogCardsToStream(fromArray([]), dest);
    const parsed = JSON.parse(gunzipSync(Buffer.concat(chunks)).toString('utf-8'));

    assert.equal(cardCount, 0);
    assert.deepEqual(parsed.idMap, {});
    assert.deepEqual(parsed.oracleMap, {});
    assert.ok('nameMap' in parsed);
  });

  it('pipes through a Transform without buffering the full gzip', async () => {
    const cards = [sampleCard({ id: 'a', name: 'Alpha', oracle_id: 'oa' })];
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk as Buffer);
        cb();
      },
    });
    const counter = new Transform({
      transform(chunk, _enc, cb) {
        cb(null, chunk);
      },
    });
    counter.pipe(sink);

    const { cardCount } = await gzipCatalogCardsToStream(fromArray(cards), counter);
    await finished(sink);
    const parsed = JSON.parse(gunzipSync(Buffer.concat(chunks)).toString('utf-8'));

    assert.equal(cardCount, 1);
    assert.equal(parsed.idMap.a.name, 'Alpha');
    assert.deepEqual(parsed.oracleMap.oa, ['a']);
  });
});
