import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getAcceptedOrderSet, toSetCode } from '@hellfall/shared/utils';
import { acceptedOrderInt, setsSharingAcceptedOrder } from './acceptedOrder.ts';

describe('acceptedOrderInt', () => {
  it('parses plain integers and leading digits on variants', () => {
    assert.equal(acceptedOrderInt('12'), 12);
    assert.equal(acceptedOrderInt('38b'), 38);
    assert.equal(acceptedOrderInt(7), 7);
    assert.equal(acceptedOrderInt(''), 0);
    assert.equal(acceptedOrderInt(undefined), 0);
  });
});

describe('setsSharingAcceptedOrder', () => {
  it('includes veto subsets that share an accepted-order bucket', () => {
    const code = toSetCode('HLC_0');
    assert.ok(code);
    const shared = setsSharingAcceptedOrder(code);
    assert.ok(shared.includes('HLC_0'));
    assert.ok(shared.includes('HCV_1_0'));
    for (const set of shared) {
      const asCode = toSetCode(set);
      assert.ok(asCode);
      assert.equal(getAcceptedOrderSet(asCode), getAcceptedOrderSet(code));
    }
  });

  it('falls back to the raw set id when unknown', () => {
    assert.deepEqual(setsSharingAcceptedOrder('NOT_A_SET'), ['NOT_A_SET']);
  });
});
