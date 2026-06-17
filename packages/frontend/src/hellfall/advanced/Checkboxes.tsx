import { useState, useEffect, PropsWithChildren, FC } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { legendStyles } from './advancedStyles';
import { Box } from '@workday/canvas-kit-react';

export const searchCheckbox = createStyles({
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
      <legend className={legendStyles}>{label}</legend>

      <Box cs={container}>
        {values.map(entry => {
          return (
            <Box cs={checkEntry} key={entry}>
              <input
                className={searchCheckbox}
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
              <label className={labelStyles} htmlFor={`${label}-${entry}-label-checkbox`}>
                {entry}
              </label>
            </Box>
          );
        })}
      </Box>
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
      <legend className={legendStyles}>{label}</legend>

      <Box cs={container}>
        {values.map(entry => {
          return (
            <Box cs={checkEntry} key={entry}>
              <input
                className={searchCheckbox}
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
              <label className={labelStyles} htmlFor={`${label}-${entry}-label-checkbox`}>
                {entry}
              </label>
            </Box>
          );
        })}
      </Box>
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
      <legend className={legendStyles}>{label}</legend>

      <Box cs={container}>
        {values.map((entry, index) => {
          const name = names[index];
          return (
            <Box cs={checkEntry} key={entry}>
              <input
                className={searchCheckbox}
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
              <label className={labelStyles} htmlFor={`${label}-${entry}-label-checkbox`}>
                {name}
              </label>
            </Box>
          );
        })}
      </Box>
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
      <legend className={legendStyles}>{label}</legend>

      {open ? (
        <>
          <Box cs={container}>
            {values.map(entry => {
              return (
                <Box cs={checkEntry} key={entry}>
                  <input
                    className={searchCheckbox}
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
                  <label className={labelStyles} htmlFor={`${label}-${entry}-label-checkbox`}>
                    {entry}
                  </label>
                </Box>
              );
            })}
          </Box>
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
      <legend className={legendStyles}>{label}</legend>

      {open ? (
        <>
          <Box cs={container}>
            {values.map((entry, index) => {
              const name = names[index];
              return (
                <Box cs={checkEntry} key={entry}>
                  <input
                    className={searchCheckbox}
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
                  <label className={labelStyles} htmlFor={`${label}-${entry}-label-checkbox`}>
                    {name}
                  </label>
                </Box>
              );
            })}
          </Box>
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
      <Box cs={checkEntry} key={label}>
        <input
          className={searchCheckbox}
          id={label}
          type="checkbox"
          checked={value}
          onChange={event => onChange(event.target.checked)}
        />
        {}
        <label className={singleLabelStyles} htmlFor={label}>
          {label}
        </label>
      </Box>
    </div>
  );
};

const container = createStyles({ display: 'flex', flexDirection: 'column' });

const checkEntry = createStyles({
  display: 'flex',
  margin: '2px',
  height: '25px',
  alignItems: 'center',
});

const singleLabelStyles = createStyles({ fontWeight: 'bold', marginLeft: '6px' });

const labelStyles = createStyles({ marginLeft: '6px' });
