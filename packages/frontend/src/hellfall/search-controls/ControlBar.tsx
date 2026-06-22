import { FormField, PaginationModel, Select, useSelectModel } from '@workday/canvas-kit-react';
import { useAtom, useAtomValue } from 'jotai';
import {
  inputSortAtom,
  // pageAtom,
  queryAtom,
  querySortAtom,
  sortAtom,
} from '../atoms/searchAtoms.ts';
import { sortType, dirType, getWinnowedSortOptions } from '@hellfall/shared/filters';
import { useEffect, useState } from 'react';
import {
  plusIcon,
  minusIcon,
  chevronLeftIcon,
  chevron2xleftIcon,
  chevronRightIcon,
  chevron2xrightIcon,
  splitIcon,
} from '@workday/canvas-system-icons-web';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledDiv,
  createStyledSecondaryButton,
  createStyledSecondaryButtonLink,
} from '../../styling';

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

const SortSelect = ({
  index,
  sort,
  sortIsOverriden,
  getAvailableOptions,
  handleSortChange,
  inputSorts,
}: {
  index: number;
  sort: sortType;
  sortIsOverriden: (index: number) => boolean;
  getAvailableOptions: (index: number) => sortType[];
  handleSortChange: (index: number, newSort: sortType) => void;
  inputSorts: string[];
}) => {
  const available = getAvailableOptions(index);
  const sortOptions = ALL_SORT_OPTIONS.filter(opt => available.includes(opt.value));
  const currentSort: sortType = sortIsOverriden(index)
    ? sort
    : ((inputSorts[index]?.split(',')[0] ?? sort) as sortType);
  const selectModel = useSelectModel({
    initialSelectedIds: [currentSort],
    items: sortOptions,
    getId: item => item.value,
    getTextValue: item => item.label,
    onSelect: data => {
      handleSortChange(index, data.id as sortType);
    },
  });
  useEffect(() => {
    const currentSelectedId = selectModel.state.selectedIds[0];
    if (currentSelectedId !== currentSort) {
      selectModel.events.select({ id: currentSort });
    }
  }, [currentSort]);

  return (
    <div {...selectStencil()}>
      <Select key={`sort-group-${index}`} items={sortOptions} model={selectModel}>
        <Select.Input
          title={
            sortIsOverriden(index)
              ? 'You specified this option in your search terms'
              : 'Change how cards are sorted'
          }
          aria-label={
            sortIsOverriden(index)
              ? 'You specified this option in your search terms'
              : 'Change how cards are sorted'
          }
          disabled={sortIsOverriden(index)}
          cs={inputStencil()}
        />
        <Select.Popper>
          <Select.Card {...cardStencil()}>
            <Select.List {...listStencil()}>
              {(item: { value: string; label: sortType }) => (
                <Select.Item key={item.value} {...itemStencil()}>
                  {item.label}
                </Select.Item>
              )}
            </Select.List>
          </Select.Card>
        </Select.Popper>
      </Select>
    </div>
  );
};
const DirSelect = ({
  index,
  dir,
  dirIsOverriden,
  handleDirChange,
  inputSorts,
}: {
  index: number;
  dir: dirType;
  dirIsOverriden: (index: number) => boolean;
  handleDirChange: (index: number, newDir: dirType) => void;
  inputSorts: string[];
}) => {
  const currentDir: dirType = dirIsOverriden(index)
    ? dir
    : ((inputSorts[index]?.split(',')[1] ?? dir) as dirType);
  const selectModel = useSelectModel({
    initialSelectedIds: [currentDir],
    items: DIR_OPTIONS,
    getId: item => item.value,
    getTextValue: item => item.label,
    onSelect: data => {
      handleDirChange(index, data.id as dirType);
    },
  });

  useEffect(() => {
    const currentSelectedId = selectModel.state.selectedIds[0];
    if (currentSelectedId !== currentDir) {
      selectModel.events.select({ id: currentDir });
    }
  }, [currentDir]);
  return (
    <div {...selectStencil({ isDir: true })}>
      <Select key={`dir-group-${index}`} items={DIR_OPTIONS} model={selectModel}>
        <Select.Input
          title={
            dirIsOverriden(index)
              ? 'You specified this option in your search terms'
              : 'Change sort direction'
          }
          aria-label={
            dirIsOverriden(index)
              ? 'You specified this option in your search terms'
              : 'Change sort direction'
          }
          disabled={dirIsOverriden(index)}
          cs={inputStencil({ isDir: true })}
        />
        <Select.Popper>
          <Select.Card {...cardStencil({ isDir: true })}>
            <Select.List {...listStencil({ isDir: true })}>
              {(item: { value: string; label: dirType }) => (
                <Select.Item key={item.value} {...itemStencil({ isDir: true })}>
                  {item.label}
                </Select.Item>
              )}
            </Select.List>
          </Select.Card>
        </Select.Popper>
      </Select>
    </div>
  );
};

