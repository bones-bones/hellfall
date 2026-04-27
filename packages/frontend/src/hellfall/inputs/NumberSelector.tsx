import styled from '@emotion/styled';

import { useState, useEffect } from 'react';
import { StyledLegend } from '../StyledLabel.tsx';
// TODO: figure out better way to deal with 5/1
export const toNumber = (numStr: string | undefined) => {
  const zeroEquivs = ['?', 'N', 'X', 'Y', 'Z', '*', ''];
  const specialCases: Record<string, number> = {
    '[7': 7,
    '7]': 7,
    '[3': 3,
    '4]': 4,
    '∞': 1e25,
    '2σ': 0,
    '3*X': 0,
    '3*Y+1': 1,
    '-Your life total': 0,
    '⌊2^n⌋': 1,
    '⌊2^n-1⌋': 0,
    '2.23E-308': 2.23e-308,
    '5/1': 1,
    '+2/+2': 2,
    '0[+1]{+2}': 3,
    '0[+1]{+7}': 8,
  };
  if (!numStr) {
    return undefined;
  } else if (numStr in specialCases) {
    return specialCases[numStr];
  } else if (zeroEquivs.includes(numStr)) {
    return 0;
  } else if (numStr.includes('+')) {
    const nums = numStr.split('+');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 + num2 : undefined;
  } else if (numStr.includes('-')) {
    const nums = numStr.split('-');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 - num2 : undefined;
  } else {
    const num = parseFloat(numStr);
    return !Number.isNaN(num) ? num : undefined;
  }
};

export const NumericComparatorSelector = ({
  onChange,
  value,
  label,
}: {
  label: string;
  onChange?: (e: [number, '<' | '<=' | '=' | '>=' | '>'] | undefined) => void;
  value?: [number, '<' | '<=' | '=' | '>=' | '>'];
}) => {
  const [localValue, setLocalValue] = useState<undefined | number>(value?.[0]);

  const [localOperator, setLocalOperator] = useState<'<' | '<=' | '=' | '>=' | '>'>(
    value?.[1] || '='
  );
  useEffect(() => {
    setLocalValue(value?.[0]);
    setLocalOperator(value?.[1] || '=');
  }, [value]);

  useEffect(() => {
    if (localValue != undefined && localOperator) {
      onChange?.([localValue, localOperator]);
    } else {
      onChange?.(undefined);
    }
  }, [localValue, localOperator, onChange]);
  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>
      <Container>
        <StyledDropdownSelect
          // defaultValue={operator}
          value={localOperator}
          onChange={event => {
            setLocalOperator(event.target.value as any);
          }}
        >
          {[
            { value: '', label: '--' },
            { value: '>' },
            { value: '>=' },
            { value: '=' },
            { value: '<=' },
            { value: '<' },
          ].map(entry => (
            <option key={entry.value}>{entry.label || entry.value}</option>
          ))}
        </StyledDropdownSelect>{' '}
        <StyledNumberInput
          type="number"
          value={localValue != undefined ? localValue : ''}
          onChange={event => {
            if (event.target.value == '') {
              const inputValue = event.target.value;
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

const StyledNumberInput = styled('input')({ width: '40px' });

const StyledDropdownSelect = styled('select')({ width: '40px', height: '30px' });
const Container = styled('div')({ display: 'flex' });

// type ConditionalChange = (
//   value:
//     | {
//         operator: '<' | '<=' | '=' | '>=' | '>';
//         value: number;
//       }
//     | undefined
// ) => void;
