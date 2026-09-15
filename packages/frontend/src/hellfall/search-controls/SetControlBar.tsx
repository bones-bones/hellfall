import { BoxProps, FormField, TextProps } from '@workday/canvas-kit-react';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, sortAtom, inputFilterAtom } from '../atoms/setAtoms.ts';
import {
  setSortType,
  dirType,
  getWinnowedSetSortOptions,
  parseSetSorts,
  displayType,
} from '@hellfall/shared/filters';
import { ReactNode, useEffect, useState } from 'react';
import { plusIcon, minusIcon } from '@workday/canvas-system-icons-web';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledSpan, createStyledDiv, createStyledSecondaryButton } from '../../styling';
import { SelectItems, StyledSelect } from './StyledSelect.tsx';
// @circular-ignore Used only for links
import { useSetUrlSync } from '../hooks/useSetUrlSync.ts';
import { listsAreExactlyEqual } from '@hellfall/shared/utils';
import { SetFilterType, toSetFilterType } from '@hellfall/shared/types';

const ALL_SORT_OPTIONS: SelectItems<setSortType> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
  { label: 'Code', value: 'code' },
  { label: 'Block/Group', value: 'block' },
  { label: 'No. of Cards', value: 'number' },
];

const DIR_OPTIONS: SelectItems<dirType> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Asc', value: 'asc' },
  { label: 'Desc', value: 'desc' },
];
type filterType = SetFilterType | 'any';
const TYPE_OPTIONS: SelectItems<filterType> = [
  { label: 'Any', value: 'any' },
  { label: 'Full', value: 'full' },
  { label: 'Main', value: 'main' },
  { label: 'Side', value: 'side' },
  { label: 'Lair', value: 'lair' },
  { label: 'Vetoed', value: 'veto' },
  { label: 'Land', value: 'land' },
  { label: 'Memorabilia', value: 'memorabilia' },
  { label: 'Unfunny', value: 'unfunny' },
];
const parseSort = (order: string): setSortType => order?.split(',')[0] as setSortType;
const parseDir = (order: string): dirType => order?.split(',')[1] as dirType;

/**
 * User control bar. Has sort controls. If you want to have something on the right, pass it as children.
 *
 * In order for this component to work properly, {@linkcode useSetUrlSync} must be called
 * in the body of the component that uses this. (Otherwise sort options won't sync.)
 */
export const SetControlBar = ({
  setNum,
  children,
}: {
  /**
   * Whether to hide the label. If true, also removes the padding on this component.
   * Use this if you want to use different layout styling on the control bar.
   */
  setNum: number;
  children?: ReactNode;
}) => {
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [inputFilter, setInputFilter] = useAtom(inputFilterAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): setSortType[] =>
    getWinnowedSetSortOptions(sortRules.slice(0, index));
  const handleFilterChange = (newFilter: filterType) => {
    const filterToUse = toSetFilterType(newFilter);
    if (filterToUse != inputFilter) {
      setInputFilter(filterToUse);
    }
  };
  const handleSortChange = (index: number, newSort: setSortType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newSort != parseSort(newInputs[index])) {
      newInputs[index] = `${newSort},${parseDir(newInputs[index] ?? 'auto,auto')}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      setInputSorts(newInputs);
    }
  };
  const handleDirChange = (index: number, newDir: dirType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newDir != parseDir(newInputs[index])) {
      newInputs[index] = `${parseSort(newInputs[index] ?? 'auto,auto')},${newDir}`;
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
    setCanDelInput(inputSorts.length > 1);
  }, [inputSorts]);

  const handleDelInput = () => {
    // if (!canDelInput) return;
    const newInputs = [...inputSorts];
    newInputs.pop();
    setInputSorts(newInputs);
  };

  const getCurrentSort = (index: number) => inputSorts[index]?.split(',')[0] as setSortType;
  const getCurrentDir = (index: number) => inputSorts[index]?.split(',')[1] as dirType;
  return (
    <Container>
      <FormField className={formFieldStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SortElements>
            <BarText> {setNum} sets sorted by </BarText>
            {(sortRules.length
              ? sortRules
              : parseSetSorts(inputSorts.length ? inputSorts : ['auto,auto'])
            ).map((rule, i) => (
              <div key={`sort-wrapper-${i}`} style={{ display: 'inline-block' }}>
                <StyledSelect<setSortType>
                  key={`sort-group-${i}`}
                  initialValue={rule.sort}
                  availableValues={getAvailableOptions(i)}
                  onSelect={(newValue: setSortType) => handleSortChange(i, newValue)}
                  width="135px"
                  items={ALL_SORT_OPTIONS}
                  currentValue={getCurrentSort(i)}
                  title={'Change how sets are sorted'}
                />
                <BarText> : </BarText>
                <StyledSelect<dirType>
                  key={`dir-group-${i}`}
                  initialValue={rule.dir}
                  onSelect={(newValue: dirType) => handleDirChange(i, newValue)}
                  width="85px"
                  items={DIR_OPTIONS}
                  currentValue={getCurrentDir(i)}
                  title={'Change sort direction'}
                />
                {i < sortRules.length - 1 && <BarText data-is-then> then </BarText>}
              </div>
            ))}
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
                title={canDelInput ? 'Remove sort rule' : "You can't remove the only sort rule"}
                aria-label={
                  canDelInput ? 'Remove sort rule' : "You can't remove the only sort rule"
                }
                onClick={handleDelInput}
                disabled={!canDelInput}
              />
            </ButtonGroup>
            <BarText> of type </BarText>
            <StyledSelect<filterType>
              key={`filter-group`}
              initialValue={inputFilter ?? 'any'}
              onSelect={(newValue: filterType) => handleFilterChange(newValue)}
              width="110px"
              items={TYPE_OPTIONS}
              title={'Change which sets are shown'}
            />
          </SortElements>
          {children}
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
const Container = createStyledDiv(containerStyles, 'Container');
const formFieldStyles = createStyles({
  width: '100%',
  '& > div': {
    // Target the inner div
    width: '100%',
  },
});

const barTextStencil = createStencil({
  vars: {},
  base: {
    position: 'relative',
    top: '-2px',
  },
  modifiers: {
    'data-is-then': {
      true: {
        marginRight: '5px',
      },
    },
  },
});
interface BarTextProps extends TextProps {
  'data-is-then'?: boolean;
}
const BarText = createStenciledSpan<BarTextProps>(barTextStencil);

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
