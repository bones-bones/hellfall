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
  SortObject,
  combineAndWinnowSorts,
  parseSearchQuery,
  parseSorts,
} from '@hellfall/shared/filters';
import { equalityFunction, listsAreExactlyEqual } from '@hellfall/shared/utils';
import { cardsAtom } from '../atoms/cardsAtom.ts';
// import { useAuth } from '../../auth/AuthContext.tsx';
// @circular-ignore Used only for links
import { ControlBar } from '../search-controls/ControlBar'; // used for link

const sortsEqual: equalityFunction<SortObject> = (mem1: SortObject, mem2: SortObject) =>
  mem1.sort == mem2.sort && mem1.dir == mem2.dir;

/**
 * Syncs atoms ({@linkcode queryAtom}, {@linkcode querySortAtom}, {@linkcode inputSortAtom},
 * {@linkcode sortAtom}, {@linkcode pageAtom}, {@linkcode summaryAtom}, and {@linkcode invalidAtom})
 * with the url on page/location changes
 *
 * If you're only using the {@linkcode ControlBar} but the page isn't the search page,
 * use {@linkcode useSyncSorts} instead of this hook.
 */
export const useUrlSync = () => {
  const location = useLocation();
  // const { user } = useAuth();

  const [query, setQuery] = useAtom(queryAtom);
  const [querySorts, setQuerySorts] = useAtom(querySortAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [page, setPage] = useAtom(pageAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const [summary, setSummary] = useAtom(summaryAtom);
  const [invalids, setInvalids] = useAtom(invalidAtom);
  const cards = useAtomValue(cardsAtom);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get(/* asRandom ? 'random':  */ 'q') || '';
    const parsedQuery = parseSearchQuery(newQuery, cards);
    if (query != newQuery) {
      setQuery(newQuery);
    }
    if (!listsAreExactlyEqual(querySorts, parsedQuery.sortObjects, sortsEqual)) {
      setQuerySorts(parsedQuery.sortObjects);
    }

    const { sortList, newInputs } = combineAndWinnowSorts(
      parsedQuery.sortObjects,
      params.getAll('order')
    );
    if (!sortList.length) {
      sortList.push(...parseSorts(/* user?.defaultSorts ?? */ ['auto,auto']));
    }
    if (!listsAreExactlyEqual(sortRules, sortList, sortsEqual)) {
      setSortRules(sortList);
    }
    if (!listsAreExactlyEqual(inputSorts, newInputs)) {
      setInputSorts(newInputs);
    }
    if (summary != parsedQuery.summary) {
      setSummary(parsedQuery.summary);
    }
    if (!listsAreExactlyEqual(invalids, parsedQuery.invalids)) {
      setInvalids(parsedQuery.invalids);
    }
    // Set pagination
    if (page != parseInt(params.get('page') || '0')) {
      setPage(parseInt(params.get('page') || '0'));
    }
    setActiveCard('');
  }, [location.search, location.pathname, /* user */]); // This triggers on back/forward navigation
};

const getSearchParams = (
  query: string,
  asRandom?: boolean,
  inputSorts?: string[],
  page?: number
): URLSearchParams => {
  const searchToSet = new URLSearchParams();

  if (query) {
    searchToSet.append('q', query);
  }

  if (inputSorts?.length && !asRandom) {
    inputSorts.forEach(entry => searchToSet.append('order', entry));
  }
  if (page && page > 0 && !asRandom) {
    searchToSet.append('page', page.toString());
  }
  return searchToSet;
};
const sortsOnlyAddedAuto = (
  prevSorts: string[],
  currentSorts: string[],
  defaultSorts?: string[]
) => {
  if (prevSorts.length) {
    return false;
  }
  return listsAreExactlyEqual(currentSorts, defaultSorts ?? ['auto,auto']);
};
const sortsActuallyChanged = (prevSorts: string[], currentSorts: string[]) =>
  !listsAreExactlyEqual(prevSorts, currentSorts) && !sortsOnlyAddedAuto(prevSorts, currentSorts);

export const useUpdateURL = (asRandom?: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useAtomValue(queryAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const page = useAtomValue(pageAtom);
  const prevValues = useRef({ query, inputSorts, page });

  useEffect(() => {
    const hasChanged =
      prevValues.current.query !== query ||
      sortsActuallyChanged(prevValues.current.inputSorts, inputSorts) ||
      prevValues.current.page !== page;
    const autoIsOnlyDiff =
      !hasChanged && sortsOnlyAddedAuto(prevValues.current.inputSorts, inputSorts);

    if (!hasChanged && !autoIsOnlyDiff) return;

    const searchToSet = getSearchParams(query, asRandom, inputSorts, page);

    const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl) {
      navigate(newUrl, {
        replace: autoIsOnlyDiff,
      });
    }
    prevValues.current = { query, inputSorts, page };
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

/**
 * Syncs {@linkcode inputSortAtom} and {@linkcode sortAtom} with the {@linkcode ControlBar} without
 * using the full {@linkcode useUrlSync} hook
 *
 * This hook is necessary if you're using `ControlBar` outside of the search page
 */
export const useSyncSorts = () => {
  // const { user } = useAuth();
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  useEffect(() => {
    setInputSorts(/* user?.defaultSorts ?? */ ['auto,auto']);
    setSortRules([]);
  }, []);
  useEffect(() => {
    setSortRules(parseSorts(inputSorts));
  }, [inputSorts]);
  // useEffect(() => {
  //   setInputSorts(user?.defaultSorts ?? ['auto,auto']);
  // }, [user]);
};
