import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { sortAtom, inputFilterAtom } from '../atoms/setAtoms.ts';
import { HCSet, isSetType } from '@hellfall/shared/types';
import { setAutoSort, setList } from '@hellfall/shared/utils';

export const useSetResults = () => {
  const [resultSet, setResultSet] = useState<HCSet[]>([]);
  const sortRules = useAtomValue(sortAtom);
  const inputFilter = useAtomValue(inputFilterAtom);

  useEffect(() => {
    const tempResults = isSetType(inputFilter)
      ? setList.filter(set => set.set_type == inputFilter)
      : inputFilter
      ? setList.filter(set => !set.parent_set_code)
      : setList;

    tempResults.sort(setAutoSort);
    for (let i = sortRules.length - 1; i >= 0; i--) {
      tempResults.sort(sortRules[i].filter);
    }
    setResultSet(tempResults);
  }, [sortRules, inputFilter, setList.length]);

  return { resultSet };
};
