import { atom } from 'jotai';
import { sortObject, combineAndWinnowSorts, parseSearchQuery } from '@hellfall/shared/filters';

const searchParams = new URLSearchParams(document.location.search);

export const queryAtom = atom<string>(searchParams.get('q') || '');

const parsedQuery = parseSearchQuery(queryAtom.init);

export const querySortAtom = atom<sortObject[]>(parsedQuery.sortObjects);

export const inputSortAtom = atom<string[]>(searchParams.getAll('order'));

export const sortAtom = atom<sortObject[]>(
  combineAndWinnowSorts(querySortAtom.init, inputSortAtom.init).sortList
);

export const pageAtom = atom(parseInt(searchParams.get('page') || '0') || 0);

export const activeCardAtom = atom<string>(searchParams.get('activeCard') || '');

export const summaryAtom = atom<string>(parsedQuery.summary);

export const invalidAtom = atom<[string, string][]>(parsedQuery.invalids);

// export const shouldPushHistoryAtom = atom(true);
