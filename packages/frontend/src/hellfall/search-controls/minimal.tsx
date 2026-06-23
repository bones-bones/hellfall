import { Select, useSelectModel } from '@workday/canvas-kit-react';

export const MinimalSelect = () => {
  const model = useSelectModel({
    items: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 5', value: '5' },
      { label: 'Option 6', value: '5' },
      { label: 'Option 7', value: '5' },
      { label: 'Option 8', value: '5' },
      { label: 'Option 9', value: '5' },
      { label: 'Option 10', value: '10' },
      { label: 'Option 11', value: '11' },
      { label: 'Option 12', value: '12' },
      { label: 'Option 13', value: '13' },
    ],
    getId: item => item.value,
    getTextValue: item => item.label,
  });

  return (
    <Select model={model}>
      <Select.Input />
      <Select.Popper>
        <Select.Card>
          <Select.List>
            {item => <Select.Item key={item.value}>{item.label}</Select.Item>}
          </Select.List>
        </Select.Card>
      </Select.Popper>
    </Select>
  );
};
