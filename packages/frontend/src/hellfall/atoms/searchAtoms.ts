import { atom } from 'jotai';

const searchParams = new URLSearchParams(document.location.search);

export const nameSearchAtom = atom<string>(searchParams.get('name') || '');

export const idSearchAtom = atom<string>(searchParams.get('id') || '');

export const costSearchAtom = atom<string[]>(searchParams.get('cost')?.split(',') || []);

export const typeSearchAtom = atom<string[]>(searchParams.get('type')?.split(',') || []);

export const rulesSearchAtom = atom<string[]>(searchParams.get('rules')?.split(',') || []);

export const flavorSearchAtom = atom<string[]>(searchParams.get('flavor')?.split(',') || []);

export const creatorsAtom = atom(searchParams.get('creators')?.split(',,') || []);

export const tagsAtom = atom(searchParams.get('tags')?.split(',') || []);

export const searchColorsAtom = atom(searchParams.get('colors')?.split(',') || []);

export const colorComparisonAtom = atom(
  (searchParams.get('colorComparison') || '>=') as '<' | '<=' | '=' | '>=' | '>'
);

export const colorNumberAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('colorNumber');

    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const searchColorIdentitiesAtom = atom(searchParams.get('colorIdentity')?.split(',') || []);

export const colorIdentityComparisonAtom = atom(
  (searchParams.get('colorIdentityComparison') || '<=') as '<' | '<=' | '=' | '>=' | '>'
);

export const hybridIdentityRuleAtom = atom(searchParams.get('hybridIdentityRule') == 'true');

export const colorIdentityNumberAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('colorIdentityNumber');
    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const searchSetAtom = atom(searchParams.get('set')?.split(',') || []);

export const includeExtraSetsAtom = atom(searchParams.get('includeExtraSets') == 'true');

export const searchTokenAtom = atom(
  (searchParams.get('token') || 'Cards') as 'Cards' | 'Tokens' | 'Both'
);

export const extraSetsAtom = atom(searchParams.get('extraSets')?.split(',') || []);

export const standardLegalityAtom = atom(
  (searchParams.get('standard') || '') as '' | 'legal' | 'not_legal' | 'banned'
);

export const fourcbLegalityAtom = atom(
  (searchParams.get('4cb') || '') as '' | 'legal' | 'not_legal' | 'banned'
);
export const commanderLegalityAtom = atom(
  (searchParams.get('commander') || '') as '' | 'legal' | 'not_legal' | 'banned'
);

export const isCommanderAtom = atom(searchParams.get('isCommander') == 'true');

export const manaValueAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('manaValue');
    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const powerAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('p');

    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const toughnessAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('t');
    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);
export const loyaltyAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('l');

    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const defenseAtom = atom<
  { value: number; operator: '<' | '<=' | '=' | '>=' | '>' } | undefined
>(
  (() => {
    const parms = searchParams.get('d');
    const extracted = parms?.match(/([<=>])(\d)/);
    if (extracted) {
      return {
        value: parseInt(extracted[2]),
        operator: extracted[1] as '<' | '<=' | '=' | '>=' | '>',
      };
    }
    return undefined;
  })()
);

export const sortAtom = atom(
  (searchParams.get('order') || 'Color') as 'Alpha' | 'Mana Value' | 'Color' | 'Id'
);
export const dirAtom = atom((searchParams.get('dir') || 'Asc') as 'Asc' | 'Desc');

export const pageAtom = atom(parseInt(searchParams.get('page') || '0') || 0);

export const activeCardAtom = atom<string>(searchParams.get('activeCard') || '');

// export const shouldPushHistoryAtom = atom(true);
