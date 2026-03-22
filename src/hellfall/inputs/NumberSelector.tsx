import styled from '@emotion/styled';

import { useState, useEffect } from 'react';
import { StyledLegend } from '../StyledLabel';
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
  initialValue,
  label,
}: {
  label: string;
  onChange?: ConditionalChange;
  initialValue?: { value: number; operator: '<' | '<=' | '=' | '>=' | '>' | '' };
}) => {
  const [value, setValue] = useState<undefined | number>(initialValue?.value);

  const [operator, setConditional] = useState<'<' | '<=' | '=' | '>=' | '>'>(
    initialValue?.operator || '='
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
          onChange={event => {
            setConditional(event.target.value as any);
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
        </StyledManaSelect>{' '}
        <StyledNumberInput
          type="number"
          defaultValue={initialValue?.value}
          onBlur={event => {
            if (event.target.value == '') {
              setValue(undefined);
            } else {
              setValue(toNumber(event.target.value));
            }
          }}
        />
      </Container>
    </fieldset>
  );
};

const StyledNumberInput = styled('input')({ width: '40px' });

const StyledManaSelect = styled('select')({ width: '40px', height: '30px' });
const Container = styled('div')({ display: 'flex' });

type ConditionalChange = (
  value:
    | {
        operator: '<' | '<=' | '=' | '>=' | '>';
        value: number;
      }
    | undefined
) => void;
