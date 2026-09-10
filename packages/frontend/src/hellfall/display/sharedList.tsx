import { dirType, setSortType, sortType } from '@hellfall/shared/filters';
import { Table } from '@workday/canvas-kit-react';
import { ButtonProps } from '@workday/canvas-kit-react/dist/es6/button/lib/Button';
import { createStencil, createStyles, handleCsProp } from '@workday/canvas-kit-styling';
import { createStyledTableHeader } from '../../styling';

const gridHeaderStencil = createStencil({
  vars: {},
  base: {
    color: '#551A8B',
    ':hover': {
      color: '#000000',
    },
    border: 0,
    borderRadius: 0,
    cursor: 'pointer',
    minHeight: '30px',
    maxHeight: '30px',
    padding: '5px 6px 5px 6px',
  },
  modifiers: {
    alignRight: {
      true: {
        textAlign: 'right',
        justifyContent: 'right',
      },
    },
  },
});
const gridHeaderButtonStyles = createStyles({
  color: '#551A8B',
  ':hover': {
    color: '#000000',
  },
  border: 0,
  borderRadius: 0,
  cursor: 'pointer',
  padding: 0,
  background: 'none',
});

interface gridHeaderProps<T extends sortType | setSortType> extends ButtonProps {
  alignRight?: boolean;
  value: T;
  sortIsOverridden?: () => boolean;
  dirIsOverridden?: () => boolean;
  handleSortChange: (newSort: T) => void;
  handleDirChange: (newDir: dirType) => void;
  getCurrentSort: () => T;
  getCurrentDir: () => dirType;
}

export const parseSort = (order: string): sortType => order?.split(',')?.[0] as sortType;
export const parseSetSort = (order: string): setSortType => order?.split(',')?.[0] as setSortType;
export const parseDir = (order: string): dirType => order?.split(',')?.[1] as dirType;
export const GridHeader = <T extends sortType | setSortType>({
  children,
  alignRight,
  value,
  sortIsOverridden,
  dirIsOverridden,
  handleSortChange,
  handleDirChange,
  getCurrentSort,
  getCurrentDir,
  ...props
}: gridHeaderProps<T>) => {
  return (
    <Table.Header {...handleCsProp(props, gridHeaderStencil({ alignRight }))}>
      <button
        onClick={() => {
          if (getCurrentSort() != value) {
            if (!sortIsOverridden?.()) {
              handleSortChange(value);
            }
          } else if (!dirIsOverridden?.()) {
            handleDirChange(getCurrentDir() == 'desc' ? 'asc' : 'desc');
          }
        }}
        className={gridHeaderButtonStyles}
      >
        {children} {getCurrentSort() == value ? (getCurrentDir() == 'desc' ? '▼' : '▲') : ''}
      </button>
    </Table.Header>
  );
};
export const GridHeaderNoSort = createStyledTableHeader(gridHeaderStencil.base, 'GridHeaderNoSort');
