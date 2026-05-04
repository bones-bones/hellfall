import { FormField, space } from '@workday/canvas-kit-react';
import { Select } from '@workday/canvas-kit-preview-react/select';
import { useAtom } from 'jotai';
import { sortAtom, dirAtom } from '../atoms/searchAtoms.ts';
import styled from '@emotion/styled';

export const SortComponent = () => {
  const [sortRule, setSortRule] = useAtom(sortAtom);
  const [dirRule, setDirRule] = useAtom(dirAtom);

  return (
    <Container>
      <FormField label="Sort By">
        <Select
          value={sortRule}
          options={[
            { value: 'Name' },
            { value: 'Id' },
            { value: 'Set/Number' },
            { value: 'Color' },
            { value: 'Mana Value' },
          ]}
          onChange={ev => {
            setSortRule((ev as any).target.value || 'Color');
          }}
        />{' '}
        :{' '}
        <Select
          value={dirRule}
          options={[{ value: 'Asc' }, { value: 'Desc' }]}
          onChange={ev => {
            setDirRule((ev as any).target.value || 'Asc');
          }}
        />
      </FormField>
    </Container>
  );
};

const Container = styled('div')({ paddingLeft: space.l });
