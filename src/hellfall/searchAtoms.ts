import { atom } from 'jotai';
import { HCColor, HCSearchColor, HCColors } from '../api-types';
const searchParams = new URLSearchParams(document.location.search);

export const nameSearchAtom = atom<string>(searchParams.get('name') || '');

export const idSearchAtom = atom<string>(searchParams.get('id') || '');

export const activeCardAtom = atom<string>(searchParams.get('activeCard') || '');

export const costSearchAtom = atom<string[]>(searchParams.get('cost')?.split(',') || []);

export const rulesSearchAtom = atom<string[]>(searchParams.get('rules')?.split(',') || []);

type LegalType = 'legal' | 'banned' | '4cbLegal' | 'hellsmanderLegal';

export const legalityAtom = atom<LegalType[]>(
  (searchParams.get('legality')?.split(',') || []) as LegalType[]
);

export const typeSearchAtom = atom<string[]>(searchParams.get('type')?.split(',') || []);
export const searchSetAtom = atom(searchParams.get('set')?.split(',') || []);

export const searchTokenAtom = atom<string>(searchParams.get('token') || '');

export const isCommanderAtom = atom(searchParams.get('isCommander') == 'true');

export const searchColorsAtom = atom(searchParams.get('colors')?.split(',') || []);

export const searchColorComparisonAtom = atom(
  (searchParams.get('colorComparison') || '=') as '<' | '<=' | '=' | '>=' | '>'
);

export const searchColorIdentitiesAtom = atom(searchParams.get('colorIdentity')?.split(',') || []);

export const searchColorIdentityComparisonAtom = atom(
  (searchParams.get('colorIdentityComparison') || '<=') as '<' | '<=' | '=' | '>=' | '>'
);

export const useHybridIdentityAtom = atom(searchParams.get('useHybrid') == 'true');

export const searchColorNumberAtom = atom<
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

export const searchColorIdentityNumberAtom = atom<
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

export const searchCmcAtom = atom<
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

export const sortAtom = atom(
  (searchParams.get('order') || 'Color') as 'Alpha' | 'CMC' | 'Color' | 'Id'
);
export const dirAtom = atom((searchParams.get('dir') || 'Asc') as 'Asc' | 'Desc');
export const offsetAtom = atom(parseInt(searchParams.get('page') || '0') || 0);
export const creatorsAtom = atom(searchParams.get('creator')?.split(',,') || []);
export const tagsAtom = atom(searchParams.get('tags')?.split(',') || []);

export const extraFiltersAtom = atom(searchParams.get('extraFilters')?.split(',') || []);
