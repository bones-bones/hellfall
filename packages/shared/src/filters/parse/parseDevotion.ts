import { pipMap, pipsAreEqual } from '@hellfall/shared/utils';
import { makeDevotionFilter, makeInvalidFilter } from '../makers';
import { looseOpList, looseOpType, toDevotionFilterName } from '../types';
import { splitOnFirstOp } from '../utils';
import { invalidMixSummary } from '../filters';

export const parseDevotion = (keyword: string, op: looseOpType, term: string) => {
  if (keyword == 'dreadmaw') {
    return makeDevotionFilter(keyword, op, term);
  }
  if (looseOpList.some(loose => term.includes(loose))) {
    const { keyword: k, op: o, term: t } = splitOnFirstOp(term);
    return makeDevotionFilter(k, o, t);
  }
  const pips = pipMap.getPipsFromSearch(term);
  const invalids = pipMap.getNonPipsFromSearch(term);
  if (pips.length && !toDevotionFilterName(term)) {
    if (invalids.length) {
      return makeInvalidFilter(invalids.map(s => `{${s}}`).join(', '), 'pips');
    }
    if (pips.some(pip => !pipsAreEqual(pip, pips[0]))) {
      return makeInvalidFilter('', invalidMixSummary);
    }
    return makeDevotionFilter(pips[0].symbol, op, pips.length.toString());
  }
  return makeDevotionFilter(term, op);
};
