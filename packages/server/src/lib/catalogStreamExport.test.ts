import assert from 'node:assert/strict';
import { Transform, Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { gunzipSync } from 'node:zlib';
import { describe, it } from 'node:test';
import { gzipCatalogCardsToStream } from './catalogStreamExport.ts';

async function* fromArray<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

describe('gzipCatalogCardsToStream', () => {
  it('writes a gzip JSON array without buffering cards on the writable', async () => {
    const cards = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
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

    assert.equal(cardCount, 2);
    assert.deepEqual(parsed, { data: cards });
  });

  it('writes an empty data array', async () => {
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
    assert.deepEqual(parsed, { data: [] });
  });

  it('pipes through a Transform without buffering the full gzip', async () => {
    const cards = [{ id: 'a', name: 'Alpha' }];
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
    assert.deepEqual(parsed, { data: cards });
  });
});
