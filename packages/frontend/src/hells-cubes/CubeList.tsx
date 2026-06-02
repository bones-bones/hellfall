import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import styled from '@emotion/styled';
import { Link, useParams } from 'react-router-dom';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { HellfallCard } from '../hellfall/card/HellfallCard.tsx';
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
import { useMemo } from 'react';

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
        .getAllInSetList([...cubeResourceSetCodes])
        .mapToArray(card => card)
        .sort(compareCubeListCards);
    }
    return cardMap.getAllInSet(setCode).mapToArray(card => card);
  }, [cardMap, setCode]);

  const sections = useMemo(() => groupCubeCards(cards), [cards]);
  const cubeName =
    setCode === ('All' as SetCode) ? 'All Hellscube sets' : cubeNameForCode(setCode, setCode);
  const totalCards = cards.length;

  if (!setCodeParam) {
    return null;
  }

  return (
    <Page>
      <title>{cubeName} card list | Hellfall</title>
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
              <JumpLink key={section.id} href={`#${section.id}`}>
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
                    <CardRow key={card.id} onMouseEnter={() => setActiveCard(card)}>
                      <NameCell href={`/card/${card.name}`}>{card.name}</NameCell>
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

const Page = styled.div({
  backgroundColor: '#9e9e9e',
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const Sheet = styled.div<{ wide: boolean }>(({ wide }) => ({
  width: wide ? 'min(92vw, 1400px)' : '100%',
  margin: wide ? '0 4vw' : 0,
  backgroundColor: 'white',
  padding: '24px 28px 48px',
}));

const TopBar = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '20px',
});

const Meta = styled.p({
  margin: '4px 0 0',
  color: '#444',
  fontSize: '15px',
});

const TopLinks = styled.div({
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  fontSize: '15px',
});

const BackLink = styled(Link)({
  color: '#333',
  ':hover': { color: '#5a2d91' },
});

const JumpNav = styled.nav({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 14px',
  marginBottom: '24px',
  paddingBottom: '12px',
  borderBottom: '1px solid #ddd',
  fontSize: '14px',
});

const JumpLink = styled.a({
  color: '#333',
  ':hover': { color: '#5a2d91' },
});

const Body = styled.div({
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
});

const ListColumn = styled.div({
  flex: '1 1 520px',
  minWidth: 0,
});

const PreviewColumn = styled.aside<{ wide: boolean }>(({ wide }) => ({
  flex: wide ? '0 0 340px' : '0 0 0',
  display: wide ? 'block' : 'none',
  position: 'sticky',
  top: '12px',
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
}));

const PreviewPlaceholder = styled.div({
  color: '#888',
  fontSize: '14px',
  padding: '12px',
  border: '1px dashed #ccc',
});

const SectionBlock = styled.section({
  marginBottom: '32px',
  scrollMarginTop: '12px',
});

const SectionTitle = styled.h3({
  margin: '0 0 8px',
  fontSize: '18px',
  borderBottom: '2px solid #C690FF',
  paddingBottom: '4px',
});

const SectionCount = styled.span({
  marginLeft: '8px',
  fontWeight: 'normal',
  color: '#666',
  fontSize: '15px',
});

const GridHeader = styled.div({
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

const CardRow = styled.div({
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 2fr) 72px 32px minmax(100px, 1.5fr) 56px',
  gap: '8px',
  alignItems: 'center',
  padding: '2px 0',
  fontSize: '15px',
  ':hover': { backgroundColor: '#f5f0ff' },
});

const NameCell = styled.a({
  fontWeight: 600,
  color: 'black',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: '#444' },
});

const CostCell = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
});

const MvCell = styled.div({
  textAlign: 'right',
  color: '#444',
});

const TypeCell = styled.div({
  color: '#333',
  fontSize: '14px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const ColorCell = styled.div({
  fontSize: '13px',
  color: '#555',
});

const EmptyNote = styled.p({
  color: '#666',
});
