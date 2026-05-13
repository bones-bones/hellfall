import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom, useAtom, useAtomValue } from 'jotai';
import {
  queryAtom,
  inputSortAtom,
  sortAtom,
  pageAtom,
  activeCardAtom,
  querySortAtom,
  summaryAtom,
  invalidAtom,
  // parseOperatorValue,
} from '../atoms/searchAtoms.ts';
import { sortObject } from '../filters/filterObject.ts';
import { combineAndWinnowSorts, parseSearchQuery } from '../filters/parseSearchBar.ts';
import { makeSort } from '../filters/filterBuilder.ts';
import { PaginationModel } from '@workday/canvas-kit-react';
import { CHUNK_SIZE } from '../constants.ts';

export const listsAreEqual = (value1: string[], value2: string[]): boolean => {
  if (value1.length != value2.length) {
    return false;
  }
  return value1.every((value, i) => value == value2[i]);
};

export const sortsAreEqual = (value1: sortObject[], value2: sortObject[]): boolean => {
  if (value1.length != value2.length) {
    return false;
  }
  return value1.every((value, i) => value.sort == value2[i].sort && value.dir == value2[i].dir);
};

export const invalidsAreEqual = (
  value1: [string, string][],
  value2: [string, string][]
): boolean => {
  if (value1.length != value2.length) {
    return false;
  }
  return value1.every((value, i) => value[0] == value2[i][0] && value[1] == value2[i][1]);
};

export const useUrlSync = () => {
  const location = useLocation();

  const [query, setQuery] = useAtom(queryAtom);
  const [querySorts, setQuerySorts] = useAtom(querySortAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [activeCard, setActiveCard] = useAtom(activeCardAtom);
  const [summary, setSummary] = useAtom(summaryAtom);
  const [invalids, setInvalids] = useAtom(invalidAtom);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get('q') || '';
    const parsedQuery = parseSearchQuery(newQuery);
    if (query != newQuery) {
      setQuery(newQuery);
    }
    if (!sortsAreEqual(querySorts, parsedQuery.sortObjects)) {
      setQuerySorts(parsedQuery.sortObjects);
    }

    const { sortList, newInputs } = combineAndWinnowSorts(
      parsedQuery.sortObjects,
      params.getAll('order')
    );
    if (!sortList.length) {
      sortList.push(makeSort('auto', 'auto'));
    }
    if (!sortsAreEqual(sortRules, sortList)) {
      setSortRules(sortList);
    }
    if (!listsAreEqual(inputSorts, newInputs)) {
      setInputSorts(newInputs);
    }
    if (summary != parsedQuery.summary) {
      setSummary(parsedQuery.summary);
    }
    if (!invalidsAreEqual(invalids, parsedQuery.invalids)) {
      setInvalids(parsedQuery.invalids);
    }
    // Set pagination and active card
    if (page != parseInt(params.get('page') || '0')) {
      setPage(parseInt(params.get('page') || '0'));
    }
    if (activeCard != (params.get('activeCard') || '')) {
      setActiveCard(params.get('activeCard') || '');
    }
  }, [location.search, location.pathname]); // This triggers on back/forward navigation
};

export const useSyncToURL = () => {
  const navigate = useNavigate();
  const setPageAtom = useSetAtom(pageAtom);
  const syncToURL = (
    query?: string,
    inputSorts?: string[],
    activeCard?: string,
    page?: number,
    paginationModel?: PaginationModel,
    resultsLength?: number,
    options?: { newPathname?: string }
  ) => {
    const searchToSet = new URLSearchParams();
    if (query) {
      searchToSet.append('q', query);
    }

    if (inputSorts?.length) {
      inputSorts.forEach(input => searchToSet.append('order', input));
    }
    if (paginationModel) {
      const currentPageNumber = Math.floor(page! / CHUNK_SIZE) + 1;

      if (paginationModel.state.currentPage !== currentPageNumber) {
        paginationModel.events.goTo(currentPageNumber);
      }
      if (resultsLength && resultsLength < page! && resultsLength > 0) {
        paginationModel.events.goTo(1);
        setPageAtom(0);
      } else if (page! > 0) {
        searchToSet.append('page', page!.toString());
      }
    }
    if (activeCard) {
      searchToSet.append('activeCard', activeCard);
    }
    if (options?.newPathname) {
      const newUrl = `${options.newPathname}${
        searchToSet.size ? `?${searchToSet.toString()}` : ''
      }`;
      navigate(newUrl, {
        replace: false,
      });
    } else {
      const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
      const currentUrl = location.search;
      if ([newUrl, currentUrl].includes('?')) {
        console.log('still need ? check');
      }
      if (newUrl != currentUrl && ![newUrl, currentUrl].every(url => ['', '?'].includes(url))) {
        navigate(newUrl, {
          replace: false,
        });
      }
    }
  };
  return syncToURL;
};
