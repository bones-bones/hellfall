import { formatTypeLine, getFromFaces, listsAreExactlyEqual } from '@hellfall/shared/utils';
import { createStencil, createStyles, handleCsProp } from '@workday/canvas-kit-styling';
import {
  createStyledLink,
  createStyledTable,
  createStyledTableBody,
  createStyledTableCell,
  createStyledTableHead,
  createStyledTableHeader,
  createStyledTableRow,
} from '../styling';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeCardAtom, inputSortAtom, sortAtom } from './atoms/searchAtoms';
import { stringToMana } from './stringToMana';
import { system } from '@workday/canvas-tokens-web';
import { Table } from '@workday/canvas-kit-react';
import { dirType, sortType } from '@hellfall/shared/filters';
import { ButtonProps } from '@workday/canvas-kit-react/dist/es6/button/lib/Button';
import { HCCard } from '@hellfall/shared/types';

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
const parseSort = (order: string): sortType => order?.split(',')?.[0] as sortType;
const parseDir = (order: string): dirType => order?.split(',')?.[1] as dirType;
const GridHeader = ({
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
}: gridHeaderProps) => {
  return (
    <Table.Header {...handleCsProp(props, gridHeaderStencil({ alignRight }))}>
      <button
        onClick={() => {
          if (getCurrentSort() != value) {
            if (!sortIsOverridden()) {
              handleSortChange(value);
            }
          } else if (!dirIsOverridden()) {
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
const GridHeaderNoSort = createStyledTableHeader(gridHeaderStencil.base, 'GridHeaderNoSort');

export const Checklist = ({ cards }: { cards: HCCard.Any[] }) => {
  const setActiveCard = useSetAtom(activeCardAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const sortRules = useAtomValue(sortAtom);
  const sortIsOverridden = (): boolean =>
    inputSorts.length > 0 && parseSort(inputSorts[0]) != sortRules[0]?.sort;
  const dirIsOverridden = (): boolean =>
    inputSorts.length > 0 && parseDir(inputSorts[0]) != sortRules[0]?.dir;
  const handleSortChange = (newSort: sortType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newSort != parseSort(newInputs[0])) {
      newInputs[0] = `${newSort},${parseDir(newInputs[0] ?? 'auto,auto')}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      newInputs[0] = `${parseSort(newInputs[0])},asc`;
      setInputSorts(newInputs);
    }
  };
  const handleDirChange = (newDir: dirType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newDir != parseDir(newInputs[0])) {
      newInputs[0] = `${parseSort(newInputs[0] ?? 'auto,auto')},${newDir}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      setInputSorts(newInputs);
    }
  };
  const getCurrentSort = () => inputSorts[0]?.split(',')[0] as sortType;
  const getCurrentDir = () => inputSorts[0]?.split(',')[1] as dirType;
  const headerProps = {
    sortIsOverridden,
    dirIsOverridden,
    handleSortChange,
    handleDirChange,
    getCurrentSort,
    getCurrentDir,
  };
  return (
    <Grid>
      <GridHead>
        <CardRow>
          <GridHeader value="set" {...headerProps}>
            SET
          </GridHeader>
          <GridHeader value="setnumber" alignRight {...headerProps}>
            №
          </GridHeader>
          <GridHeader value="name" {...headerProps}>
            NAME
          </GridHeader>
          <GridHeader value="colormanavalue" {...headerProps}>
            COST
          </GridHeader>
          <GridHeader value="manavalue" alignRight {...headerProps}>
            MV
          </GridHeader>
          <GridHeaderNoSort>TYPE</GridHeaderNoSort>
        </CardRow>
      </GridHead>
      <GridBody>
        {cards.map(card => (
          <CardRow key={card.id}>
            <SetCell key={`${card.id}-set`}>{card.set}</SetCell>
            <NumCell key={`${card.id}-num`}>{card.collector_number}</NumCell>
            <NameCell key={`${card.id}-name`}>
              <NameCellLink
                key={`${card.id}-name-link`}
                to={`/card/${card.hcid}`}
                onClick={(event: React.MouseEvent<any>) => {
                  event.preventDefault();
                  if (event.button === 1 || event.metaKey || event.ctrlKey) {
                    window.open(`/card/${encodeURIComponent(card.hcid)}`, '_blank');
                  } else {
                    setActiveCard(card.id);
                  }
                }}
              >
                {card.name}
              </NameCellLink>
            </NameCell>
            <CostCell key={`${card.id}-cost`}>
              {stringToMana(
                getFromFaces(card, 'mana_cost', true).filter(Boolean).join(' // '),
                '15px'
              )}
            </CostCell>
            <MvCell key={`${card.id}-mv`}>{card.mana_value}</MvCell>
            <TypeCell key={`${card.id}-type`}>{formatTypeLine(card)}</TypeCell>
          </CardRow>
        ))}
      </GridBody>
    </Grid>
  );
};
const gridStyles = createStyles({
  // marginBottom: '32px',
  // scrollMarginTop: '12px',
  'tbody tr:nth-child(even)': {
    backgroundColor: '#f5f0ff',
  },
  overflowX: 'scroll',
  borderRadius: 0,
  tableLayout: 'fixed',
});
const Grid = createStyledTable(gridStyles, 'Grid');
const gridHeadStyles = createStyles({
  minHeight: '31px',
  maxHeight: '31px',
  borderBottom: `1px solid ${system.color.border.default}`,
});
const GridHead = createStyledTableHead(gridHeadStyles, 'GridHead');

const gridBodyStyles = createStyles({});
const GridBody = createStyledTableBody(gridBodyStyles, 'GridBody');

const cardRowStyles = createStyles({
  gridTemplateColumns: '90px 54px minmax(150px, 3fr) 150px 40px minmax(100px, 2fr)',
  ':hover': { backgroundColor: system.color.brand.surface.primary.strong },
});
const CardRow = createStyledTableRow(cardRowStyles, 'CardRow');
const cellDefaultStyles = createStyles({
  backgroundColor: 'inherit',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '30px',
  maxHeight: '30px',
  padding: '5px 6px 5px 6px',
  display: 'block',
  whiteSpace: 'nowrap',
});
const setCellStyles = createStyles(cellDefaultStyles, {});
const SetCell = createStyledTableCell(setCellStyles, 'setCell');

const numCellStyles = createStyles(cellDefaultStyles, {
  textAlign: 'right',
});
const NumCell = createStyledTableCell(numCellStyles, 'NumCell');
const nameCellLinkStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const NameCell = createStyledTableCell(cellDefaultStyles, 'NameCell');
const NameCellLink = createStyledLink(nameCellLinkStyles, 'NameCellLink');
const costCellStyles = createStyles(cellDefaultStyles, {});
const CostCell = createStyledTableCell(costCellStyles, 'CostCell');

const mvCellStyles = createStyles(cellDefaultStyles, {
  textAlign: 'right',
});
const MvCell = createStyledTableCell(mvCellStyles, 'MvCell');

const typeCellStyles = createStyles(cellDefaultStyles, {});
const TypeCell = createStyledTableCell(typeCellStyles, 'TypeCell');
