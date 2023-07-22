import { SearchForm } from "@workday/canvas-kit-labs-react/search-form";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { DeprecatedMenuItem } from "@workday/canvas-kit-preview-react/menu";
import { Pill } from "@workday/canvas-kit-preview-react/pill";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { styled } from "@workday/canvas-kit-react/common";
import { TertiaryButton } from "@workday/canvas-kit-react";

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
  const searchRef = useRef(null);

  useEffect(() => {
    onChange(selectedValues);
  }, [selectedValues]);

  const filter = (event: ChangeEvent<HTMLInputElement>) => {
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

  const setValue = (value: string) => {
    setSelectedValues([value, ...selectedValues].filter(Boolean));
    (searchRef as any).current.inputRef.current.parentNode.children[1].click();
  };

  // const entryMappings = useMemo(() => {
  //   console.log("mem");
  //   return menuItems.map((entry) => (
  //     <DeprecatedMenuItem
  //       value={entry}
  //       key={entry}
  //       onClick={() => {
  //         setValue(entry);
  //       }}
  //     >
  //       {entry}
  //     </DeprecatedMenuItem>
  //   ));
  // }, [menuItems]);
  const filteredItems = (
    selectedValues.length > 0
      ? menuItems.filter((entry) => !selectedValues.includes(entry))
      : menuItems
  )
    .map((entry) => (
      <DeprecatedMenuItem
        value={entry}
        key={entry}
        onClick={() => {
          setValue(entry);
        }}
      >
        {entry}
      </DeprecatedMenuItem>
    ))
    .slice(0, 200);

  if (filteredItems.length > 1) {
    filteredItems.push(
      <DeprecatedMenuItem isDisabled key={"search to narrow results"}>
        search to narrow results
      </DeprecatedMenuItem>
    );
  }

  return (
    <>
      <FormField label={label}>
        <StyledSearchForm
          ref={searchRef}
          //          autocompleteItems={entryMappings}
          autocompleteItems={filteredItems}
          onInputChange={filter}
          onSubmit={(e) => {
            // holy crap what are you doing. This is so bad. It works though, which is nice.
            setValue((e as any).currentTarget.elements["search"].value);
          }}
        />
        {selectedValues.map((entry) => {
          return (
            <Pill key={entry} variant="removable">
              <Pill.Label color={entry.startsWith("!") ? "RED" : "GREEN"}>
                {entry}
              </Pill.Label>
              <Pill.IconButton
                onClick={() => {
                  setSelectedValues(
                    selectedValues.filter((val) => val != entry)
                  );
                }}
              />
            </Pill>
          );
        })}
        {selectedValues.length > 0 && (
          <TertiaryButton
            onClick={() => {
              setSelectedValues([]);
            }}
          >
            Clear all
          </TertiaryButton>
        )}
      </FormField>
    </>
  );
};

const StyledSearchForm = styled(SearchForm)({
  marginLeft: "0px",
});
