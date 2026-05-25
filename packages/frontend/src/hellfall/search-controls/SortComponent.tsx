import { FormField, space } from '@workday/canvas-kit-react';
import { Select } from '@workday/canvas-kit-preview-react/select';
import { SecondaryButton, TertiaryButton, PrimaryButton } from '@workday/canvas-kit-react/button';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, queryAtom, querySortAtom, sortAtom } from '../atoms/searchAtoms.ts';
import styled from '@emotion/styled';
import { sorts, dirs, sortType, dirType } from '@hellfall/shared/filters/types.ts';
import {
  getWinnowedSortOptions,
  combineAndWinnowSorts,
  parseSorts,
} from '@hellfall/shared/filters/parseSearchBar.ts';
import { useEffect, useState } from 'react';
import { plusIcon, minusIcon } from '@workday/canvas-system-icons-web';
import { makeSort } from '@hellfall/shared/filters/filterBuilder.ts';

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
const parseSort = (order: string): sortType => order?.split(',')[0] as sortType;
const parseDir = (order: string): dirType => order?.split(',')[1] as dirType;
export const SortComponent = () => {
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySorts = useAtomValue(querySortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): sortType[] =>
    getWinnowedSortOptions(sortRules.slice(0, index));
  const sortIsOverriden = (index: number): boolean =>
    index < inputSorts.length && parseSort(inputSorts[index]) != sortRules[index].sort;
  const dirIsOverriden = (index: number): boolean =>
    index < inputSorts.length && parseDir(inputSorts[index]) != sortRules[index].dir;
  const handleSortChange = (index: number, newSort: sortType) => {
    if (!sortRules.length) {
      handleAddInput();
    }
    const newInputs = sortRules.length ? [...inputSorts] : ['auto,auto'];
    newInputs[index] = `${newSort},${parseDir(inputSorts[index] ?? 'auto,auto')}`;
    setInputSorts(newInputs);
  };
  const handleDirChange = (index: number, newDir: dirType) => {
    if (!sortRules.length) {
      handleAddInput();
    }
    const newInputs = sortRules.length ? [...inputSorts] : ['auto,auto'];
    newInputs[index] = `${parseSort(inputSorts[index] ?? 'auto,auto')},${newDir}`;
    setInputSorts(newInputs);
  };
  useEffect(() => {
    setCanAddInput(
      Boolean(getAvailableOptions(sortRules.length).length && sortRules.at(-1)?.sort != 'auto')
    );
  }, [inputSorts, sortRules]);

  const handleAddInput = () => {
    // if (!canAddInput) return;
    const newInputs = [...inputSorts];
    newInputs.push('auto,auto');
    setInputSorts(newInputs);
    // const newSortRules = [...sortRules];
    // newSortRules.push(makeSort('auto', 'auto'));
    // setSortRules(newSortRules);
  };

  useEffect(() => {
    setCanDelInput(inputSorts.length > querySorts.length && inputSorts.length > 1);
  }, [inputSorts, querySorts]);

  const handleDelInput = () => {
    // if (!canDelInput) return;
    const newInputs = [...inputSorts];
    newInputs.pop();
    setInputSorts(newInputs);
    // const newSortRules = [...sortRules];
    // newSortRules.pop();
    // setSortRules(newSortRules);
  };

  return (
    <Container>
      <FormField label="Sort By">
        <SortElements>
          {sortRules.length ? (
            sortRules.map((rule, i) => {
              const available = getAvailableOptions(i);
              return (
                <>
                  <StyledSelect
                    style={{ width: '135px' }}
                    title={
                      sortIsOverriden(i)
                        ? 'You specified this option in your search terms'
                        : 'Change how cards are sorted'
                    }
                    aria-label={
                      sortIsOverriden(i)
                        ? 'You specified this option in your search terms'
                        : 'Change how cards are sorted'
                    }
                    value={rule.sort}
                    disabled={sortIsOverriden(i)}
                    options={ALL_SORT_OPTIONS.filter(opt => available.includes(opt.value))}
                    onChange={e => handleSortChange(i, e.target.value as sortType)}
                  />
                  <span> : </span>
                  <StyledSelect
                    style={{ width: '85px' }}
                    title={
                      dirIsOverriden(i)
                        ? 'You specified this option in your search terms'
                        : 'Change sort direction'
                    }
                    aria-label={
                      dirIsOverriden(i)
                        ? 'You specified this option in your search terms'
                        : 'Change sort direction'
                    }
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
              <StyledSelect
                style={{ width: '135px' }}
                value={'auto'}
                disabled={false}
                options={ALL_SORT_OPTIONS}
                onChange={e => handleSortChange(0, e.target.value as sortType)}
              />
              <span> : </span>
              <StyledSelect
                style={{ width: '85px' }}
                value={'auto'}
                disabled={false}
                options={DIR_OPTIONS}
                onChange={e => handleDirChange(0, e.target.value as dirType)}
              />
            </>
          )}
          <>
            {/* <SecondaryButton
            icon={plusIcon}
            aria-label="Add sort rule"
            onClick={handleAddInput}
            disabled={!canAddInput}
            marginX='4px'
            borderRadius='m'
            verticalAlign='top'
          />
          <SecondaryButton
            icon={minusIcon}
            aria-label="Remove sort rule"
            onClick={handleDelInput}
            disabled={!canDelInput}
            borderRadius='m'
            verticalAlign='top'
          /> */}
            <ButtonGroup>
              <CompactButton
                icon={plusIcon}
                aria-label="Add sort rule"
                onClick={handleAddInput}
                disabled={!canAddInput}
              />
              <CompactButton
                icon={minusIcon}
                aria-label="Remove sort rule"
                onClick={handleDelInput}
                disabled={!canDelInput}
              />
            </ButtonGroup>
          </>
        </SortElements>
      </FormField>
    </Container>
  );
};

const Container = styled('div')({
  paddingLeft: space.l,
  paddingRight: space.l,
  alignItems: 'center',
});
const StyledSelect = styled(Select)({
  verticalAlign: 'top',
  display: 'inline-block',
  '&:disabled': {
    cursor: 'not-allowed',
  },
});
const SortElements = styled('div')({ lineHeight: '45px', verticalAlign: 'top' });
const CompactButton = styled(SecondaryButton)({
  width: '20px', // Fixed small width
  height: '20px', // Fixed small height
  minWidth: '20px', // Override any min-width
  padding: 0, // Remove padding
  display: 'block',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  verticalAlign: 'top',

  svg: {
    width: '14px', // Smaller icon
    height: '14px',
    display: 'block',
    margin: '2px 0px 0px 2px',
    alignSelf: 'center',
    verticalAlign: 'top',
  },
});
const ButtonGroup = styled('div')({
  display: 'inline-block',
  flexDirection: 'column', // Stack vertically
  // gap: '4px',               // Space between buttons
  marginLeft: '4px', // Optional spacing from the selectors
  verticalAlign: 'top',
});

// const AlignedButton = styled(SecondaryButton)({ display: 'block', transform: 'scale(0.5)', alignItems:'center',verticalAlign:'top',svg:{verticalAlign:'middle', display: 'inline-block'}})
