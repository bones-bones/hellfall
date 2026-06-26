import { Select, useSelectModel } from '@workday/canvas-kit-react';
import { createStencil } from '@workday/canvas-kit-styling';
import { useEffect } from 'react';

export type SelectItems<T extends string> = { label: string; value: T }[];

export const StyledSelect = <T extends string>({
  index,
  items,
  value,
  width,
  title,
  getCurrentValue,
  getAvailableOptions,
  isOverriden,
  handleValueChange,
}: {
  index: number;
  value: T;
  items: SelectItems<T>;
  width: string;
  title: string;
  getCurrentValue: (index: number) => T | undefined;
  getAvailableOptions?: (index: number) => T[];
  isOverriden: (index: number) => boolean;
  handleValueChange: (index: number, newValue: T) => void;
}) => {
  const available = getAvailableOptions?.(index);
  const options = items.filter(opt => (available ? available.includes(opt.value) : true));
  const currentValue: T = isOverriden(index) ? value : getCurrentValue(index) ?? value;
  const selectModel = useSelectModel({
    initialSelectedIds: [currentValue],
    items: options,
    getId: item => item.value,
    getTextValue: item => item.label,
    onSelect: data => {
      // This check prevents the following useEffect from causing a render loop when overridden
      if (!isOverriden(index)) {
        handleValueChange(index, data.id as T);
      }
    },
  });
  useEffect(() => {
    const currentSelectedId = selectModel.state.selectedIds[0];
    if (currentSelectedId !== currentValue) {
      selectModel.events.select({ id: currentValue });
    }
  }, [currentValue]);

  return (
    <div {...selectStencil({ width })}>
      <Select key={`sort-group-${index}`} items={options} model={selectModel}>
        <Select.Input
          title={title}
          aria-label={title}
          disabled={isOverriden(index)}
          cs={inputStencil({ width })}
        />
        <Select.Popper>
          <Select.Card ref={selectModel.state.containerRef} {...cardStencil({ width })}>
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
    width,
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
    width,
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
    width: `${width} !important`,
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
    width,
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
    width,
    borderRadius: 0,
    '& > span': {
      '& > svg': {
        display: 'none',
      },
    },
  }),
});
