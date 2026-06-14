import { useState, useEffect } from 'react';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { useAtom, useAtomValue } from 'jotai';
import {
  queryAtom,
  sortAtom,
  pageAtom,
  // shouldPushHistoryAtom,
} from '../atoms/searchAtoms.ts';

import { CHUNK_SIZE } from '../constants.ts';
import { searchCards } from '@hellfall/shared/filters';
import { tagsData } from '@hellfall/shared/data';

export const useSearchResults = (asRandom?:boolean) => {
  // const navigate = useNavigate()

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(e => !e.tags?.includes('offensive'));
  const query = useAtomValue(queryAtom);
  const sortRules = useAtomValue(sortAtom);
  const [page, setPageAtom] = useAtom(pageAtom);

  const lastPage = getLastPage(CHUNK_SIZE, resultSet.length);

  const paginationModel = usePaginationModel({
    lastPage,
    onPageChange: (pageNumber: number) => {
      if (pageNumber < 1) return;
      const newPageIndex = (pageNumber - 1) * CHUNK_SIZE;
      setPageAtom(newPageIndex);
    },
  });

  useEffect(() => {
    const tempResults = ((asRandom && query == '*') ? cards: searchCards(cards, query, tagsData.data)).cards();
    if (asRandom) {
      setResultSet(tempResults);
      return;
    }
    for (let i = sortRules.length - 1; i >= 0; i--) {
      tempResults.sort((a: HCCard.Any, b: HCCard.Any) => sortRules[i].filter(a, '=', b));
    }
    setResultSet(tempResults);

    const currentPageNumber = Math.floor(page / CHUNK_SIZE) + 1;

    if (paginationModel.state.currentPage !== currentPageNumber) {
      paginationModel.events.goTo(currentPageNumber);
    }
    if (tempResults.length < page && tempResults.length) {
      paginationModel.events.goTo(1);
      setPageAtom(0);
    }
  }, [
    query,
    sortRules,
    // inputSorts,
    page,
    cards.size(),
    // location.search,
  ]);

  return { resultSet, paginationModel };
};
