import styled from '@emotion/styled';
import { useState, useEffect, PropsWithChildren, FC } from 'react';
import { SearchCheckbox } from '../SearchCheckbox';
import { StyledLegend } from '../StyledLabel';
import { HCSearchColor } from '../../api-types';

export const CheckboxGroup: FC<
  PropsWithChildren<{
    values: string[];
    initialValue?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ values, onChange, initialValue, label, children }) => {
  const [selected, setSelected] = useState<string[]>(initialValue || []);
  useEffect(() => {
    onChange(selected);
  }, [selected]);
  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map(entry => {
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={label + entry + 'label' + 'checkbox'}
                type="checkbox"
                checked={selected.includes(entry)}
                onChange={event => {
                  if (event.target.checked) {
                    setSelected([entry, ...selected]);
                  } else {
                    setSelected(selected.filter(selectedEntry => selectedEntry != entry));
                  }
                }}
              />
              <StyledLabel htmlFor={label + entry + 'label' + 'checkbox'}>{entry}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </fieldset>
  );
};
export const NamedCheckboxGroup: FC<
  PropsWithChildren<{
    names: string[];
    values: string[];
    initialValue?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ names, values, onChange, initialValue, label, children }) => {
  const [selected, setSelected] = useState<string[]>(initialValue || []);
  useEffect(() => {
    onChange(selected);
  }, [selected]);
  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map((entry, index) => {
          const name = names[index];
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={label + entry + 'label' + 'checkbox'}
                type="checkbox"
                checked={selected.includes(entry)}
                onChange={event => {
                  if (event.target.checked) {
                    setSelected([entry, ...selected]);
                  } else {
                    setSelected(selected.filter(selectedEntry => selectedEntry != entry));
                  }
                }}
              />
              <StyledLabel htmlFor={label + entry + 'label' + 'checkbox'}>{name}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </fieldset>
  );
};
export const ColorCheckboxGroup: FC<
  PropsWithChildren<{
    names: string[];
    values: HCSearchColor[];
    initialValue?: HCSearchColor[];
    onChange: (values: HCSearchColor[]) => void;
    label: string;
  }>
> = ({ names, values, onChange, initialValue, label, children }) => {
  const [selected, setSelected] = useState<HCSearchColor[]>(initialValue || []);
  useEffect(() => {
    onChange(selected);
  }, [selected]);
  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map((entry, index) => {
          const name = names[index];
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={label + entry + 'label' + 'checkbox'}
                type="checkbox"
                checked={selected.includes(entry)}
                onChange={event => {
                  if (event.target.checked) {
                    setSelected([entry, ...selected]);
                  } else {
                    setSelected(selected.filter(selectedEntry => selectedEntry != entry));
                  }
                }}
              />
              <StyledLabel htmlFor={label + entry + 'label' + 'checkbox'}>{name}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </fieldset>
  );
};

const Container = styled.div({ display: 'flex', flexDirection: 'column' });

const CheckEntry = styled.div({
  display: 'flex',
  margin: '2px',
  height: '25px',
  alignItems: 'center',
});

const StyledLabel = styled.label({ marginLeft: '2px' });
