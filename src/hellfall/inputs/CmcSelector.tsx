import { styled } from "@workday/canvas-kit-react/common";
import { Select } from "@workday/canvas-kit-preview-react/select";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { TextInput } from "@workday/canvas-kit-react/text-input";

import { useState, useEffect } from "react";

export const NumericComparatorSelector = ({
  onChange,
  initialValue,
  label,
}: {
  label: string;
  onChange?: ConditionalChange;
  initialValue?: { value: number; operator: ">" | "<" | "=" | "" };
}) => {
  const [value, setValue] = useState<undefined | number>(initialValue?.value);

  const [operator, setConditional] = useState<">" | "<" | "=">(
    initialValue?.operator || "="
  );

  useEffect(() => {
    if (value != undefined) {
      onChange?.({ operator, value });
    } else {
      onChange?.(undefined);
    }
  }, [value, operator]);
  return (
    <FormField label={label}>
      <Container>
        <StyledManaSelect
          defaultValue={operator}
          value={operator}
          onChange={(event) => {
            setConditional(event.target.value as any);
          }}
          options={[
            { value: "", label: "--" },
            { value: ">" },
            { value: "=" },
            { value: "<" },
          ]}
        />
        <TextInput
          type="number"
          width={"60px"}
          defaultValue={initialValue?.value}
          onBlur={(event) => {
            if (event.target.value == "") {
              setValue(undefined);
            } else {
              setValue(parseInt(event.target.value));
            }
          }}
        />{" "}
      </Container>
    </FormField>
  );
};

const StyledManaSelect = styled(Select)({ width: "40px" });
const Container = styled("div")({ display: "flex" });

type ConditionalChange = (
  value:
    | {
        operator: ">" | "<" | "=";
        value: number;
      }
    | undefined
) => void;
