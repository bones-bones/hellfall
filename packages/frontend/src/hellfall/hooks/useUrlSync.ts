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
  queryUniqueAtom,
  inputUniqueAtom,
  queryDisplayAtom,
  inputDisplayAtom,
  queryPreferAtom,
} from '../atoms/searchAtoms.ts';
import {
  SortObject,
  combineAndWinnowSorts,
  displayType,
  isDisplayType,
  isUniqueType,
  parseSearchQuery,
  parseSorts,
  uniqueType,
} from '@hellfall/shared/filters';
import { arbAreEqual, equalityFunction, listsAreExactlyEqual } from '@hellfall/shared/utils';
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

  const [queryUnique, setQueryUnique] = useAtom(queryUniqueAtom);
  const [inputUnique, setInputUnique] = useAtom(inputUniqueAtom);
  const [queryDisplay, setQueryDisplay] = useAtom(queryDisplayAtom);
  const [inputDisplay, setInputDisplay] = useAtom(inputDisplayAtom);
  const [queryPrefer, setQueryPrefer] = useAtom(queryPreferAtom);
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
    if (queryUnique != parsedQuery.unique) {
      setQueryUnique(parsedQuery.unique);
    }
    const unique = params.get('unique') ?? 'cards';
    if (isUniqueType(unique) && unique != inputUnique) {
      setInputUnique(unique);
    }

    if (queryDisplay != parsedQuery.display) {
      setQueryDisplay(parsedQuery.display);
    }
    const display = params.get('as') ?? 'grid';
    if (isDisplayType(display) && display != inputDisplay) {
      setInputDisplay(display);
    }

    if (queryPrefer != parsedQuery.prefer) {
      setQueryPrefer(parsedQuery.prefer);
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
  }, [location.search, location.pathname /*, user */]); // This triggers on back/forward navigation
};

const getSearchParams = (
  query: string,
  asRandom?: boolean,
  inputUnique?: uniqueType,
  inputDisplay?: displayType,
  inputSorts?: string[],
  page?: number
): URLSearchParams => {
  const searchToSet = new URLSearchParams();

  if (query) {
    searchToSet.append('q', query);
  }
  if (inputUnique) {
    searchToSet.append('unique', inputUnique);
  }
  if (inputDisplay) {
    searchToSet.append('as', inputDisplay);
  }
  if (inputSorts?.length && !asRandom) {
    inputSorts.forEach(entry => searchToSet.append('order', entry));
  }
  if (page && page > 0 && !asRandom) {
    searchToSet.append('page', page.toString());
  }
  return searchToSet;
};
const valueOnlyAddedDefault = <T>(prevValue: T, currentValue: T, defaultValue: T) => {
  if ((Array.isArray(prevValue) && prevValue.length) || prevValue == currentValue) {
    return false;
  }
  return arbAreEqual(currentValue, defaultValue);
};
const valueActuallyChanged = <T>(prevValue: T, currentValue: T, defaultValue: T) =>
  !arbAreEqual(prevValue, currentValue) &&
  !valueOnlyAddedDefault(prevValue, currentValue, defaultValue);

export const useUpdateURL = (asRandom?: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useAtomValue(queryAtom);
  const inputUnique = useAtomValue(inputUniqueAtom);
  const defaultUnique = 'cards';
  const inputDisplay = useAtomValue(inputDisplayAtom);
  const defaultDisplay = 'grid';
  const inputSorts = useAtomValue(inputSortAtom);
  const defaultSorts = ['auto,auto'];
  const page = useAtomValue(pageAtom);
  const prevValues = useRef({ query, inputUnique, inputDisplay, inputSorts, page });
  useEffect(() => {
    const hasChanged =
      prevValues.current.query !== query ||
      valueActuallyChanged(prevValues.current.inputUnique, inputUnique, defaultUnique) ||
      valueActuallyChanged(prevValues.current.inputDisplay, inputDisplay, defaultDisplay) ||
      valueActuallyChanged(prevValues.current.inputSorts, inputSorts, defaultSorts) ||
      prevValues.current.page !== page;
    const uniqueAddedDefault = valueOnlyAddedDefault(
      prevValues.current.inputUnique,
      inputUnique,
      defaultUnique
    );
    const displayAddedDefault = valueOnlyAddedDefault(
      prevValues.current.inputDisplay,
      inputDisplay,
      defaultDisplay
    );
    const sortsAddedDefault = valueOnlyAddedDefault(
      prevValues.current.inputSorts,
      inputSorts,
      defaultSorts
    );

    if (!hasChanged && !uniqueAddedDefault && !displayAddedDefault && !sortsAddedDefault) return;

    const searchToSet = getSearchParams(
      query,
      asRandom,
      inputUnique,
      inputDisplay,
      inputSorts,
      page
    );

    const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl) {
      navigate(newUrl, {
        // If nothing actually changed, then this is being triggered by going back to a page
        // that didn't have all the atoms, so the url should be replaced to prevent duplication
        replace: !hasChanged,
      });
    }
    prevValues.current = { query, inputUnique, inputDisplay, inputSorts, page };
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
