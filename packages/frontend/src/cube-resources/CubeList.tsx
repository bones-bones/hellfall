import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { HellfallCard } from '../hellfall/card';
import { stringToMana } from '../hellfall/stringToMana.tsx';
import {
  compareCubeListCards,
  cubeResourceSetCodes,
  formatTypeLine,
  getSet,
  groupCubeCards,
  isPlayableCubeCard,
} from '@hellfall/shared/utils';
import { HCCard, SetCode } from '@hellfall/shared/types';
import { useEffect, useMemo } from 'react';
import { BoxProps } from '@workday/canvas-kit-react';
import {
  createStenciledDiv,
  createStenciledIntrinsic,
  createStyledDiv,
  createStyledIntrinsic,
  createStyledLink,
  createStyledSpan,
} from '../styling';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';

const activeCardAtom = atom<HCCard.Any | undefined>(undefined);

const cubeNameForCode = (setCode: SetCode, fallback: string) => getSet(setCode)?.name ?? fallback;

export const CubeList = () => {
  const { setCode: setCodeParam } = useParams<{ setCode: SetCode }>();
  const setCode = (setCodeParam ?? 'HC8') as SetCode;
  const cardMap = useAtomValue(cardsAtom).filter(isPlayableCubeCard);
  const setActiveCard = useSetAtom(activeCardAtom);

  const cards = useMemo(() => {
    if (setCode === ('All' as SetCode)) {
      return cardMap
        .getAllInSetListDirect([...cubeResourceSetCodes])
        .mapToArray(card => card)
        .sort(compareCubeListCards);
    }
    return cardMap.getAllInSetDirect(setCode).mapToArray(card => card);
  }, [cardMap, setCode]);

  const sections = useMemo(() => groupCubeCards(cards), [cards]);
  const cubeName =
    setCode === ('All' as SetCode) ? 'All Hellscube sets' : cubeNameForCode(setCode, setCode);
  const totalCards = cards.length;
  useEffect(() => {
    if (!cubeName) {
      document.title = `Loading | Hellfall`;
    } else {
      document.title = `${cubeName} | Hellfall`;
    }
  }, [cubeName]);

  if (!setCodeParam) {
    return null;
  }

  return (
    <Page>
      <Sheet wide={window.innerWidth > 800}>
        <TopBar>
          <div>
            <h2>{cubeName}</h2>
            <Meta>{totalCards} cards · sorted by color, mana value, then type</Meta>
          </div>
          <TopLinks>
            <BackLink to="/hellscubes">cube resources</BackLink>
            <BackLink to={`/?q=set:${setCode}`}>search this set</BackLink>
          </TopLinks>
        </TopBar>

        {sections.length > 0 && (
          <JumpNav>
            {sections.map(({ section, cards: sectionCards }) => (
              <JumpLink key={section.id} to={`#${section.id}`}>
                {section.label} ({sectionCards.length})
              </JumpLink>
            ))}
          </JumpNav>
        )}

        <Body>
          <ListColumn>
            {sections.length === 0 ? (
              <EmptyNote>No cards found for set {setCode}.</EmptyNote>
            ) : (
              sections.map(({ section, cards: sectionCards }) => (
                <SectionBlock key={section.id} id={section.id}>
                  <SectionTitle>
                    {section.label}
                    <SectionCount>{sectionCards.length}</SectionCount>
                  </SectionTitle>
                  <GridHeader>
                    <span>Name</span>
                    <span>Cost</span>
                    <span>MV</span>
                    <span>Type</span>
                  </GridHeader>
                  {sectionCards.map(card => (
                    <CardRow key={card.id}>
                      <NameCell to={`/card/${card.name}`} onMouseEnter={() => setActiveCard(card)}>
                        {card.name}
                      </NameCell>
                      <CostCell>{stringToMana(card.mana_cost || '')}</CostCell>
                      <MvCell>{card.mana_value}</MvCell>
                      <TypeCell>{formatTypeLine(card)}</TypeCell>
                    </CardRow>
                  ))}
                </SectionBlock>
              ))
            )}
          </ListColumn>
          <PreviewColumn wide={window.innerWidth > 900}>
            <CardPreview />
          </PreviewColumn>
        </Body>
      </Sheet>
    </Page>
  );
};

const CardPreview = () => {
  const [activeCard] = useAtom(activeCardAtom);
  if (!activeCard) {
    return <PreviewPlaceholder>hover a card</PreviewPlaceholder>;
  }
  return <HellfallCard data={activeCard} />;
};

const pageStyles = createStyles({
  backgroundColor: '#9e9e9e',
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'center',
});
const Page = createStyledDiv(pageStyles);

