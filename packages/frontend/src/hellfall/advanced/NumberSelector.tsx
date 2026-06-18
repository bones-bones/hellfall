import { useState, useEffect } from 'react';
import { looseOpList, looseOpType } from '@hellfall/shared/filters';
import { toNumber } from '@hellfall/shared/utils';
import { createStyles } from '@workday/canvas-kit-styling';
import { Box } from '@workday/canvas-kit-react';
import {
  createStyledDiv,
  createStyledInput,
  createStyledSelect,
} from '../../styling/StyledElements';
import { StyledLegend } from './AdvancedComponents';
// TODO: figure out better way to deal with 5/1

export const NumericComparatorSelector = ({
  onChange,
  value,
  label,
}: {
  label: string;
  onChange?: (e: [number | undefined, looseOpType]) => void;
  value?: [number | undefined, looseOpType];
}) => {
  const [localValue, setLocalValue] = useState<undefined | number>(value?.[0]);

  const [localOperator, setLocalOperator] = useState<looseOpType>(value?.[1] || ':');
  useEffect(() => {
    setLocalValue(value?.[0]);
    setLocalOperator(value?.[1] || ':');
  }, [value]);

  useEffect(() => {
    onChange?.([localValue, localOperator]);
  }, [localValue, localOperator, onChange]);
  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>
      <Container>
        <StyledDropdownSelect
          value={localOperator}
          onChange={event => {
            setLocalOperator(event.target.value as looseOpType);
          }}
        >
          {looseOpList.map(entry => (
            <option key={entry}>{entry}</option>
          ))}
        </StyledDropdownSelect>{' '}
        <StyledNumberInput
          type="number"
          value={localValue != undefined ? localValue : ''}
          onChange={event => {
            if (event.target.value == '') {
              setLocalValue(undefined);
            } else {
              setLocalValue(toNumber(event.target.value));
            }
          }}
        />
      </Container>
    </fieldset>
  );
};

const numberInputStyles = createStyles({ width: '40px' });
const StyledNumberInput = createStyledInput(numberInputStyles);

const dropdownSelectStyles = createStyles({ width: '40px', height: '30px' });
const StyledDropdownSelect = createStyledSelect(dropdownSelectStyles);

const containerStyles = createStyles({ display: 'flex' });
const Container = createStyledDiv(containerStyles);
