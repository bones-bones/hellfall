import { atom } from 'jotai';
import {
  SortObject,
  combineAndWinnowSorts,
  displayType,
  isDisplayType,
  isUniqueType,
  parseSearchQuery,
  uniqueType,
} from '@hellfall/shared/filters';
import { CardMap, preferType } from '@hellfall/shared/utils';

const searchParams = new URLSearchParams(document.location.search);

export const queryAtom = atom<string>(searchParams.get('q') || '');
const parsedQuery = parseSearchQuery(queryAtom.init, new CardMap());

export const querySortAtom = atom<SortObject[]>(parsedQuery.sortObjects);

export const inputSortAtom = atom<string[]>(searchParams.getAll('order'));

export const sortAtom = atom<SortObject[]>(
  combineAndWinnowSorts(querySortAtom.init, inputSortAtom.init).sortList
);

export const queryUniqueAtom = atom<uniqueType | undefined>(parsedQuery.unique);

const getUnique = (text: any): uniqueType => (isUniqueType(text) ? text : 'cards');

export const inputUniqueAtom = atom<uniqueType>(getUnique(searchParams.get('unique')));

export const queryDisplayAtom = atom<displayType | undefined>(parsedQuery.display);

const getDisplay = (text: any): displayType => (isDisplayType(text) ? text : 'grid');

export const inputDisplayAtom = atom<displayType>(getDisplay(searchParams.get('as')));

export const queryPreferAtom = atom<preferType | undefined>(parsedQuery.prefer);

export const pageAtom = atom(parseInt(searchParams.get('page') || '0') || 0);

export const activeCardAtom = atom<string>(searchParams.get('activeCard') || '');

export const summaryAtom = atom<string>(parsedQuery.summary);

export const invalidAtom = atom<[string, string][]>(parsedQuery.invalids);

// export const shouldPushHistoryAtom = atom(true);
