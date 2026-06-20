import { FormField, PaginationModel, space } from '@workday/canvas-kit-react';
import { Select } from '@workday/canvas-kit-preview-react/select';
import { SecondaryButton, SecondaryButtonProps } from '@workday/canvas-kit-react/button';
import { useAtom, useAtomValue } from 'jotai';
import {
  inputSortAtom,
  // pageAtom,
  queryAtom,
  querySortAtom,
  sortAtom,
} from '../atoms/searchAtoms.ts';
import styled from '@emotion/styled';
import { sortType, dirType, getWinnowedSortOptions } from '@hellfall/shared/filters';
import { ComponentPropsWithoutRef, ElementType, Ref, useEffect, useRef, useState } from 'react';
import {
  plusIcon,
  minusIcon,
  chevronLeftIcon,
  chevron2xleftIcon,
  chevronRightIcon,
  chevron2xrightIcon,
  splitIcon,
} from '@workday/canvas-system-icons-web';
import { Link } from 'react-router-dom';

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
export const ControlBar = ({ model }: { model?: PaginationModel }) => {
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySorts = useAtomValue(querySortAtom);
  const query = useAtomValue(queryAtom);
  const sortRules = useAtomValue(sortAtom);
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
  };

  useEffect(() => {
    setCanDelInput(inputSorts.length > querySorts.length && inputSorts.length > 1);
  }, [inputSorts, querySorts]);

  const handleDelInput = () => {
    // if (!canDelInput) return;
    const newInputs = [...inputSorts];
    newInputs.pop();
    setInputSorts(newInputs);
  };

  const currentPage = model?.state.currentPage;
  const lastPage = model?.state.lastPage;
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Container>
      <StyledFormField label="Sort By">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SortElements>
            {sortRules.length ? (
              sortRules.map((rule, i) => {
                const available = getAvailableOptions(i);
                return (
                  <>
                    <StyledSelect
                      key={'sort-' + i}
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
                      key={'dir-' + i}
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
                  key={'sort-0'}
                  style={{ width: '135px' }}
                  title="Change how cards are sorted"
                  aria-label="Change how cards are sorted"
                  value={'auto'}
                  disabled={false}
                  options={ALL_SORT_OPTIONS}
                  onChange={e => handleSortChange(0, e.target.value as sortType)}
                />
                <span> : </span>
                <StyledSelect
                  key={'dir-0'}
                  style={{ width: '85px' }}
                  title="Change sort direction"
                  aria-label="Change sort direction"
                  value={'auto'}
                  disabled={false}
                  options={DIR_OPTIONS}
                  onChange={e => handleDirChange(0, e.target.value as dirType)}
                />
              </>
            )}
            <>
              <ButtonGroup>
                <CompactButton
                  key="add-sort-rule"
                  icon={plusIcon}
                  title={
                    canAddInput
                      ? 'Add sort rule'
                      : "You can't add another sort rule given your current sort rules"
                  }
                  aria-label={
                    canAddInput
                      ? 'Add sort rule'
                      : "You can't add another sort rule given your current sort rules"
                  }
                  onClick={handleAddInput}
                  disabled={!canAddInput}
                />
                <CompactButton
                  key="remove-sort-rule"
                  icon={minusIcon}
                  title={
                    canDelInput
                      ? 'Remove sort rule'
                      : inputSorts.length > 1
                      ? "You can't use this to remove a sort rule specified by search terms"
                      : "You can't remove the only sort rule"
                  }
                  aria-label={
                    canDelInput
                      ? 'Remove sort rule'
                      : inputSorts.length > 1
                      ? "You can't use this to remove a sort rule specified by search terms"
                      : "You can't remove the only sort rule"
                  }
                  onClick={handleDelInput}
                  disabled={!canDelInput}
                />
              </ButtonGroup>
            </>
          </SortElements>
          {model && (
            <>
              <ControlButton
                key="first-page"
                icon={chevron2xleftIcon}
                title={`${currentPage == 1 ? 'You are on' : 'Go to'} the first page of this search`}
                aria-label={`${
                  currentPage == 1 ? 'You are on' : 'Go to'
                } the first page of this search`}
                onClick={model.events.first}
                disabled={currentPage == 1}
              />
              <ControlButton
                key="previous-page"
                icon={chevronLeftIcon}
                title={`${currentPage == 1 ? 'You are on' : 'Go to'} the ${
                  currentPage == 1 ? 'first' : 'previous'
                } page of this search`}
                aria-label={`${currentPage == 1 ? 'You are on' : 'Go to'} the ${
                  currentPage == 1 ? 'first' : 'previous'
                } page of this search`}
                onClick={model.events.previous}
                disabled={currentPage == 1}
              />
              <ControlButton
                key="random-card"
                icon={splitIcon}
                title="Find a random card within this search"
                aria-label="Find a random card within this search"
                as={Link}
                to={`/random${query ? `?q=${query}` : ''}`}
                ref={linkRef}
              />
              <ControlButton
                key="next-page"
                icon={chevronRightIcon}
                title={`${currentPage == lastPage ? 'You are on' : 'Go to'} the ${
                  currentPage == 1 ? 'last' : 'next'
                } page of this search`}
                aria-label={`${currentPage == lastPage ? 'You are on' : 'Go to'} the ${
                  currentPage == 1 ? 'last' : 'next'
                } page of this search`}
                onClick={model.events.next}
                disabled={currentPage == lastPage}
              />
              <ControlButton
                key="last-page"
                icon={chevron2xrightIcon}
                title={`${
                  currentPage == lastPage ? 'You are on' : 'Go to'
                } the last page of this search`}
                aria-label={`${
                  currentPage == lastPage ? 'You are on' : 'Go to'
                } the last page of this search`}
                onClick={model.events.last}
                disabled={currentPage == lastPage}
              />
            </>
          )}
        </div>
      </StyledFormField>
    </Container>
  );
};

const Container = styled('div')({
  paddingLeft: '36px',
  paddingRight: '36px',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
});
const StyledFormField = styled(FormField)({
  width: '100%',
  '& > div': {
    // Target the inner div
    width: '100%',
  },
});
const StyledSelect = styled(Select)({
  verticalAlign: 'top',
  display: 'inline-block',
  '&:disabled': {
    cursor: 'not-allowed',
  },
});
const SortElements = styled('div')({ lineHeight: '45px', verticalAlign: 'top', width: '100%' });
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
  '&:disabled': {
    cursor: 'not-allowed',
  },

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
const IntButton = styled(SecondaryButton)<{ as?: React.ElementType }>({
  margin: '0 2px',
  borderRadius: '4px',
  // textDecoration:'none',
  // '&:hover, &:focus, &:active': {
  //   textDecoration: 'none'
  // },
  '&:disabled': {
    cursor: 'not-allowed',
  },
});
type PolymorphicStyledButtonProps<T extends ElementType> = Omit<
  SecondaryButtonProps,
  'as' | 'ref'
> & {
  as?: T;
  // children: React.ReactNode;
  ref?: Ref<any>;
} & Omit<ComponentPropsWithoutRef<T>, keyof SecondaryButtonProps | 'as' | 'children'>;

const ControlButton = <T extends ElementType = 'button'>({
  as,
  // children,
  ref,
  ...props
}: PolymorphicStyledButtonProps<T>) => {
  const Component = as || 'button';

  return as && ref ? (
    <IntButton as={Component!} ref={ref as any} {...props} />
  ) : (
    <IntButton {...props} />
  );
};
