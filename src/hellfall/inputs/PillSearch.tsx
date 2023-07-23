import { ChangeEvent, useEffect, useRef, useState } from "react";
import { DeprecatedMenuItem } from "@workday/canvas-kit-preview-react/menu";
import { Pill } from "@workday/canvas-kit-preview-react/pill";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { styled } from "@workday/canvas-kit-react/common";
import { TertiaryButton } from "@workday/canvas-kit-react/button";
import { TextInput } from "@workday/canvas-kit-react/text-input";

import { FixedSizeList } from "react-window";
import { Menu, useMenuModel } from "@workday/canvas-kit-react/menu";

type Props = {
  possibleValues: string[];
  defaultValues: string[];
  label: string;
  onChange: (value: string[]) => void;
};

export const PillSearch = ({
  possibleValues,
  defaultValues,
  label,
  onChange,
}: Props) => {
  const [menuItems, setMenuItems] = useState(possibleValues);
  const [selectedValues, setSelectedValues] = useState(defaultValues);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuModel = useMenuModel({ returnFocusRef: searchRef });
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const listRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  if (selectedIndex && listRef.current) {
    (listRef.current as any).scrollToItem(selectedIndex);
  }

  useEffect(() => {
    onChange(selectedValues);
  }, [selectedValues]);

  const addSelection = (value: string) => {
    setSelectedValues([value, ...selectedValues].filter(Boolean));
    setSearchValue("");
    setMenuItems(possibleValues);

    menuModel.events.hide();
    searchRef.current?.blur();
  };

  const filter = (event: ChangeEvent<HTMLInputElement>) => {
    // Doing this here instead of in useEffect loop for performance reasons
    setSearchValue(event.target.value);
    const filteredValues = [
      ...possibleValues
        .filter((entry) =>
          entry.toLowerCase().includes(event.target.value.toLowerCase())
        )
        .filter((entry) => !selectedValues.includes(entry)),
    ].filter(Boolean);

    setMenuItems(
      filteredValues.length > 0 ? filteredValues : [event.target.value]
    );
  };

  const filteredItems =
    selectedValues.length > 0
      ? menuItems.filter((entry) => !selectedValues.includes(entry))
      : menuItems;

  return (
    <Menu model={menuModel}>
      <FormField label={label}>
        <StyledTextInput
          ref={searchRef}
          onFocus={() => {
            setSelectedIndex(undefined);
            menuModel.events.show();
          }}
          onChange={filter}
          value={searchValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (selectedIndex) {
                addSelection(filteredItems[selectedIndex]);
              } else {
                addSelection(searchValue);
              }
            } else if (e.key === "ArrowDown") {
              setSelectedIndex(
                selectedIndex != undefined ? selectedIndex + 1 : 0
              );
            } else if (e.key === "ArrowUp") {
              setSelectedIndex(
                selectedIndex && selectedIndex > 0
                  ? selectedIndex - 1
                  : undefined
              );
            }
          }}
        />
        <Menu.Popper anchorElement={searchRef} placement="bottom">
          <StyledCard>
            <FixedSizeList
              ref={listRef}
              height={Math.min(200, filteredItems.length * 40)}
              itemCount={filteredItems.length}
              itemSize={35}
              width={"275px"}
              itemData={filteredItems}
            >
              {({ style, data, index }) => (
                <DeprecatedMenuItem
                  style={style}
                  value={data[index]}
                  isFocused={selectedIndex === index}
                  key={data[index]}
                  onClick={() => addSelection(data[index])}
                >
                  {data[index]}
                </DeprecatedMenuItem>
              )}
            </FixedSizeList>
          </StyledCard>
        </Menu.Popper>

        {selectedValues.map((entry) => {
          return (
            <Pill key={entry} variant="removable">
              <Pill.Label color={entry.startsWith("!") ? "RED" : "GREEN"}>
                {entry}
              </Pill.Label>
              <Pill.IconButton
                onClick={() =>
                  setSelectedValues(
                    selectedValues.filter((val) => val != entry)
                  )
                }
              />
            </Pill>
          );
        })}
        {selectedValues.length > 0 && (
          <TertiaryButton
            onClick={() => {
              setSelectedValues([]);
              setSearchValue("");
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

const StyledTextInput = styled(TextInput)({
  marginLeft: "0px",
});

const StyledCard = styled(Menu.Card)({
  overflow: "hidden",
  borderTopLeftRadius: "0px",
  borderTopRightRadius: "0px",
  top: "-1",
});
