import {
  CardMap,
  displaySetCode,
  getRelatedsFromSet,
  HCToTTSDeck,
  listsAreExactlyEqual,
  toCockCube,
  unescapeBase64,
} from '@hellfall/shared/utils';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledButton,
  createStyledLink,
  createStyledTable,
  createStyledTableBody,
  createStyledTableCell,
  createStyledTableHead,
  createStyledTableRow,
} from '../../styling';
import { useAtom, useAtomValue } from 'jotai';
import { inputSortAtom, sortAtom } from '../atoms/setAtoms';
import { system } from '@workday/canvas-tokens-web';
import { Table } from '@workday/canvas-kit-react';
import { dirType, setSortType } from '@hellfall/shared/filters';
import { HCSet } from '@hellfall/shared/types';
import { GridHeader, GridHeaderNoSort, parseDir, parseSetSort } from './sharedList';
import { cardsAtom } from '../atoms/cardsAtom';
import { downloadDraftmancer } from '../../cube-resources/downloadDraftmancer';
import { toMPCAutofill } from '../../cube-resources/toMPCAutofill';
import { getLands } from '../../cube-resources/getLands';

export const SetList = ({ sets }: { sets: HCSet[] }) => {
  const cardMap = useAtomValue(cardsAtom).filterToMap(e => !e.tags?.includes('offensive'));
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const sortRules = useAtomValue(sortAtom);
  const handleSortChange = (newSort: setSortType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newSort != parseSetSort(newInputs[0])) {
      newInputs[0] = `${newSort},${parseDir(newInputs[0] ?? 'auto,auto')}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      newInputs[0] = `${parseSetSort(newInputs[0])},asc`;
      setInputSorts(newInputs);
    }
  };
  const handleDirChange = (newDir: dirType) => {
    const newInputs = sortRules.length && inputSorts.length ? [...inputSorts] : ['auto,auto'];
    if (newDir != parseDir(newInputs[0])) {
      newInputs[0] = `${parseSetSort(newInputs[0] ?? 'auto,auto')},${newDir}`;
    }
    if (!listsAreExactlyEqual(newInputs, inputSorts)) {
      setInputSorts(newInputs);
    }
  };
  const getCurrentSort = () => inputSorts[0]?.split(',')[0] as setSortType;
  const getCurrentDir = () => inputSorts[0]?.split(',')[1] as dirType;
  const headerProps = {
    handleSortChange,
    handleDirChange,
    getCurrentSort,
    getCurrentDir,
  };
  return (
    <Grid>
      <GridHead>
        <CardRow>
          <GridHeader<setSortType> value="name" {...headerProps}>
            NAME
          </GridHeader>
          <GridHeader<setSortType> value="code" alignRight {...headerProps}>
            CODE
          </GridHeader>
          <GridHeader<setSortType> value="number" {...headerProps}>
            CARDS
          </GridHeader>
          <GridHeader<setSortType> value="date" {...headerProps}>
            DATE
          </GridHeader>
          <GridHeaderNoSort>LINKS</GridHeaderNoSort>
          <GridHeaderNoSort>TTS</GridHeaderNoSort>
          <GridHeaderNoSort>CKTRC</GridHeaderNoSort>
          <GridHeaderNoSort>DRAFT</GridHeaderNoSort>
          <GridHeaderNoSort>MPC</GridHeaderNoSort>
          <GridHeaderNoSort>PDF</GridHeaderNoSort>
        </CardRow>
      </GridHead>
      <GridBody>
        {sets.map(set => (
          <CardRow key={set.code}>
            <NameCell key={`${set.code}-name`}>
              <NameCellLink
                key={`${set.code}-name-link`}
                to={`/hellscubes/list/${encodeURIComponent(set.code)}`}
              >
                {set.name}
              </NameCellLink>
            </NameCell>
            <CodeCell key={`${set.code}-code`}>{displaySetCode(set.code)}</CodeCell>
            <NumCell key={`${set.code}-num`}>{set.card_count}</NumCell>
            <DateCell key={`${set.code}-date`}>{set.released_at ?? 'ongoing'}</DateCell>
            <LinkCell key={`${set.code}-link`}>
              {set.quick_links?.map((link, i, ar) => (
                <span key={link.text}>
                  <LinkCellLink to={link.url} target="_blank">
                    {link.text}
                  </LinkCellLink>
                  {i < ar.length - 1 && ', '}
                </span>
              ))}
            </LinkCell>
            <TTSCell key={`${set.code}-tts`} set={set} cardMap={cardMap} />
            <CockCell key={`${set.code}-cock`} set={set} cardMap={cardMap} />
            <DraftCell key={`${set.code}-draft`} set={set} cardMap={cardMap} />
            <MPCCell key={`${set.code}-mpc`} set={set} cardMap={cardMap} />
            <PDFCell key={`${set.code}-pdf`} set={set} />
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
    ':hover': { backgroundColor: system.color.brand.surface.primary.strong },
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
const nameCellLinkStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const NameCell = createStyledTableCell(cellDefaultStyles, 'NameCell');
const NameCellLink = createStyledLink(nameCellLinkStyles, 'NameCellLink');
const codeCellStyles = createStyles(cellDefaultStyles, { textAlign: 'right' });
const CodeCell = createStyledTableCell(codeCellStyles, 'setCell');
const numCellStyles = createStyles(cellDefaultStyles, {});
const NumCell = createStyledTableCell(numCellStyles, 'NumCell');
const dateCellStyles = createStyles(cellDefaultStyles, {});
const DateCell = createStyledTableCell(dateCellStyles, 'DateCell');

const linkCellLinkStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const LinkCell = createStyledTableCell(cellDefaultStyles, 'LinkCell');
const LinkCellLink = createStyledLink(linkCellLinkStyles, 'LinkCellLink');

const ttsCellLinkStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const TTSCellLink = createStyledLink(ttsCellLinkStyles, 'TTSCellLink');
const ttsCellButtonStyles = createStyles({});
const TTSCellButton = createStyledButton(ttsCellButtonStyles, 'TTSCellButton');
const TTSCell = ({ set, cardMap }: { set: HCSet; cardMap: CardMap }) => {
  return (
    <Table.Cell cs={cellDefaultStyles}>
      {set.tts_link ? (
        <TTSCellLink to={set.tts_link.url}>{set.tts_link.text}</TTSCellLink>
      ) : (
        <TTSCellButton
          onClick={() => {
            const val = HCToTTSDeck(
              set.name,
              cardMap.getAllIdsInSetDirect(set.code) ?? [],
              cardMap
            );
            const url =
              'data:text/plain;base64,' +
              btoa(unescapeBase64(encodeURIComponent(JSON.stringify(val, null, 2))));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = set.name + `.json`;
            document.body.appendChild(a);
            a.click();
          }}
        >
          download
        </TTSCellButton>
      )}
    </Table.Cell>
  );
};

const cockCellButtonStyles = createStyles({});
const CockCellButton = createStyledButton(cockCellButtonStyles, 'CockCellButton');
const CockCell = ({ set, cardMap }: { set: HCSet; cardMap: CardMap }) => {
  return (
    <Table.Cell cs={cellDefaultStyles}>
      <CockCellButton
        onClick={() => {
          const val = toCockCube({
            name: set.name,
            set: set.code,
            cardMap,
          });

          const url = 'data:text/plain;base64,' + btoa(unescapeBase64(encodeURIComponent(val)));
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // the filename you want
          a.download = set.name + '.xml';
          document.body.appendChild(a);
          a.click();
        }}
      >
        download
      </CockCellButton>
    </Table.Cell>
  );
};

const draftCellButtonStyles = createStyles({});
const DraftCellButton = createStyledButton(draftCellButtonStyles, 'DraftCellButton');
const DraftCell = ({ set, cardMap }: { set: HCSet; cardMap: CardMap }) => {
  return (
    <Table.Cell cs={cellDefaultStyles}>
      <DraftCellButton
        onClick={() => {
          downloadDraftmancer({
            name: set.name,
            set: set.code,
            cardMap,
          });
        }}
      >
        download
      </DraftCellButton>
    </Table.Cell>
  );
};

const mpcCellButtonStyles = createStyles({});
const MPCCellButton = createStyledButton(mpcCellButtonStyles, 'MPCCellButton');

const MPCCell = ({ set, cardMap }: { set: HCSet; cardMap: CardMap }) => {
  return (
    <Table.Cell cs={cellDefaultStyles}>
      {set.ready_for_autofill ? (
        <MPCCellButton
          onClick={async () => {
            const cardList = (
              await (
                await fetch('https://hellfall-autofill-821285593003.europe-west1.run.app/')
              ).json()
            ).values
              .flatMap((entry: any, i: any) => {
                if (i !== 0) {
                  return {
                    Cardname: entry[0],
                    Sidename: entry[1],
                    Url: entry[2],
                  };
                }
                return [];
              })
              .filter(Boolean) as {
              Cardname: string;
              Sidename: string;
              Url: string;
            }[];
            const { cards: intCards, tokens: intTokens } = getRelatedsFromSet(set.code, cardMap);
            const tokenNames = intTokens.flatMap(entry => {
              // Dear sixel, pls finish
              return (entry.all_parts?.filter(e => e.component == 'token') || []).map(tokenEntry =>
                tokenEntry.name.replace(/ (\d+)$/g, '$1')
              );
            });
            const printableTokens = tokenNames.map(tokenEntry => {
              const matches = cardList.filter(e => {
                return e.Cardname == tokenEntry;
              });

              return {
                cardName: tokenEntry,
                sides: matches.map(matchEntry => ({
                  id: matchEntry.Url.replace('https://lh3.googleusercontent.com/d/', ''),
                })),
              };
            });

            const printableCards = intCards.map(cardEntry => {
              const matches = cardList.filter(e => e.Cardname == cardEntry.name);
              if (cardEntry.name.includes('// Elves')) {
                console.log(cardList, matches);
              }

              const returnEntry = {
                cardName: cardEntry.name,
                sides: matches.map(matchEntry => ({
                  id: matchEntry.Url.replace('https://lh3.googleusercontent.com/d/', ''),
                })),
              };
              return returnEntry;
            });
            toMPCAutofill(
              [
                ...printableCards,
                ...(set.include_lands ? getLands() : []),
                ...printableTokens,
              ].filter(Boolean)
            );
          }}
        >
          download
        </MPCCellButton>
      ) : (
        <span>None</span>
      )}
    </Table.Cell>
  );
};

const pdfCellLinkStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const PDFCellLink = createStyledLink(pdfCellLinkStyles, 'PDFCellLink');
const PDFCell = ({ set }: { set: HCSet }) => {
  return (
    <Table.Cell cs={cellDefaultStyles}>
      {set.print_link ? (
        <PDFCellLink to={set.print_link.url}>{set.print_link.text}</PDFCellLink>
      ) : (
        <span>None</span>
      )}
    </Table.Cell>
  );
};
