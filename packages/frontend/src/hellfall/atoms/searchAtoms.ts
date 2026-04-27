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

// export const parseOperatorValue = (parms:string|null):[number,'<' | '<=' | '=' | '>=' | '>']|undefined => {
//   const extracted = parms?.match(/([<=>])(\d)/);
//   debugger;
//   if (extracted) {
//     return [parseInt(extracted[2]), extracted[1] as '<' | '<=' | '=' | '>=' | '>']
//   }
//   return undefined;
// }
export const parseOperatorValue = (str: string | null):[number,'<' | '<=' | '=' | '>=' | '>']|undefined => {
  if (!str) return undefined;
  const match = str.match(/^([<>]=?|=)(.+)$/);
  if (!match) return undefined;
  return [parseInt(match[2]),match[1] as '<' | '<=' | '=' | '>=' | '>']
};

export const colorNumberAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('colorNumber')));

export const searchColorIdentitiesAtom = atom(searchParams.get('colorIdentity')?.split(',') || []);

export const colorIdentityComparisonAtom = atom(
  (searchParams.get('colorIdentityComparison') || '<=') as '<' | '<=' | '=' | '>=' | '>'
);

export const hybridIdentityRuleAtom = atom(searchParams.get('hybridIdentityRule') == 'true');

export const colorIdentityNumberAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('colorIdentityNumber')));

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

export const collectorNumberAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('cn')));

export const manaValueAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('manaValue')));

export const powerAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('p')));

export const toughnessAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('t')));

export const loyaltyAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('l')));

export const defenseAtom = atom<[number,'<' | '<=' | '=' | '>=' | '>'] | undefined>(parseOperatorValue(searchParams.get('d')));

export const sortAtom = atom(
  (searchParams.get('order') || 'Color') as 'Name' | 'Id' | 'Set/Number' | 'Color' | 'Mana Value' 
);
export const dirAtom = atom((searchParams.get('dir') || 'Asc') as 'Asc' | 'Desc');

export const pageAtom = atom(parseInt(searchParams.get('page') || '0') || 0);

export const activeCardAtom = atom<string>(searchParams.get('activeCard') || '');

// export const shouldPushHistoryAtom = atom(true);
