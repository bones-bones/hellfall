import { BoxProps, FormField, PaginationModel } from '@workday/canvas-kit-react';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, queryAtom, querySortAtom, sortAtom } from '../atoms/searchAtoms.ts';
import { sortType, dirType, getWinnowedSortOptions, parseSorts } from '@hellfall/shared/filters';
import { useEffect, useState } from 'react';
import {
  plusIcon,
  minusIcon,
  chevronLeftIcon,
  chevronRightIcon,
  splitIcon,
  chevron2xLeftIcon,
  chevron2xRightIcon,
} from '@workday/canvas-system-icons-web';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledDiv,
  createStyledDiv,
  createStyledSecondaryButton,
  createStyledSecondaryButtonLink,
} from '../../styling';
import { SelectItems, StyledSelect } from './StyledSelect.tsx';
// @circular-ignore Used only for links
import { useUrlSync, useSyncSorts } from '../hooks/useUrlSync.ts';
// import { useAuth } from '../../auth/AuthContext.tsx';
import { listsAreExactlyEqual } from '@hellfall/shared/utils';

const ALL_SORT_OPTIONS: SelectItems<sortType> = [
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

const DIR_OPTIONS: SelectItems<dirType> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Asc', value: 'asc' },
  { label: 'Desc', value: 'desc' },
];
const parseSort = (order: string): sortType => order?.split(',')[0] as sortType;
const parseDir = (order: string): dirType => order?.split(',')[1] as dirType;

/**
 * User control bar. Has both sort controls and pagination controls. The pagination controls can be
 * omitted by omitting `model`.
 *
 * In order for this component to work properly, either {@linkcode useUrlSync} or {@linkcode useSyncSorts}
 * must be called in the body of the component that uses this. (Otherwise sort options won't sync.)
 */