export const ControlBar = ({ model }: { model?: PaginationModel }) => {
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySorts = useAtomValue(querySortAtom);
  const query = useAtomValue(queryAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): sortType[] =>
    getWinnowedSortOptions(sortRules.slice(0, index));
  const sortIsOverriden = (index: number): boolean =>
    index < inputSorts.length && parseSort(inputSorts[index]) != sortRules[index]?.sort;
  const dirIsOverriden = (index: number): boolean =>
    index < inputSorts.length && parseDir(inputSorts[index]) != sortRules[index]?.dir;
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

  // const handleClick = (
  //   e: React.MouseEvent,
  //   customHandler: React.MouseEventHandler<HTMLAnchorElement>
  // ) => {
  //   if (e.button === 1 || e.metaKey || e.ctrlKey) {
  //     // Let the link handle it naturally
  //     return;
  //   }
  //   e.preventDefault();
  //   customHandler(e as any);
  // };

  // const [page, setPage] = useAtom(pageAtom);
  const currentPage = model?.state.currentPage;
  const lastPage = model?.state.lastPage;

  return (
    <Container>
      <FormField className={formFieldStyles}>
        <FormField.Label>Sort By</FormField.Label>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SortElements>
            {sortRules.length ? (
              sortRules.map((rule, i) => (
                <div key={`sort-wrapper-${i}`} style={{ display: 'inline-block' }}>
                  <SortSelect
                    index={i}
                    sort={rule.sort}
                    sortIsOverriden={sortIsOverriden}
                    getAvailableOptions={getAvailableOptions}
                    handleSortChange={handleSortChange}
                    inputSorts={inputSorts}
                  />
                  <span> : </span>
                  <DirSelect
                    index={i}
                    dir={rule.dir}
                    dirIsOverriden={dirIsOverriden}
                    handleDirChange={handleDirChange}
                    inputSorts={inputSorts}
                  />
                  {i != sortRules.length - 1 && <span style={{ marginRight: '5px' }}> then </span>}
                </div>
              ))
            ) : (
              <div style={{ display: 'inline-block' }}>
                <SortSelect
                  index={0}
                  sort="auto"
                  sortIsOverriden={sortIsOverriden}
                  getAvailableOptions={getAvailableOptions}
                  handleSortChange={handleSortChange}
                  inputSorts={inputSorts}
                />
                <span> : </span>
                <DirSelect
                  index={0}
                  dir="auto"
                  dirIsOverriden={dirIsOverriden}
                  handleDirChange={handleDirChange}
                  inputSorts={inputSorts}
                />
              </div>
            )}
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
                icon={chevron2xleftIcon}
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
      </FormField>
    </Container>
  );
};

const containerStyles = createStyles({
  paddingLeft: '36px',
  paddingRight: '36px',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
});
const Container = createStyledDiv(containerStyles);
const formFieldStyles = createStyles({
  width: '100%',
  '& > div': {
    // Target the inner div
    width: '100%',
  },
});
const selectStyles = {
  verticalAlign: 'top',
  display: 'inline-block',
  width: '135px',
  '&:disabled': {
    cursor: 'not-allowed',
  },
};
const selectStencil = createStencil({
  vars: {},
  base: selectStyles,
  modifiers: {
    isDir: {
      true: {
        width: '85px',
      },
    },
  },
});
const inputStyles = {
  verticalAlign: 'top',
  display: 'inline-block',
  borderRadius: '4px',
  width: '135px',
  minWidth: '135px',
  '&:disabled': {
    cursor: 'not-allowed',
  },
};
const inputStencil = createStencil({
  vars: {},
  base: inputStyles,
  modifiers: {
    isDir: {
      true: {
        width: '85px',
        minWidth: '85px',
      },
    },
  },
});
// const popperStyles = createStyles({
// })

const cardStyles = {
  // height:0,
  backgroundColor: 'white',
  border: '1px solid #d1d1d1',
  borderRadius: 0,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '4px 0',
  width: '135px !important',
  marginTop: '-4px',
  marginBottom: '-4px',
  overflowX: 'hidden',
  '& > div': {
    marginTop: '-4px !important',
    marginBottom: '-4px !important',
    overflowX: 'hidden' as any,
    borderRadius: 0,
    '& > div': {
      marginTop: 0,
      marginBottom: 0,
    },
  },
};
const cardStencil = createStencil({
  vars: {},
  base: cardStyles,
  modifiers: {
    isDir: {
      true: {
        width: '85px !important',
      },
    },
  },
});
const listStyles = {
  width: '135px',
  marginTop: 0,
  marginBottom: 0,
  overflowX: 'hidden',
  borderRadius: 0,
};
const listStencil = createStencil({
  vars: {},
  base: listStyles,
  modifiers: {
    isDir: {
      true: {
        width: '85px',
      },
    },
  },
});
const itemStyles = {
  width: '135px',
  borderRadius: 0,
  '& > span': {
    '& > svg': {
      display: 'none',
    },
  },
};
const itemStencil = createStencil({
  vars: {},
  base: itemStyles,
  modifiers: {
    isDir: {
      true: {
        width: '85px',
      },
    },
  },
});

const sortElementsStyles = createStyles({
  lineHeight: '45px',
  verticalAlign: 'top',
  width: '100%',
});
const SortElements = createStyledDiv(sortElementsStyles);

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
const CompactButton = createStyledSecondaryButton(compactButtonStyles);

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'column', // Stack vertically
  // gap: '4px',               // Space between buttons
  marginLeft: '4px', // Optional spacing from the selectors
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles);

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
const ControlButton = createStyledSecondaryButton(controlButtonStyles);
const ControlButtonLink = createStyledSecondaryButtonLink(controlButtonStyles);
