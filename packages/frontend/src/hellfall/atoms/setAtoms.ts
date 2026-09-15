import { parseAndWinnowSetSorts, SetSortObject } from '@hellfall/shared/filters';
import { SetFilterType, toSetFilterType } from '@hellfall/shared/types';
import { atom } from 'jotai';

const searchParams = new URLSearchParams(document.location.search);

export const inputSortAtom = atom<string[]>(searchParams.getAll('order'));

export const sortAtom = atom<SetSortObject[]>(parseAndWinnowSetSorts(inputSortAtom.init).sortList);

export const inputFilterAtom = atom<SetFilterType | undefined>(
  toSetFilterType(searchParams.get('type'))
);