const sheetStencil = createStencil({
  vars: {},
  base: {
    width: '100%',
    margin: 0,
    backgroundColor: 'white',
    padding: '24px 28px 48px',
  },
  modifiers: {
    wide: {
      true: {
        width: 'min(92vw, 1400px)',
        margin: '0 4vw',
      },
    },
  },
});
interface SheetProps extends BoxProps {
  wide?: boolean;
}
const Sheet = createStenciledDiv<SheetProps>(sheetStencil);

const topBarStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '20px',
});
const TopBar = createStyledDiv(topBarStyles);

const metaStyles = createStyles({
  margin: '4px 0 0',
  color: '#444',
  fontSize: '15px',
});
const Meta = createStyledIntrinsic('p', metaStyles);

const topLinksStyles = createStyles({
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  fontSize: '15px',
});
const TopLinks = createStyledDiv(topLinksStyles);

const backLinkStyles = createStyles({
  color: '#333',
  ':hover': { color: '#5a2d91' },
});
const BackLink = createStyledLink(backLinkStyles);

const jumpLinkStyles = createStyles({
  color: '#333',
  ':hover': { color: '#5a2d91' },
});
const JumpLink = createStyledLink(jumpLinkStyles);

const jumpNavStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 14px',
  marginBottom: '24px',
  paddingBottom: '12px',
  borderBottom: '1px solid #ddd',
  fontSize: '14px',
});
const JumpNav = createStyledIntrinsic('nav', jumpNavStyles);

const bodyStyles = createStyles({
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
});
const Body = createStyledDiv(bodyStyles);

const listColumnStyles = createStyles({
  flex: '1 1 520px',
  minWidth: 0,
});
const ListColumn = createStyledDiv(listColumnStyles);

const previewColumnStencil = createStencil({
  vars: {},
  base: {
    flex: '0 0 0',
    display: 'none',
    position: 'sticky',
    top: '12px',
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto',
  },
  modifiers: {
    wide: {
      true: {
        flex: '0 0 340px',
        display: 'block',
      },
    },
  },
});
interface PreviewColumnProps extends React.ComponentPropsWithoutRef<'aside'> {
  wide?: boolean;
}
const PreviewColumn = createStenciledIntrinsic<PreviewColumnProps>('aside', previewColumnStencil);

const previewPlaceholderStyles = createStyles({
  color: '#888',
  fontSize: '14px',
  padding: '12px',
  border: '1px dashed #ccc',
});
const PreviewPlaceholder = createStyledDiv(previewPlaceholderStyles);

const sectionBlockStyles = createStyles({
  marginBottom: '32px',
  scrollMarginTop: '12px',
});
const SectionBlock = createStyledIntrinsic('section', sectionBlockStyles);

const sectionTitleStyles = createStyles({
  margin: '0 0 8px',
  fontSize: '18px',
  borderBottom: '2px solid #C690FF',
  paddingBottom: '4px',
});
const SectionTitle = createStyledIntrinsic('h3', sectionTitleStyles);

const sectionCountStyles = createStyles({
  marginLeft: '8px',
  fontWeight: 'normal',
  color: '#666',
  fontSize: '15px',
});
const SectionCount = createStyledSpan(sectionCountStyles);

const gridHeaderStyles = createStyles({
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 2fr) 72px 32px minmax(100px, 1.5fr) 56px',
  gap: '8px',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#666',
  paddingBottom: '4px',
  borderBottom: '1px solid #eee',
});
const GridHeader = createStyledDiv(gridHeaderStyles);

const cardRowStyles = createStyles({
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 2fr) 72px 32px minmax(100px, 1.5fr) 56px',
  gap: '8px',
  alignItems: 'center',
  padding: '2px 0',
  fontSize: '15px',
  ':hover': { backgroundColor: '#f5f0ff' },
});
const CardRow = createStyledDiv(cardRowStyles);

const nameCellStyles = createStyles({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});
const NameCell = createStyledLink(nameCellStyles);

const costCellStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
});
const CostCell = createStyledDiv(costCellStyles);

const mvCellStyles = createStyles({
  textAlign: 'right',
  color: '#444',
});
const MvCell = createStyledDiv(mvCellStyles);

const typeCellStyles = createStyles({
  color: '#333',
  fontSize: '14px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
const TypeCell = createStyledDiv(typeCellStyles);

const colorCellStyles = createStyles({
  fontSize: '13px',
  color: '#555',
});
const ColorCell = createStyledDiv(colorCellStyles);

const emptyNoteStyles = createStyles({
  color: '#666',
});
const EmptyNote = createStyledIntrinsic('p', emptyNoteStyles);
