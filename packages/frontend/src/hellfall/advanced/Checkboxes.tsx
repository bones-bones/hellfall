import { useState, useEffect, PropsWithChildren, FC } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledInput, createStyledLabel } from '../../styling';
import { StyledLegend } from './AdvancedComponents';

const searchCheckbox = createStyles({
  height: '18px',
  width: '18px',
  ':hover': { outline: '5px solid GREY', outlineStyle: 'auto' },
  margin: '0px',
});
const SearchCheckbox = createStyledInput(searchCheckbox, 'SearchCheckbox');

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
    <BoxlessContainer>
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
    </BoxlessContainer>
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
    <BoxlessContainer>
      <CheckEntry key={label}>
        <SearchCheckbox
          id={label}
          type="checkbox"
          checked={value}
          onChange={event => onChange(event.target.checked)}
        />
        <SingleStyledLabel htmlFor={label}>{label}</SingleStyledLabel>
      </CheckEntry>
    </BoxlessContainer>
  );
};

export const InlineCheckbox = ({
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
    <InlineContainer>
      <CheckEntry key={label}>
        <SearchCheckbox
          id={label}
          type="checkbox"
          checked={value}
          onChange={event => onChange(event.target.checked)}
        />
        <SingleStyledLabel htmlFor={label}>{label}</SingleStyledLabel>
      </CheckEntry>
    </InlineContainer>
  );
};

const boxlessContainerStyles = createStyles({ marginLeft: '-2px' });
const BoxlessContainer = createStyledDiv(boxlessContainerStyles, 'BoxlessContainer');
const inlineContainerStyles = createStyles({ marginLeft: '10px', minWidth: 'fit-content' });
const InlineContainer = createStyledDiv(inlineContainerStyles, 'InlineContainer');
const containerStyles = createStyles({ display: 'flex', flexDirection: 'column' });
const Container = createStyledDiv(containerStyles, 'Container');

const checkEntryStyles = createStyles({
  display: 'flex',
  margin: '2px',
  height: '25px',
  alignItems: 'center',
});
const CheckEntry = createStyledDiv(checkEntryStyles, 'CheckEntry');

const singleLabelStyles = createStyles({ fontWeight: 'bold', marginLeft: '6px' });
const SingleStyledLabel = createStyledLabel(singleLabelStyles, 'SingleStyledLabel');

const labelStyles = createStyles({ marginLeft: '6px' });
const StyledLabel = createStyledLabel(labelStyles, 'StyledLabel');
