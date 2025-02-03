import styled from "@emotion/styled";

import { useState, useEffect } from "react";
import { StyledLegend } from "../StyledLabel";

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
    <fieldset>
      <StyledLegend>{label}</StyledLegend>
      <Container>
        <StyledManaSelect
          defaultValue={operator}
          value={operator}
          onChange={(event) => {
            setConditional(event.target.value as any);
          }}
        >
          {[
            { value: "", label: "--" },
            { value: ">" },
            { value: "=" },
            { value: "<" },
          ].map((entry) => (
            <option key={entry.value}>{entry.label || entry.value}</option>
          ))}
        </StyledManaSelect>{" "}
        <StyledNumberInput
          type="number"
          defaultValue={initialValue?.value}
          onBlur={(event) => {
            if (event.target.value == "") {
              setValue(undefined);
            } else {
              setValue(parseInt(event.target.value));
            }
          }}
        />
      </Container>
    </fieldset>
  );
};

const StyledNumberInput = styled("input")({ width: "40px" });

const StyledManaSelect = styled("select")({ width: "40px", height: "30px" });
const Container = styled("div")({ display: "flex" });

type ConditionalChange = (
  value:
    | {
        operator: ">" | "<" | "=";
        value: number;
      }
    | undefined
) => void;
