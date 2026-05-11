import { FormField, space } from '@workday/canvas-kit-react';
import { Select } from '@workday/canvas-kit-preview-react/select';
import { SecondaryButton, TertiaryButton, PrimaryButton } from '@workday/canvas-kit-react/button';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, queryAtom, querySortNumAtom, sortAtom } from '../atoms/searchAtoms.ts';
import styled from '@emotion/styled';
import { sorts, dirs, sortType, dirType } from '../filters/types.ts';
import {
  getWinnowedSortOptions,
  combineAndWinnowSorts,
  parseSorts,
} from '../filters/parseSearchBar.ts';
import { useEffect, useState } from 'react';
import { plusIcon, minusIcon } from '@workday/canvas-system-icons-web';
import { makeSort } from '../filters/filterBuilder.ts';

const ALL_SORT_OPTIONS: Array<{ label: string; value: sortType }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Name', value: 'name' },
  { label: 'Id', value: 'id' },
  { label: 'Set/Number', value: 'setnumber' },
  { label: 'Set', value: 'set' },
  { label: 'Number', value: 'number' },
  { label: 'Color/MV', value: 'colormanavalue' },
  { label: 'Color', value: 'color' },
  { label: 'Mana Value', value: 'manavalue' },
];

const DIR_OPTIONS: Array<{ label: string; value: dirType }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Asc', value: 'asc' },
  { label: 'Desc', value: 'desc' },
];
const parseSort = (order: string): sortType => order.split(',')[0] as sortType;
const parseDir = (order: string): dirType => order.split(',')[1] as dirType;
export const SortComponent = () => {
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySortNum = useAtomValue(querySortNumAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): sortType[] =>
    getWinnowedSortOptions(sortRules.slice(0, index));
  const sortIsOverriden = (index: number): boolean =>
    parseSort(inputSorts[index]) != sortRules[index].sort;
  const dirIsOverriden = (index: number): boolean =>
    parseDir(inputSorts[index]) != sortRules[index].dir;
  const handleSortChange = (index: number, newSort: sortType) => {
    if (!sortRules.length) {
      handleAddInput();
    }
    const newInputs = sortRules.length ? [...inputSorts]:['auto,auto'];
    newInputs[index] = `${newSort},${parseDir(inputSorts[index] ?? 'auto')}`;
    setInputSorts(newInputs);
  };
  const handleDirChange = (index: number, newDir: dirType) => {
    if (!sortRules.length) {
      handleAddInput();
    }
    const newInputs = sortRules.length ? [...inputSorts]:['auto,auto'];
    newInputs[index] = `${parseSort(inputSorts[index] ?? 'auto')},${newDir}`;
    setInputSorts(newInputs);
  };
  useEffect(() => {
    setCanAddInput(Boolean(getAvailableOptions(inputSorts.length).length));
  }, [inputSorts, sortRules]);

  const handleAddInput = () => {
    if (!canAddInput) return;
    const newInputs = [...inputSorts];
    newInputs.push('auto,auto');
    setInputSorts(newInputs);
    const newSortRules = [...sortRules];
    newSortRules.push(makeSort('auto', 'auto'));
    setSortRules(newSortRules);
  };

  useEffect(() => {
    setCanDelInput(inputSorts.length > querySortNum && inputSorts.length > 1);
  }, [inputSorts, querySortNum]);

  const handleDelInput = () => {
    if (!canDelInput) return;
    const newInputs = [...inputSorts];
    newInputs.pop();
    setInputSorts(newInputs);
    const newSortRules = [...sortRules];
    newSortRules.pop();
    setSortRules(newSortRules);
  };

  return (
    <Container>
      <FormField label="Sort By" style={{ whiteSpace: 'nowrap' }}>
        {sortRules.length ? (
          sortRules.map((rule, i) => {
            const available = getAvailableOptions(i);
            return (
              <>
                <Select
                  style={{ width: '135px' }}
                  value={rule.sort}
                  disabled={sortIsOverriden(i)}
                  options={ALL_SORT_OPTIONS.filter(opt => available.includes(opt.value))}
                  onChange={e => handleSortChange(i, e.target.value as sortType)}
                />
                <span> : </span>
                <Select
                  style={{ width: '85px' }}
                  value={rule.dir}
                  disabled={dirIsOverriden(i)}
                  options={DIR_OPTIONS}
                  onChange={e => handleDirChange(i, e.target.value as dirType)}
                />
                {i != sortRules.length - 1 && <span> then </span>}
              </>
            );
          })
        ) : (
          <>
            <Select
              style={{ width: '135px' }}
              value={'auto'}
              disabled={false}
              options={ALL_SORT_OPTIONS}
              onChange={e => handleSortChange(0, e.target.value as sortType)}
            />
            <span> : </span>
            <Select
              style={{ width: '85px' }}
              value={'auto'}
              disabled={false}
              options={DIR_OPTIONS}
              onChange={e => handleDirChange(0, e.target.value as dirType)}
            />
          </>
        )}
        <>
          <SecondaryButton
            icon={plusIcon}
            aria-label="Add sort rule"
            onClick={handleAddInput}
            disabled={!canAddInput}
          />
          <SecondaryButton
            icon={minusIcon}
            aria-label="Remove sort rule"
            onClick={handleDelInput}
            disabled={!canDelInput}
          />
        </>
      </FormField>
    </Container>
  );
};

const Container = styled('div')({ paddingLeft: space.l, width: '20px' });
