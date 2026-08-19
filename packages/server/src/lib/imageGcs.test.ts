import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseImageBase64 } from './imageGcs.ts';

const GIF = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(24)]);
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(24),
]);

describe('parseImageBase64', () => {
  it('sniffs gif raw base64 instead of defaulting to png', () => {
    const parsed = parseImageBase64(GIF.toString('base64'));
    assert.equal(parsed.contentType, 'image/gif');
    assert.equal(parsed.extension, '.gif');
  });

  it('sniffs png magic', () => {
    const parsed = parseImageBase64(PNG.toString('base64'));
    assert.equal(parsed.contentType, 'image/png');
    assert.equal(parsed.extension, '.png');
  });

  it('uses imageMimeType when bytes are not sniffable', () => {
    const parsed = parseImageBase64(Buffer.from('not-an-image').toString('base64'), 'image/gif');
    assert.equal(parsed.contentType, 'image/gif');
    assert.equal(parsed.extension, '.gif');
  });

  it('prefers magic bytes over a wrong mime', () => {
    const parsed = parseImageBase64(GIF.toString('base64'), 'image/png');
    assert.equal(parsed.contentType, 'image/gif');
    assert.equal(parsed.extension, '.gif');
  });

  it('reads mime from a data URL', () => {
    const parsed = parseImageBase64(
      `data:image/webp;base64,${Buffer.from('xxxx').toString('base64')}`
    );
    assert.equal(parsed.contentType, 'image/webp');
    assert.equal(parsed.extension, '.webp');
  });
});
