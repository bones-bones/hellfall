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
} from '../atoms/searchAtoms.ts';
import {
  sortObject,
  combineAndWinnowSorts,
  parseSearchQuery,
  makeSort,
} from '@hellfall/shared/filters';
import { listsExactlyEqual } from '@hellfall/shared/utils';

const sortsEqual = (mem1: sortObject, mem2: sortObject) =>
  mem1.sort == mem2.sort && mem1.dir == mem2.dir;
const invalidsEqual = (mem1: [string, string], mem2: [string, string]) =>
  mem1[0] == mem2[0] && mem1[1] == mem2[1];

export const useUrlSync = () => {
  const location = useLocation();

  const [query, setQuery] = useAtom(queryAtom);
  const [querySorts, setQuerySorts] = useAtom(querySortAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [page, setPage] = useAtom(pageAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const [summary, setSummary] = useAtom(summaryAtom);
  const [invalids, setInvalids] = useAtom(invalidAtom);
  // const randomPathNames = ['/card','/random']
  useEffect(() => {
    // const asRandom = randomPathNames.some(name=>location.pathname.startsWith(name))
    const params = new URLSearchParams(location.search);
    const newQuery = params.get(/* asRandom ? 'random':  */ 'q') || '';
    const parsedQuery = parseSearchQuery(newQuery);
    if (query != newQuery) {
      setQuery(newQuery);
    }
    if (!listsExactlyEqual(querySorts, parsedQuery.sortObjects, sortsEqual)) {
      setQuerySorts(parsedQuery.sortObjects);
    }

    const { sortList, newInputs } = combineAndWinnowSorts(
      parsedQuery.sortObjects,
      params.getAll('order')
    );
    if (!sortList.length) {
      sortList.push(makeSort('auto', 'auto'));
    }
    if (!listsExactlyEqual(sortRules, sortList, sortsEqual)) {
      setSortRules(sortList);
    }
    if (!listsExactlyEqual(inputSorts, newInputs)) {
      setInputSorts(newInputs);
    }
    if (summary != parsedQuery.summary) {
      setSummary(parsedQuery.summary);
    }
    if (!listsExactlyEqual(invalids, parsedQuery.invalids, invalidsEqual)) {
      setInvalids(parsedQuery.invalids);
    }
    // Set pagination and reset active card
    if (page != parseInt(params.get('page') || '0')) {
      setPage(parseInt(params.get('page') || '0'));
    }
    // if (activeCard != (params.get('activeCard') || '')) {
    //   setActiveCard(params.get('activeCard') || '');
    // }
    setActiveCard('');
  }, [location.search, location.pathname]); // This triggers on back/forward navigation
};

export const getSearchParams = (
  query: string,
  asRandom?: boolean,
  inputSorts?: string[],
  page?: number
): URLSearchParams => {
  const searchToSet = new URLSearchParams();

  if (query) {
    searchToSet.append(/* asRandom?'random': */ 'q', query);
  }

  if (inputSorts?.length && !asRandom) {
    inputSorts.forEach(entry => searchToSet.append('order', entry));
  }
  if (page && page > 0 && !asRandom) {
    searchToSet.append('page', page.toString());
  }
  return searchToSet;
};

export const useUpdateURL = (asRandom?: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useAtomValue(queryAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const page = useAtomValue(pageAtom);
  // const activeCard = useAtomValue(activeCardAtom);
  const prevValues = useRef({ query, inputSorts, page /*, activeCard */ });

  useEffect(() => {
    const hasChanged =
      prevValues.current.query !== query ||
      !listsExactlyEqual(prevValues.current.inputSorts, inputSorts) ||
      prevValues.current.page !== page;
    // const activeHasChanged = prevValues.current.activeCard !== activeCard;

    if (!hasChanged /* && !activeHasChanged */) return;

    const searchToSet = getSearchParams(query, asRandom, inputSorts, page);

    // if (query) {
    //   searchToSet.append(asRandom?'random':'q', query);
    // }

    // if (inputSorts.length && !asRandom) {
    //   inputSorts.forEach(entry => searchToSet.append('order', entry));
    // }
    // if (page > 0 && !asRandom) {
    //   searchToSet.append('page', page.toString());
    // }
    // if (activeCard !== '') {
    //   searchToSet.append('activeCard', activeCard);
    // }
    const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl) {
      navigate(newUrl, {
        replace: false /* !hasChanged */,
      });
    }
    prevValues.current = { query, inputSorts, page /*, activeCard */ };
  });
};

export const useNavToSearch = () => {
  const navigate = useNavigate();
  const navToSearch = (query: string) => {
    const searchToSet = new URLSearchParams();
    if (query) {
      searchToSet.append('q', query);
    }

    const newUrl = `/${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    navigate(newUrl, {
      replace: false,
    });
  };
  return navToSearch;
};
