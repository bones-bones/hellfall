import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, sortAtom, inputFilterAtom } from '../atoms/setAtoms.ts';
import { SetSortObject, parseAndWinnowSetSorts, parseSetSorts } from '@hellfall/shared/filters';
import { arbAreEqual, equalityFunction, listsAreExactlyEqual } from '@hellfall/shared/utils';
// @circular-ignore Used only for links
import { SetControlBar } from '../search-controls/SetControlBar'; // used for link
import { SetFilterType, toSetFilterType } from '@hellfall/shared/types';

const sortsEqual: equalityFunction<SetSortObject> = (mem1: SetSortObject, mem2: SetSortObject) =>
  mem1.sort == mem2.sort && mem1.dir == mem2.dir;

/**
 * Syncs atoms ({@linkcode inputSortAtom}, {@linkcode sortAtom}, and {@linkcode inputFilterAtom})
 * with the url on control bar changes
 *
 * If you're only using the {@linkcode SetControlBar} but the page isn't the search page,
 * use {@linkcode useSyncSorts} instead of this hook.
 */
export const useSetUrlSync = () => {
  const location = useLocation();
  // const { user } = useAuth();

  const [inputFilter, setInputFilter] = useAtom(inputFilterAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = toSetFilterType(params.get('unique'));
    if (filter != inputFilter) {
      setInputFilter(filter);
    }

    const { sortList, newInputs } = parseAndWinnowSetSorts(params.getAll('order'));
    if (!sortList.length) {
      sortList.push(...parseSetSorts(['auto,auto']));
    }
    if (!listsAreExactlyEqual(sortRules, sortList, sortsEqual)) {
      setSortRules(sortList);
    }
    if (!listsAreExactlyEqual(inputSorts, newInputs)) {
      setInputSorts(newInputs);
    }
  }, [location.search, location.pathname /*, user */]); // This triggers on back/forward navigation
};

const getSearchParams = (inputFilter?: SetFilterType, inputSorts?: string[]): URLSearchParams => {
  const searchToSet = new URLSearchParams();

  if (inputFilter) {
    searchToSet.append('type', inputFilter);
  }
  if (inputSorts?.length) {
    inputSorts.forEach(entry => searchToSet.append('order', entry));
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

export const useUpdateSetURL = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputFilter = useAtomValue(inputFilterAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const defaultSorts = ['auto,auto'];
  const prevValues = useRef({ inputFilter, inputSorts });
  useEffect(() => {
    const hasChanged =
      prevValues.current.inputFilter !== inputFilter ||
      valueActuallyChanged(prevValues.current.inputSorts, inputSorts, defaultSorts);
    const sortsAddedDefault = valueOnlyAddedDefault(
      prevValues.current.inputSorts,
      inputSorts,
      defaultSorts
    );

    if (!hasChanged && !sortsAddedDefault) return;

    const searchToSet = getSearchParams(inputFilter, inputSorts);

    const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl) {
      navigate(newUrl, {
        // If nothing actually changed, then this is being triggered by going back to a page
        // that didn't have all the atoms, so the url should be replaced to prevent duplication
        replace: !hasChanged,
      });
    }
    prevValues.current = { inputFilter, inputSorts };
  });
};
