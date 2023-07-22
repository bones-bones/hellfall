import styled from "@emotion/styled";
import { Checkbox, FormField } from "@workday/canvas-kit-react";
import { useState, useEffect } from "react";

export const CheckboxGroup = ({
  values,
  onChange,
  initialValue,
  label,
}: {
  values: string[];
  initialValue?: string[];
  onChange: (values: string[]) => void;
  label: string;
}) => {
  const [selected, setSelected] = useState<string[]>(initialValue || []);
  useEffect(() => {
    onChange(selected);
  }, [selected]);
  return (
    <FormField label={label}>
      <Container>
        {values.map((entry) => {
          return (
            <Checkbox
              key={entry}
              label={entry}
              checked={selected.includes(entry)}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelected([entry, ...selected]);
                } else {
                  setSelected(
                    selected.filter((selectedEntry) => selectedEntry != entry)
                  );
                }
              }}
            />
          );
        })}
      </Container>
    </FormField>
  );
};
const Container = styled.div({ display: "flex", flexDirection: "column" });
