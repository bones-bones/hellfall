import { ChangeEvent, useEffect, useRef, useState } from 'react';
// TODO: replace DeprecatedMenuItem once I figure out how to replicate its behavior
import { useMultiSelectModel } from '@workday/canvas-kit-preview-react';
import { TextInput, FormField, Pill } from '@workday/canvas-kit-react';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { listEquals } from '@hellfall/shared/utils';
import {
  createStenciledButtonDiv,
  createStenciledDiv,
  createStyledDiv,
  createStyledTertiaryButton,
  StenciledButtonDivProps,
} from '../../styling';

type Props = {
  possibleValues: string[];
  values: string[];
  label: string;
  onChange: (value: string[]) => void;
};

export const PillSearch = ({ possibleValues, values, label, onChange }: Props) => {
  const [menuItems, setMenuItems] = useState(possibleValues);
  const [selectedValues, setSelectedValues] = useState(values);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  // const menuModel = useMenuModel({ returnFocusRef: searchRef });
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  const model = useMultiSelectModel({
    items: possibleValues,
    initialSelectedIds: values,
  });

  useEffect(() => {
    onChange(selectedValues);
  }, [selectedValues]);

  const getSelectedArray = (): string[] => {
    const selected = model.state.selectedIds;
    if (selected === 'all') {
      return possibleValues;
    }
    return selected || [];
  };

  useEffect(() => {
    const newSelected = getSelectedArray();
    if (!listEquals(selectedValues, newSelected)) {
      setSelectedValues(newSelected);
    }
  }, [model.state.selectedIds, possibleValues]);

  const filter = (event: ChangeEvent<HTMLInputElement>) => {
    // Doing this here instead of in useEffect loop for performance reasons
    const value = event.target.value;
    setSearchValue(value);
    const filteredValues = [
      ...possibleValues
        .filter(entry => entry.toLowerCase().includes(value.toLowerCase()))
        .filter(entry => !selectedValues.includes(entry)),
    ].filter(Boolean);

    setMenuItems(filteredValues.length ? filteredValues : [value]);
    setIsOpen(true);
    setFocusedIndex(undefined);
  };

  const addSelection = (value: string) => {
    if (value && !selectedValues.includes(value)) {
      const newSelected = [...selectedValues, value];
      setSelectedValues(newSelected);
      model.events.setSelectedIds(newSelected);
    }
    setSearchValue('');
    setMenuItems(possibleValues);
    setIsOpen(false);
    setFocusedIndex(undefined);
    inputRef.current?.focus();
  };

  const removeSelection = (item: string) => {
    const newSelected = selectedValues.filter(val => val !== item);
    setSelectedValues(newSelected);
    model.events.setSelectedIds(newSelected);

    // Refresh menu items when removing
    const filtered = possibleValues
      .filter(entry => entry.toLowerCase().includes(searchValue.toLowerCase()))
      .filter(entry => !newSelected.includes(entry));
    setMenuItems(filtered.length ? filtered : [searchValue]);
  };
  const clearAll = () => {
    setSelectedValues([]);
    setSearchValue('');
    setMenuItems(possibleValues);
    model.events.setSelectedIds([]);
    setIsOpen(false);
    setFocusedIndex(undefined);
    inputRef.current?.focus();
  };
  const filteredItems = selectedValues.length
    ? menuItems.filter(entry => !selectedValues.includes(entry))
    : menuItems;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex != undefined && filteredItems[focusedIndex]) {
        addSelection(filteredItems[focusedIndex]);
      } else {
        addSelection(searchValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev === undefined ? 0 : Math.min(prev + 1, filteredItems.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev === undefined ? filteredItems.length - 1 : Math.max(prev - 1, 0)
      );
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setFocusedIndex(undefined);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(undefined);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <FormField cs={formFieldStyles}>
      <FormField.Label>{label}</FormField.Label>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <TextInput
          className={textInputStyles}
          ref={searchRef}
          onFocus={() => {
            // setFocusedIndex(undefined);
            setIsOpen(true);
          }}
          onChange={filter}
          value={searchValue}
          onKeyDown={handleKeyDown}
        />
        {isOpen && (filteredItems.length || searchValue) && (
          <DropdownContainer>
            {filteredItems.map((item, index) => {
              return (
                <DropdownItem
                  key={item}
                  onClick={() => addSelection(item)}
                  isFocused={focusedIndex === index}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseLeave={() => setFocusedIndex(undefined)}
                >
                  {item}
                </DropdownItem>
              );
            })}
          </DropdownContainer>
        )}
      </div>
      <PillContainer>
        {selectedValues.map(entry => {
          return (
            <Pill key={entry} variant="removable">
              <Pill.Label color={entry.startsWith('!') ? 'RED' : 'GREEN'}>{entry}</Pill.Label>
              <Pill.IconButton onClick={() => removeSelection(entry)} />
            </Pill>
          );
        })}
        {selectedValues.length > 0 && (
          <ClearButton
            onClick={() => {
              clearAll();
            }}
          >
            Clear selections ({selectedValues.length})
          </ClearButton>
        )}
      </PillContainer>
    </FormField>
  );
};

const formFieldStyles = createStyles({ marginBottom: 0 });
const textInputStyles = createStyles({
  marginLeft: '0px',
  width: '275px',
});

const cardStyles = createStyles({
  overflow: 'hidden',
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
  top: '-1',
  marginTop: '-4px',
  marginBottom: '-4px',
});

const pillContainerStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginBottom: '8px',
  marginTop: '8px',
});
const PillContainer = createStyledDiv(pillContainerStyles, 'PillContainer');

const dropdownContainerStyles = createStyles({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  width: '275px',
  maxHeight: '200px',
  overflowY: 'auto',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginTop: '0px',
  marginBottom: '0px',
  zIndex: 1000,
  overflowX: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
});
const DropdownContainer = createStyledDiv(dropdownContainerStyles, 'DropdownContainer');

const dropdownItemStencil = createStencil({
  vars: {},
  base: {
    padding: '8px 16px',
    cursor: 'pointer',
    width: '275px',
    backgroundColor: 'transparent',
    border: '0',
    // alignContent:'left',
    // alignItems:'left',
    textAlign: 'left',
    overflowX: 'hidden',
  },
  modifiers: {
    isFocused: {
      true: {
        backgroundColor: 'var(--cnvs-brand-primary-base)',
        color: 'var(--cnvs-brand-primary-accent)',
      },
    },
  },
});
interface DropdownItemProps extends StenciledButtonDivProps {
  isFocused?: boolean;
}
const DropdownItem = createStenciledButtonDiv<DropdownItemProps>(
  dropdownItemStencil,
  'DropdownItem'
);

const clearButtonStyles = createStyles({ height: 'auto' });
const ClearButton = createStyledTertiaryButton(clearButtonStyles, 'ClearButton');
