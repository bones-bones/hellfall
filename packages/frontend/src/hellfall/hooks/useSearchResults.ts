import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { useAtom, useAtomValue } from 'jotai';
import {
  queryAtom,
  sortAtom,
  pageAtom,
  activeCardAtom,
  // shouldPushHistoryAtom,
} from '../atoms/searchAtoms.ts';
import tags_data from '@hellfall/shared/data/tags.json';

import { CHUNK_SIZE } from '../constants.ts';
import { searchCards } from '@hellfall/shared/filters';

export const useSearchResults = () => {
  // const navigate = useNavigate()

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(
    e => !e.tags?.includes('offensive') && e.set != 'NotMagic'
  );
  const query = useAtomValue(queryAtom);
  const sortRules = useAtomValue(sortAtom);
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
    const tempResults = searchCards(cards, query, tags_data.data);

    // setQuerySorts(sortObjects);
    // const { sortList, newInputs } = combineAndWinnowSorts(sortObjects, inputSorts);
    // setSortRules(sortList);
    // if (!sortList.length) {
    //   sortList.push(makeSort('auto', 'auto'));
    // }

    for (let i = sortRules.length - 1; i >= 0; i--) {
      tempResults.sort((a: HCCard.Any, b: HCCard.Any) => sortRules[i].filter(a, '=', b));
    }
    setResultSet(tempResults);

    // syncToURL(query, newInputs, activeCard, page, paginationModel, tempResults.length);

    // const searchToSet = new URLSearchParams();

    const currentPageNumber = Math.floor(page / CHUNK_SIZE) + 1;

    if (paginationModel.state.currentPage !== currentPageNumber) {
      paginationModel.events.goTo(currentPageNumber);
    }
    // if (query) {
    //   searchToSet.append('q', query);
    // }

    // if (newInputs.length) {
    //   newInputs.forEach(entry => searchToSet.append('order', entry));
    // }
    if (tempResults.length < page && tempResults.length) {
      paginationModel.events.goTo(1);
      setPageAtom(0);
    }
    // if (activeCard !== '') {
    //   searchToSet.append('activeCard', activeCard);
    // }
    // // if (newPathname) {
    // //   const newUrl = `${newPathname}${searchToSet.size ? `?${searchToSet.toString()}`:''}`;

    // //   navigate(newUrl, {
    // //     replace: false,
    // //   });
    // // } else {
    //   const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}`:''}`;
    //   const currentUrl = location.search;
    //   if ([newUrl,currentUrl].includes('?')) {
    //     console.log('still need ? check')
    //   }
    //   if (newUrl != currentUrl && ![newUrl, currentUrl].every(url => ['', '?'].includes(url))) {
    //     navigate(newUrl, {
    //       replace: false,
    //     });
    //   }
    // // }
  }, [
    query,
    sortRules,
    // inputSorts,
    page,
    activeCard,
    cards.length,
    // location.search,
  ]);

  return { resultSet, paginationModel };
};

// TODO: fix includes
