import { useState, useEffect, PropsWithChildren, FC } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { Box } from '@workday/canvas-kit-react';
import { createStyledDiv, createStyledInput, createStyledLabel } from '../../styling';
import { StyledLegend } from './AdvancedComponents';

const searchCheckbox = createStyles({
  height: '18px',
  width: '18px',
  ':hover': { outline: '5px solid GREY', outlineStyle: 'auto' },
  margin: '0px',
});
const SearchCheckbox = createStyledInput(searchCheckbox);

export const CheckboxGroup: FC<
  PropsWithChildren<{
    values: string[];
    value?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ values, onChange, value = [], label, children }) => {
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map(entry => {
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={`${label}-${entry}-label-checkbox`}
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
              <StyledLabel htmlFor={`${label}-${entry}-label-checkbox`}>{entry}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </fieldset>
  );
};

export const BoxlessCheckboxGroup: FC<
  PropsWithChildren<{
    values: string[];
    value?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ values, onChange, value = [], label, children }) => {
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <div style={{ marginLeft: '-2px' }}>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map(entry => {
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={`${label}-${entry}-label-checkbox`}
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
              <StyledLabel htmlFor={`${label}-${entry}-label-checkbox`}>{entry}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </div>
  );
};

export const NamedCheckboxGroup: FC<
  PropsWithChildren<{
    names: string[];
    values: string[];
    value?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ names, values, onChange, value = [], label, children }) => {
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      <Container>
        {values.map((entry, index) => {
          const name = names[index];
          return (
            <CheckEntry key={entry}>
              <SearchCheckbox
                id={`${label}-${entry}-label-checkbox`}
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
              <StyledLabel htmlFor={`${label}-${entry}-label-checkbox`}>{name}</StyledLabel>
            </CheckEntry>
          );
        })}
      </Container>
      {children}
    </fieldset>
  );
};

export const HiddenCheckboxGroup: FC<
  PropsWithChildren<{
    values: string[];
    value?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ values, onChange, value = [], label, children }) => {
  const [selected, setSelected] = useState<string[]>(value);
  const [open, setOpen] = useState(value && value.length > 0);

  useEffect(() => {
    setSelected(value);
  }, [value]);
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      {open ? (
        <>
          <Container>
            {values.map(entry => {
              return (
                <CheckEntry key={entry}>
                  <SearchCheckbox
                    id={`${label}-${entry}-label-checkbox`}
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
                  <StyledLabel htmlFor={`${label}-${entry}-label-checkbox`}>{entry}</StyledLabel>
                </CheckEntry>
              );
            })}
          </Container>
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            show less
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          show more
        </button>
      )}
      {children}
    </fieldset>
  );
};

export const NamedHiddenCheckboxGroup: FC<
  PropsWithChildren<{
    names: string[];
    values: string[];
    value?: string[];
    onChange: (values: string[]) => void;
    label: string;
  }>
> = ({ names, values, onChange, value = [], label, children }) => {
  const [selected, setSelected] = useState<string[]>(value);
  const [open, setOpen] = useState(value && value.length > 0);

  useEffect(() => {
    setSelected(value);
  }, [value]);
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <fieldset>
      <StyledLegend>{label}</StyledLegend>

      {open ? (
        <>
          <Container>
            {values.map((entry, index) => {
              const name = names[index];
              return (
                <CheckEntry key={entry}>
                  <SearchCheckbox
                    id={`${label}-${entry}-label-checkbox`}
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
                  <StyledLabel htmlFor={`${label}-${entry}-label-checkbox`}>{name}</StyledLabel>
                </CheckEntry>
              );
            })}
          </Container>
          {/* <br /> */}
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            show less
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          show more
        </button>
      )}
      {children}
    </fieldset>
  );
};

export const SingleCheckbox = ({
  onChange,
  value,
  label,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) => {
  // : FC<
  //   PropsWithChildren<{
  //     // values: string[];
  //     label: string;
  //     onChange: (value: boolean) => void;
  //     value?: boolean;
  //   }>
  // > = ({ onChange, value = false, label, children }) => {
  const [selected, setSelected] = useState<boolean>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <div style={{ marginLeft: '-2px' }}>
      <CheckEntry key={label}>
        <SearchCheckbox
          id={label}
          type="checkbox"
          checked={value}
          onChange={event => onChange(event.target.checked)}
        />
        {}
        <SingleStyledLabel htmlFor={label}>{label}</SingleStyledLabel>
      </CheckEntry>
    </div>
  );
};

const containerStyles = createStyles({ display: 'flex', flexDirection: 'column' });
const Container = createStyledDiv(containerStyles);

const checkEntryStyles = createStyles({
  display: 'flex',
  margin: '2px',
  height: '25px',
  alignItems: 'center',
});
const CheckEntry = createStyledDiv(checkEntryStyles);

const singleLabelStyles = createStyles({ fontWeight: 'bold', marginLeft: '6px' });
const SingleStyledLabel = createStyledLabel(singleLabelStyles);

const labelStyles = createStyles({ marginLeft: '6px' });
const StyledLabel = createStyledLabel(labelStyles);
