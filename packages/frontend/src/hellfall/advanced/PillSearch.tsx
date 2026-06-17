import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { DeprecatedMenuItem, Pill } from '@workday/canvas-kit-preview-react';
import {
  FormField,
  TertiaryButton,
  Menu,
  useMenuModel,
  TextInput,
} from '@workday/canvas-kit-react';
import { createStyles } from '@workday/canvas-kit-styling';

type Props = {
  possibleValues: string[];
  values: string[];
  label: string;
  onChange: (value: string[]) => void;
};

export const PillSearch = ({ possibleValues, values, label, onChange }: Props) => {
  const [menuItems, setMenuItems] = useState(possibleValues);
  const [selectedValues, setSelectedValues] = useState(values);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuModel = useMenuModel({ returnFocusRef: searchRef });
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const listRef = useRef(null);

  useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  const [searchValue, setSearchValue] = useState('');
  if (selectedIndex && listRef.current) {
    (listRef.current as any).scrollToItem(selectedIndex);
  }

  useEffect(() => {
    onChange(selectedValues);
  }, [selectedValues]);

  const addSelection = (value: string) => {
    setSelectedValues([value, ...selectedValues].filter(Boolean));
    setSearchValue('');
    setMenuItems(possibleValues);

    menuModel.events.hide();
    searchRef.current?.blur();
  };

  const filter = (event: ChangeEvent<HTMLInputElement>) => {
    // Doing this here instead of in useEffect loop for performance reasons
    setSearchValue(event.target.value);
    const filteredValues = [
      ...possibleValues
        .filter(entry => entry.toLowerCase().includes(event.target.value.toLowerCase()))
        .filter(entry => !selectedValues.includes(entry)),
    ].filter(Boolean);

    setMenuItems(filteredValues.length ? filteredValues : [event.target.value]);
  };

  const filteredItems =
    selectedValues.length > 0
      ? menuItems.filter(entry => !selectedValues.includes(entry))
      : menuItems;

  return (
    <Menu model={menuModel}>
      <FormField label={label}>
        <TextInput
          className={textInputStyles}
          ref={searchRef}
          onFocus={() => {
            setSelectedIndex(undefined);
            menuModel.events.show();
          }}
          onChange={filter}
          value={searchValue}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (selectedIndex) {
                addSelection(filteredItems[selectedIndex]);
              } else {
                addSelection(searchValue);
              }
            } else if (e.key === 'ArrowDown') {
              setSelectedIndex(selectedIndex != undefined ? selectedIndex + 1 : 0);
            } else if (e.key === 'ArrowUp') {
              setSelectedIndex(selectedIndex && selectedIndex > 0 ? selectedIndex - 1 : undefined);
            }
          }}
        />
        <Menu.Popper anchorElement={searchRef.current} placement="bottom">
          <Menu.Card cs={cardStyles}>
            <div style={{ maxHeight: '200px', overflowY: 'auto', width: '275px' }}>
              {filteredItems.map((item, index) => (
                <DeprecatedMenuItem
                  value={item}
                  isFocused={selectedIndex === index}
                  key={item}
                  onClick={() => addSelection(item)}
                >
                  {item}
                </DeprecatedMenuItem>
              ))}
            </div>
          </Menu.Card>
        </Menu.Popper>

        {selectedValues.map(entry => {
          return (
            <Pill key={entry} variant="removable">
              <Pill.Label color={entry.startsWith('!') ? 'RED' : 'GREEN'}>{entry}</Pill.Label>
              <Pill.IconButton
                onClick={() => setSelectedValues(selectedValues.filter(val => val != entry))}
              />
            </Pill>
          );
        })}
        {selectedValues.length > 0 && (
          <TertiaryButton
            onClick={() => {
              setSelectedValues([]);
              setSearchValue('');
              setMenuItems(possibleValues);
            }}
          >
            Clear selections
          </TertiaryButton>
        )}
      </FormField>
    </Menu>
  );
};

const textInputStyles = createStyles({
  marginLeft: '0px',
});

const cardStyles = createStyles({
  overflow: 'hidden',
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
  top: '-1',
});
