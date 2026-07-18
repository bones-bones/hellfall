import { BoxProps, FormField, TextProps } from '@workday/canvas-kit-react';
import { useAtom, useAtomValue } from 'jotai';
import {
  inputDisplayAtom,
  inputSortAtom,
  inputUniqueAtom,
  queryDisplayAtom,
  querySortAtom,
  queryUniqueAtom,
  sortAtom,
} from '../atoms/searchAtoms.ts';
import {
  sortType,
  dirType,
  getWinnowedSortOptions,
  parseSorts,
  uniqueType,
  displayType,
} from '@hellfall/shared/filters';
import { ReactNode, useEffect, useState } from 'react';
import { plusIcon, minusIcon } from '@workday/canvas-system-icons-web';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledDiv,
  createStenciledSpan,
  createStyledDiv,
  createStyledSecondaryButton,
  createStyledSpan,
} from '../../styling';
import { SelectItems, StyledSelect } from './StyledSelect.tsx';
// @circular-ignore Used only for links
import { useUrlSync, useSyncSorts } from '../hooks/useUrlSync.ts';
// import { useAuth } from '../../auth/AuthContext.tsx';
import { listsAreExactlyEqual } from '@hellfall/shared/utils';

const UNIQUE_OPTIONS: SelectItems<uniqueType> = [
  { label: 'Cards', value: 'cards' },
  { label: 'All prints', value: 'prints' },
  // {label: 'Unique art', label:'arts'}
];

const DISPLAY_OPTIONS: SelectItems<displayType> = [
  { label: 'Images', value: 'grid' },
  { label: 'Checklist', value: 'checklist' },
  { label: 'Text Only', value: 'text' },
  { label: 'Full', value: 'full' },
];

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
 * User control bar. Has sort controls. If you want to have something on the right, pass it as children.
 *
 * In order for this component to work properly, either {@linkcode useUrlSync} or {@linkcode useSyncSorts}
 * must be called in the body of the component that uses this. (Otherwise sort options won't sync.)
 */
export const ControlBar = ({
  noPad,
  children,
}: {
  /**
   * Whether to hide the label. If true, also removes the padding on this component.
   * Use this if you want to use different layout styling on the control bar.
   */
  noPad?: boolean;
  children?: ReactNode;
}) => {
  // const { user } = useAuth();
  const [inputUnique, setInputUnique] = useAtom(inputUniqueAtom);
  const queryUnique = useAtomValue(queryUniqueAtom);
  const [inputDisplay, setInputDisplay] = useAtom(inputDisplayAtom);
  const queryDisplay = useAtomValue(queryDisplayAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const querySorts = useAtomValue(querySortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [canAddInput, setCanAddInput] = useState<boolean>();
  const [canDelInput, setCanDelInput] = useState<boolean>();
  const getAvailableOptions = (index: number): sortType[] =>
    getWinnowedSortOptions(sortRules.slice(0, index));
  const sortIsOverridden = (index: number): boolean =>
    index < inputSorts.length && parseSort(inputSorts[index]) != sortRules[index]?.sort;
  const dirIsOverridden = (index: number): boolean =>
    index < inputSorts.length && parseDir(inputSorts[index]) != sortRules[index]?.dir;
  const handleUniqueChange = (newUnique: uniqueType) => {
    if (newUnique != inputUnique) {
      setInputUnique(newUnique);
    }
  };
  const handleDisplayChange = (newDisplay: displayType) => {
    if (newDisplay != inputDisplay) {
      setInputDisplay(newDisplay);
    }
  };
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

  const getCurrentSort = (index: number) => inputSorts[index]?.split(',')[0] as sortType;
  const getCurrentDir = (index: number) => inputSorts[index]?.split(',')[1] as dirType;
  return (
    <Container noPad={noPad}>
      <FormField className={formFieldStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SortElements>
            <StyledSelect<uniqueType>
              key={`unique-group`}
              initialValue={queryUnique ?? inputUnique}
              disabled={!!queryUnique}
              onSelect={(newValue: uniqueType) => handleUniqueChange(newValue)}
              width="135px"
              items={UNIQUE_OPTIONS}
              title={
                queryUnique
                  ? 'You specified this option in your search terms'
                  : 'Change how cards are found'
              }
            />
            <BarText> as </BarText>
            <StyledSelect<displayType>
              key={`display-group`}
              initialValue={queryDisplay ?? inputDisplay}
              disabled={!!queryDisplay}
              onSelect={(newValue: displayType) => handleDisplayChange(newValue)}
              width="135px"
              items={DISPLAY_OPTIONS}
              title={
                queryDisplay
                  ? 'You specified this option in your search terms'
                  : 'Change how cards are displayed'
              }
            />
            <BarText> sorted by </BarText>
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
                <BarText> : </BarText>
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
                {i != sortRules.length - 1 && <BarText isThen> then </BarText>}
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
          {children}
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
    noPad: {
      true: {
        paddingLeft: '0',
        paddingRight: '0',
      },
    },
  },
});
interface ContainerProps extends BoxProps {
  noPad?: boolean;
}
const Container = createStenciledDiv<ContainerProps>(containerStencil, 'Container');
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
    isThen: {
      true: {
        marginRight: '5px',
      },
    },
  },
});
interface BarTextProps extends TextProps {
  isThen?: boolean;
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
