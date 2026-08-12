import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledTableCell,
  createStyledLink,
  createStyledTable,
  createStyledTableBody,
  createStyledTableHead,
  createStyledTableHeader,
  createStyledTableRow,
} from '../../../styling';
import { system } from '@workday/canvas-tokens-web';
import { useCallback, useState } from 'react';
import { getCollectorOrderSet, getSet } from '@hellfall/shared/utils';
import { useAtom } from 'jotai';
import { mouseXAtom, mouseYAtom, tooltipSrcAtom } from '../../atoms/tooltipAtom';

const nameCellStencil = createStencil({
  vars: {},
  base: {
    backgroundColor: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '30px',
    maxHeight: '30px',
    padding: '5px 10px',
    display: 'block',
    whiteSpace: 'nowrap',
    ':hover': { backgroundColor: system.color.brand.surface.primary.strong },
  },
  modifiers: {
    isSourceCard: {
      true: {
        backgroundColor: system.color.brand.surface.primary.strong,
      },
    },
  },
});
type NameCellProps = React.ComponentProps<'td'> & { isSourceCard: boolean };
const NameCell = createStenciledTableCell<NameCellProps>(nameCellStencil, 'NameCell');
const cellLinkStyles = createStyles({
  color: 'black',
  textDecoration: 'none',
  ':visited': { color: '#444' },
});
const CellLink = createStyledLink(cellLinkStyles, 'CellLink');
const CardCell = ({
  name,
  entry,
  isSourceCard,
  onSinglePage,
  handleMouseMove,
  handleMouseExit,
}: {
  name: string;
  entry: HCCard.Any | HCRelatedCard;
  isSourceCard: boolean;
  onSinglePage?: boolean;
  handleMouseMove: (e: React.MouseEvent<any, MouseEvent>, src: string) => void;
  handleMouseExit: (src: string) => void;
}) => {
  return (
    <NameCell
      isSourceCard={isSourceCard}
      onMouseMove={e => handleMouseMove(e, entry.image ?? '')}
      onMouseLeave={() => handleMouseExit(entry.image ?? '')}
    >
      <CellLink
        onClick={e => {
          if (onSinglePage) {
            e.preventDefault();
            window.open(`/card/${encodeURIComponent(entry.hcid)}`, '_blank');
          }
        }}
        to={`/card/${encodeURIComponent(entry.hcid)}`}
      >
        {name}
      </CellLink>
    </NameCell>
  );
};

export const RelatedCards = ({
  relatedCards,
  sourceCardId,
  onSinglePage,
  allPrints,
}: {
  relatedCards: HCRelatedCard[];
  sourceCardId: string;
  onSinglePage?: boolean;
  allPrints: HCCard.Any[];
}) => {
  const getDisplayName = useCallback(
    (entry: HCRelatedCard | HCCard.Any): string => {
      const setToUse = getCollectorOrderSet(entry.set);
      if (entry.object == 'related_card') {
        return `${entry.name}${
          getSet(entry.set)?.set_type == 'token' &&
          entry.type_line.toLowerCase().startsWith('Token')
            ? ' Token'
            : ''
        }, ${setToUse} #${entry.collector_number}`;
      } else {
        const shouldUseNum = allPrints.some(
          print => print.id != entry.id && getCollectorOrderSet(print.set) == setToUse
        );
        return `${getSet(setToUse)?.name!}${shouldUseNum ? ` #${entry.collector_number}` : ''}`;
      }
    },
    [relatedCards, allPrints, sourceCardId]
  );
  const [tooltipSrc, setTooltipSrc] = useAtom(tooltipSrcAtom);
  const [mouseX, setMouseX] = useAtom(mouseXAtom);
  const [mouseY, setMouseY] = useAtom(mouseYAtom);
  const handleMouseMove = (e: React.MouseEvent<any, MouseEvent>, src: string) => {
    const newMouseX = e.clientX;
    if (newMouseX != mouseX) {
      setMouseX(newMouseX);
    }
    const newMouseY = e.clientY;
    if (newMouseY != mouseY) {
      setMouseY(newMouseY);
    }
    if (src != tooltipSrc && !tooltipSrc) {
      setTooltipSrc(src);
    }
  };
  const handleMouseExit = (src: string) => {
    if (tooltipSrc == src) {
      setTooltipSrc(undefined);
    }
  };

  if (!relatedCards.length && allPrints.every(print => print.id == sourceCardId)) {
    return null;
  }
  return (
    <>
      {relatedCards.length > 0 && (
        <RelatedGrid>
          <RelatedHead>
            <RelatedRow>
              <RelatedHeader>
                <HeaderLink
                  to={`/?q=${encodeURIComponent(
                    `~oracleid:${allPrints[0].oracle_id} include:extras`
                  )}`}
                >
                  Related Cards & Tokens
                </HeaderLink>
              </RelatedHeader>
            </RelatedRow>
          </RelatedHead>
          <RelatedBody>
            {relatedCards.map(entry => (
              <RelatedRow key={entry.id}>
                <CardCell
                  name={getDisplayName(entry)}
                  entry={entry}
                  isSourceCard={entry.id == sourceCardId}
                  onSinglePage={onSinglePage}
                  handleMouseMove={handleMouseMove}
                  handleMouseExit={handleMouseExit}
                />
              </RelatedRow>
            ))}
          </RelatedBody>
        </RelatedGrid>
      )}
      <RelatedGrid>
        <RelatedHead>
          <RelatedRow>
            <RelatedHeader>
              <HeaderLink
                to={`/?q=${encodeURIComponent(
                  `oracleid:${allPrints[0].oracle_id} include:extras unique:prints`
                )}`}
              >
                Prints
              </HeaderLink>
            </RelatedHeader>
          </RelatedRow>
        </RelatedHead>
        <RelatedBody>
          {allPrints.map(entry => (
            <RelatedRow key={entry.id}>
              <CardCell
                name={getDisplayName(entry)}
                entry={entry}
                isSourceCard={entry.id == sourceCardId}
                onSinglePage={onSinglePage}
                handleMouseMove={handleMouseMove}
                handleMouseExit={handleMouseExit}
              />
            </RelatedRow>
          ))}
        </RelatedBody>
      </RelatedGrid>
    </>
  );
};

const relatedGridStyles = createStyles({
  tableLayout: 'fixed',
  width: '100%',
  borderRadius: '4px',
  borderBottom: '3px solid black',
  marginTop: '8px',
});
const RelatedGrid = createStyledTable(relatedGridStyles, 'RelatedGrid');
const relatedHeadStyles = createStyles({
  // backgroundColor: system.color.accent.contrast
  minHeight: '31px',
});
const RelatedHead = createStyledTableHead(relatedHeadStyles, 'RelatedHead');
const relatedHeaderStyles = createStyles({
  minHeight: 'inherit',
  padding: '0 10px',
  backgroundColor: system.color.accent.contrast,
});
const RelatedHeader = createStyledTableHeader(relatedHeaderStyles, 'RelatedHeader');
const headerLinkStyles = createStyles({
  color: '#FFFFFF',
  textTransform: 'uppercase',
  fontSize: '14px',
  textDecoration: 'none',
});
const HeaderLink = createStyledLink(headerLinkStyles, 'HeaderLink');
const relatedRowStyles = createStyles({
  gridTemplateColumns: '1fr',
});
const RelatedRow = createStyledTableRow(relatedRowStyles, 'RelatedRow');
const relatedBodyStyles = createStyles({});
const RelatedBody = createStyledTableBody(relatedBodyStyles, 'RelatedBody');
