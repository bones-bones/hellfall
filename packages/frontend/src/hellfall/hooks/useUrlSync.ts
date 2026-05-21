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
import { sortObject } from '@hellfall/shared/filters/filterObject.ts';
import {
  combineAndWinnowSorts,
  parseSearchQuery,
} from '@hellfall/shared/filters/parseSearchBar.ts';
import { makeSort } from '@hellfall/shared/filters/filterBuilder.ts';
import { listsAreEqual } from '@hellfall/shared/utils';

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
    if (!listsAreEqual(querySorts, parsedQuery.sortObjects, sortsEqual)) {
      setQuerySorts(parsedQuery.sortObjects);
    }

    const { sortList, newInputs } = combineAndWinnowSorts(
      parsedQuery.sortObjects,
      params.getAll('order')
    );
    if (!sortList.length) {
      sortList.push(makeSort('auto', 'auto'));
    }
    if (!listsAreEqual(sortRules, sortList, sortsEqual)) {
      setSortRules(sortList);
    }
    if (!listsAreEqual(inputSorts, newInputs)) {
      setInputSorts(newInputs);
    }
    if (summary != parsedQuery.summary) {
      setSummary(parsedQuery.summary);
    }
    if (!listsAreEqual(invalids, parsedQuery.invalids, invalidsEqual)) {
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

export const useUpdateURL = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useAtomValue(queryAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const page = useAtomValue(pageAtom);
  const activeCard = useAtomValue(activeCardAtom);
  const prevValues = useRef({ query, inputSorts, page, activeCard });

  useEffect(() => {
    const hasChanged =
      prevValues.current.query !== query ||
      !listsAreEqual(prevValues.current.inputSorts, inputSorts) ||
      prevValues.current.page !== page ||
      prevValues.current.activeCard !== activeCard;

    if (!hasChanged) return;

    const searchToSet = new URLSearchParams();

    if (query) {
      searchToSet.append('q', query);
    }

    if (inputSorts.length) {
      inputSorts.forEach(entry => searchToSet.append('order', entry));
    }
    if (page > 0) {
      searchToSet.append('page', page.toString());
    }
    if (activeCard !== '') {
      searchToSet.append('activeCard', activeCard);
    }
    // if (newPathname) {
    //   const newUrl = `${newPathname}${searchToSet.size ? `?${searchToSet.toString()}`:''}`;

    //   navigate(newUrl, {
    //     replace: false,
    //   });
    // } else {
    const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    const currentUrl = location.search;
    if (newUrl != currentUrl) {
      navigate(newUrl, {
        replace: false,
      });
    }
    prevValues.current = { query, inputSorts, page, activeCard };
    // }
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
