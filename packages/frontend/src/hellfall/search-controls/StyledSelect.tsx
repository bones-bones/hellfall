import { Select, useSelectModel } from '@workday/canvas-kit-react';
import { createStencil } from '@workday/canvas-kit-styling';
import { useEffect } from 'react';

/**
 * An array of select items
 * @template T The type of the value for the select
 */
export type SelectItems<T extends string> = { label: string; value: T }[];

/**
 * Use this as a styled version of {@linkcode Select}
 * @template T The type of the value for the select
 */
export const StyledSelect = <T extends string>({
  items,
  initialValue,
  width,
  title,
  currentValue,
  availableValues,
  disabled,
  onSelect,
}: {
  /**
   * The items to use; must be of type {@linkcode SelectItems<T>}
   */
  items: SelectItems<T>;
  /**
   * The initial value to use
   */
  initialValue: T;
  /**
   * The width of the select box
   */
  width: string;
  /**
   * The title to use (used both for accessibility and mouseover)
   */
  title: string;
  /**
   * The current value, if any
   */
  currentValue?: T;
  /**
   * The available values, if any; if omitted, uses all items
   */
  availableValues?: T[];
  /**
   * Whether this select is disabled; if true, will ignore `currentValue`
   */
  disabled?: boolean;
  /**
   * What to do when a new value is selected
   * @param newValue The new value from the select
   */
  onSelect: (newValue: T) => void;
}) => {
  // const available = getAvailableValues?.(index);
  const options = items.filter(opt => availableValues?.includes(opt.value) ?? true);
  const value: T = disabled ? initialValue : currentValue ?? initialValue;
  const selectModel = useSelectModel({
    initialSelectedIds: [value],
    items: options,
    getId: item => item.value,
    getTextValue: item => item.label,
    onSelect: data => {
      // This check prevents the following useEffect from causing a render loop when disabled
      if (!disabled) {
        onSelect(data.id as T);
      }
    },
  });
  useEffect(() => {
    const currentSelectedId = selectModel.state.selectedIds[0];
    if (currentSelectedId !== value) {
      selectModel.events.select({ id: value });
    }
  }, [value]);

  return (
    <div {...selectStencil({ width })}>
      <Select items={options} model={selectModel}>
        <Select.Input
          title={title}
          aria-label={title}
          disabled={disabled}
          cs={inputStencil({ width })}
        />
        <Select.Popper>
          <Select.Card {...cardStencil({ width })}>
            <Select.List {...listStencil({ width })}>
              {(item: { value: string; label: T }) => (
                <Select.Item key={item.value} {...itemStencil({ width })}>
                  {item.label}
                </Select.Item>
              )}
            </Select.List>
          </Select.Card>
        </Select.Popper>
      </Select>
    </div>
  );
};

const selectStencil = createStencil({
  vars: {
    width: '135px',
  },
  base: ({ width }) => ({
    verticalAlign: 'top',
    display: 'inline-block',
    width: width,
    '&:disabled': {
      cursor: 'not-allowed',
    },
  }),
});
const inputStencil = createStencil({
  vars: {
    width: '135px',
  },
  base: ({ width }) => ({
    verticalAlign: 'top',
    display: 'inline-block',
    borderRadius: '4px',
    width: width,
    minWidth: width,
    '&:disabled': {
      cursor: 'not-allowed',
    },
  }),
});
// const popperStyles = createStyles({
// })

const cardStencil = createStencil({
  vars: {
    width: '135px',
  },
  base: ({ width }) => ({
    backgroundColor: 'white',
    border: '1px solid #d1d1d1',
    borderRadius: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '4px 0',
    width: width,
    marginTop: '-4px',
    marginBottom: '-4px',
    overflowX: 'hidden',
    '& > div': {
      marginTop: '-4px !important',
      marginBottom: '-4px !important',
      overflowX: 'hidden' as any,
      borderRadius: 0,
      '& > div': {
        marginTop: 0,
        marginBottom: 0,
      },
    },
  }),
});
const listStencil = createStencil({
  vars: {
    width: '135px',
  },
  base: ({ width }) => ({
    width: width,
    marginTop: 0,
    marginBottom: 0,
    overflowX: 'hidden',
    borderRadius: 0,
  }),
});
const itemStencil = createStencil({
  vars: {
    width: '135px',
  },
  base: ({ width }) => ({
    width: width,
    borderRadius: 0,
    '& > span': {
      '& > svg': {
        display: 'none',
      },
    },
  }),
});
