import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { CardMap } from '@hellfall/shared/utils';
import { releaseServerCardMap, seedServerCardMapForTests } from '../lib/serverCardMap.ts';
import { cardByHcidHandler, cardPrintsHandler } from './cardData.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

function sampleMap() {
  return new CardMap([
    {
      object: 'card',
      id: 'id-alpha',
      oracle_id: 'oracle-a',
      name: 'Alpha Card',
      hcid: '42',
      set: 'hcs',
      collector_number: '1',
      layout: 'normal',
      creators: [],
      legalities: { standard: 'legal', '4cb': 'legal', commander: 'legal' },
    },
    {
      object: 'card',
      id: 'id-alpha-2',
      oracle_id: 'oracle-a',
      name: 'Alpha Card',
      hcid: '43',
      set: 'hcs',
      collector_number: '2',
      layout: 'normal',
      creators: [],
      legalities: { standard: 'legal', '4cb': 'legal', commander: 'legal' },
    },
  ] as never);
}

function mockRes(): HandlerResponse & {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {};
  return {
    statusCode: 0,
    body: '',
    headers,
    setHeader(k: string, v: string | number) {
      headers[k] = String(v);
    },
    end(chunk?: string | Buffer) {
      this.body = chunk?.toString() ?? '';
    },
  } as HandlerResponse & { statusCode: number; body: string; headers: Record<string, string> };
}

function mockReq(): HandlerRequest {
  return { headers: {}, method: 'GET', url: '/' } as HandlerRequest;
}

describe('cardByHcidHandler', () => {
  beforeEach(() => {
    seedServerCardMapForTests(sampleMap());
  });
  afterEach(() => {
    releaseServerCardMap();
  });

  it('resolves by HCID', async () => {
    const res = mockRes();
    await cardByHcidHandler(mockReq(), res, '42');
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.hcid, '42');
    assert.equal(body.name, 'Alpha Card');
  });

  it('resolves by name when HCID misses', async () => {
    const res = mockRes();
    await cardByHcidHandler(mockReq(), res, 'Alpha Card');
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.name, 'Alpha Card');
  });

  it('returns 404 for unknown', async () => {
    const res = mockRes();
    await cardByHcidHandler(mockReq(), res, 'nope');
    assert.equal(res.statusCode, 404);
  });
});

describe('cardPrintsHandler', () => {
  beforeEach(() => {
    seedServerCardMapForTests(sampleMap());
  });
  afterEach(() => {
    releaseServerCardMap();
  });

  it('returns all prints for oracle_id', async () => {
    const res = mockRes();
    await cardPrintsHandler(mockReq(), res, 'id-alpha');
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.object, 'list');
    assert.equal(body.total_cards, 2);
    assert.equal(body.data.length, 2);
  });
});
