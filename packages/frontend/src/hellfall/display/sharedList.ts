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

interface gridHeaderProps extends ButtonProps {
  alignRight?: boolean;
  value: sortType;
  sortIsOverridden: () => boolean;
  dirIsOverridden: () => boolean;
  handleSortChange: (newSort: sortType) => void;
  handleDirChange: (newDir: dirType) => void;
  getCurrentSort: () => sortType;
  getCurrentDir: () => dirType;
}