export const ControlBar = ({
  model,
  noLabel,
}: {
  /**
   * The {@linkcode PaginationModel} to use. If omitted, the pagination controls will also be omitted
   */
  model?: PaginationModel;
  /**
   * Whether to hide the label. If true, also removes the padding on this component.
   * Use this if you want to use different layout styling on the control bar.
   */
  noLabel?: boolean;
}) => {
  // const { user } = useAuth();
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySorts = useAtomValue(querySortAtom);
  const query = useAtomValue(queryAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): sortType[] =>
    getWinnowedSortOptions(sortRules.slice(0, index));
  const sortIsOverridden = (index: number): boolean =>
    index < inputSorts.length && parseSort(inputSorts[index]) != sortRules[index]?.sort;
  const dirIsOverridden = (index: number): boolean =>
    index < inputSorts.length && parseDir(inputSorts[index]) != sortRules[index]?.dir;
  const handleSortChange = (index: number, newSort: sortType) => {
    const newInputs =
      sortRules.length && inputSorts.length
        ? [...inputSorts]
        : /* user?.defaultSorts ?? */ ['auto,auto'];
    if (newSort != parseSort(newInputs[index])) {
      newInputs[index] = `${newSort},${parseDir(
        newInputs[index] ?? /* user?.defaultSorts?.[index] ?? */ 'auto,auto'
      )}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      setInputSorts(newInputs);
    }
  };
  const handleDirChange = (index: number, newDir: dirType) => {
    const newInputs =
      sortRules.length && inputSorts.length
        ? [...inputSorts]
        : /* user?.defaultSorts ?? */ ['auto,auto'];
    if (newDir != parseDir(newInputs[index])) {
      newInputs[index] = `${parseSort(
        newInputs[index] ?? /* user?.defaultSorts?.[index] ?? */ 'auto,auto'
      )},${newDir}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      setInputSorts(newInputs);
    }
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
  const getCurrentSort = (index: number) => inputSorts[index]?.split(',')[0] as sortType;
  const getCurrentDir = (index: number) => inputSorts[index]?.split(',')[1] as dirType;
  return (
    <Container noLabel={noLabel}>
      <FormField className={formFieldStyles}>
        {!noLabel && <FormField.Label>Sort By</FormField.Label>}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SortElements>
            {(sortRules.length
              ? sortRules
              : parseSorts(inputSorts.length ? inputSorts : ['auto,auto'])
            ).map((rule, i) => (
              <div key={`sort-wrapper-${i}`} style={{ display: 'inline-block' }}>
                <StyledSelect<sortType>
                  key={`sort-group-${i}`}
                  initialValue={rule.sort}
                  disabled={sortIsOverridden(i)}
                  availableValues={getAvailableOptions(i)}
                  onSelect={(newValue: sortType) => handleSortChange(i, newValue)}
                  width="135px"
                  items={ALL_SORT_OPTIONS}
                  currentValue={getCurrentSort(i)}
                  title={
                    sortIsOverridden(i)
                      ? 'You specified this option in your search terms'
                      : 'Change how cards are sorted'
                  }
                />
                <span> : </span>
                <StyledSelect<dirType>
                  key={`dir-group-${i}`}
                  initialValue={rule.dir}
                  disabled={dirIsOverridden(i)}
                  onSelect={(newValue: dirType) => handleDirChange(i, newValue)}
                  width="85px"
                  items={DIR_OPTIONS}
                  currentValue={getCurrentDir(i)}
                  title={
                    dirIsOverridden(i)
                      ? 'You specified this option in your search terms'
                      : 'Change sort direction'
                  }
                />
                {i != sortRules.length - 1 && <span style={{ marginRight: '5px' }}> then </span>}
              </div>
            ))}
            <>
              <ButtonGroup>
                <CompactButton
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
                icon={chevron2xLeftIcon}
                title={`${currentPage == 1 ? 'You are on' : 'Go to'} the first page of this search`}
                aria-label={`${
                  currentPage == 1 ? 'You are on' : 'Go to'
                } the first page of this search`}
                onClick={model.events.first}
                disabled={currentPage == 1}
              />
              <ControlButton
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
              <ControlButtonLink
                icon={splitIcon}
                title="Find a random card within this search"
                aria-label="Find a random card within this search"
                to={`/random${query ? `?q=${query}` : ''}`}
              />
              <ControlButton
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
                icon={chevron2xRightIcon}
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
      </FormField>
    </Container>
  );
};

const containerStencil = createStencil({
  vars: {},
  base: {
    paddingLeft: '36px',
    paddingRight: '36px',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  modifiers: {
    noLabel: {
      true: {
        paddingLeft: '0',
        paddingRight: '0',
      },
    },
  },
});
interface ContainerProps extends BoxProps {
  noLabel?: boolean;
}
const Container = createStenciledDiv<ContainerProps>(containerStencil, 'Container');
const formFieldStyles = createStyles({
  width: '100%',
  '& > div': {
    // Target the inner div
    width: '100%',
  },
});

const sortElementsStyles = createStyles({
  lineHeight: '45px',
  verticalAlign: 'top',
  width: '100%',
});
const SortElements = createStyledDiv(sortElementsStyles, 'SortElements');

const compactButtonStyles = createStyles({
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
  '& > span': {
    svg: {
      width: '14px', // Smaller icon
      height: '14px',
      display: 'block',
      margin: '0px 0px -0.5px 0px',
      alignSelf: 'center',
      verticalAlign: 'top',
    },
  },
});
const CompactButton = createStyledSecondaryButton(compactButtonStyles, 'CompactButton');

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'column', // Stack vertically
  // gap: '4px',               // Space between buttons
  marginLeft: '4px', // Optional spacing from the selectors
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles, 'ButtonGroup');

const controlButtonStyles = createStyles({
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
const ControlButton = createStyledSecondaryButton(controlButtonStyles, 'ControlButton');
const ControlButtonLink = createStyledSecondaryButtonLink(controlButtonStyles, 'ControlButtonLink');
