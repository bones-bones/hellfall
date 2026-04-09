import styled from '@emotion/styled';
import { useState, useEffect, PropsWithChildren, FC } from 'react';
import { StyledLegend } from '../StyledLabel.tsx';
import { HCSearchColor } from '@hellfall/shared/types';

export const SearchCheckbox = styled.input({
  height: '18px',
  width: '18px',
  ':hover': { outline: '5px solid GREY', outlineStyle: 'auto' },
  margin: '0px',
});

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

// TODO: figure out how to do this without sending the site into an infinite loop
// export const ColorCheckboxGroup: FC<
//   PropsWithChildren<{
//     names: string[];
//     values: HCSearchColor[];
//     initialValue?: HCSearchColor[];
//     onChange: (values: HCSearchColor[]) => void;
//     label: string;
//   }>
// > = ({ names, values, onChange, initialValue, label, children }) => {
//   const [selected, setSelected] = useState<HCSearchColor[]>(initialValue || []);
//   useEffect(() => {
//     onChange(selected);
//   }, [selected]);
//   return (
//     <fieldset>
//       <StyledLegend>{label}</StyledLegend>

//       <Container>
//         {values.map((entry, index) => {
//           const name = names[index];
//           return (
//             <CheckEntry key={entry}>
//               <SearchCheckbox
//                 id={label + entry + 'label' + 'checkbox'}
//                 type="checkbox"
//                 checked={selected.includes(entry)}
//                 onChange={event => {
//                   if (event.target.checked) {
//                     setSelected([entry, ...selected]);
//                   } else {
//                     setSelected(selected.filter(selectedEntry => selectedEntry != entry));
//                   }
//                 }}
//               />
//               <StyledLabel htmlFor={label + entry + 'label' + 'checkbox'}>{name}</StyledLabel>
//             </CheckEntry>
//           );
//         })}
//       </Container>
//       {children}
//     </fieldset>
//   );
// };

const Container = styled.div({ display: 'flex', flexDirection: 'column' });

const CheckEntry = styled.div({
  display: 'flex',
  margin: '2px',
  height: '25px',
  alignItems: 'center',
});

const SingleStyledLabel = styled.label({ fontWeight: 'bold', marginLeft: '6px' });

const StyledLabel = styled.label({ marginLeft: '6px' });
