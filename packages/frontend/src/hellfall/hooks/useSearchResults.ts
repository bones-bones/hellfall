import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { useAtom, useAtomValue } from 'jotai';
import {
  queryAtom,
  querySortNumAtom,
  inputSortAtom,
  sortAtom,
  pageAtom,
  activeCardAtom,
  // shouldPushHistoryAtom,
} from '../atoms/searchAtoms.ts';

import { CHUNK_SIZE } from '../constants.ts';
import {
  combineAndWinnowSorts,
  parseSorts,
  searchCards,
  winnowSortObjects,
} from '../filters/parseSearchBar.ts';

export const useSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(
    e => !e.tags?.includes('offensive') && e.set != 'NotMagic'
  );
  const query = useAtomValue(queryAtom);
  const [querySortNum, setQuerySortNum] = useAtom(querySortNumAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [page, setPageAtom] = useAtom(pageAtom);
  const activeCard = useAtomValue(activeCardAtom);

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
    const {
      cards: tempResults,
      sortObjects,
      summary,
      winnowed,
      invalids,
    } = searchCards(cards, query);
    setQuerySortNum(sortObjects.length);
    const { sortList, newInputs } = combineAndWinnowSorts(sortObjects, parseSorts(inputSorts));
    setSortRules(sortList);

    for (let i = sortList.length - 1; i >= 0; i--) {
      tempResults.sort((a: HCCard.Any, b: HCCard.Any) => sortList[i].filter(a, ':', b));
    }
    setResultSet(tempResults);

    const searchToSet = new URLSearchParams();

    const currentPageNumber = Math.floor(page / CHUNK_SIZE) + 1;

    if (paginationModel.state.currentPage !== currentPageNumber) {
      paginationModel.events.goTo(currentPageNumber);
    }
    if (query) {
      searchToSet.append('q', query);
    }

    if (newInputs.length) {
      newInputs.forEach(entry => searchToSet.append('order', `${entry.sort},${entry.dir}`));
    }
    if (tempResults.length < page && tempResults.length > 0) {
      paginationModel.events.goTo(1);
      setPageAtom(0);
    } else if (page > 0) {
      searchToSet.append('page', page.toString());
    }
    if (activeCard !== '') {
      searchToSet.append('activeCard', activeCard);
    }

    const newUrl = `?${searchToSet.toString()}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl && ![newUrl, currentUrl].every(url => ['', '?'].includes(url))) {
      navigate(newUrl, {
        replace: false,
      });
    }
  }, [
    query,
    inputSorts,
    page,
    activeCard,
    cards.length,
    // location.search,
  ]);

  return { resultSet, paginationModel };
};
