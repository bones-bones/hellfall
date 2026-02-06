import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/cardsAtom';
import { HCEntry } from '../types';
import styled from '@emotion/styled';
import { HellfallCard } from '../hellfall/HellfallCard';
import { CardEntry } from './types';
import { useParams } from 'react-router-dom';
import { allDecks } from './allDecks';
import { stringToMana } from '../hellfall/stringToMana';

const activeCardAtom = atom<HCEntry | undefined>(undefined);

export const Deck = () => {
  const { '*': deckName } = useParams();
  const deck = allDecks.find(e => e.title == deckName)!;
  const cards = useAtomValue(cardsAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const resolvedMainDeck = deck.cards.main.map(entry => {
    return {
      count: entry.count,
      name: entry.name,
      hcEntry: cards.find(e => e.Name == entry.name),
    };
  }) as RenderEntry[];

  const resolvedSideBoard = deck.cards.sideboard.map(entry => {
    return {
      count: entry.count,
      name: entry.name,
      hcEntry: cards.find(e => e.Name == entry.name),
    };
  }) as RenderEntry[];

  const reduddd = resolvedMainDeck.reduce<Record<string, CardEntry[]>>((curr, next) => {
    if (next.hcEntry?.['Card Type(s)'][0]?.includes('Land') || !next.hcEntry) {
      curr['Land'] = (curr['Land'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Creature')) {
      curr['Creature'] = (curr['Creature'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Planeswalker')) {
      curr['Planeswalker'] = (curr['Planeswalker'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Instant')) {
      curr['Instant'] = (curr['Instant'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Sorcery')) {
      curr['Sorcery'] = (curr['Sorcery'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Artifact')) {
      curr['Artifact'] = (curr['Artifact'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Enchantment')) {
      curr['Enchantment'] = (curr['Enchantment'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Battle')) {
      curr['Battle'] = (curr['Battle'] ?? []).concat(next);
    } else {
      curr[next.hcEntry['Card Type(s)'][0] || '????'] = (
        curr[next.hcEntry['Card Type(s)'][0] || '????'] ?? []
      ).concat(next);
    }

    return curr;
  }, {});
  const redudddS = resolvedSideBoard.reduce<Record<string, CardEntry[]>>((curr, next) => {
    if (next.hcEntry?.['Card Type(s)'][0]?.includes('Creature')) {
      curr['Creature'] = (curr['Creature'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Planeswalker')) {
      curr['Planeswalker'] = (curr['Planeswalker'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Instant')) {
      curr['Instant'] = (curr['Instant'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Sorcery')) {
      curr['Sorcery'] = (curr['Sorcery'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Artifact')) {
      curr['Artifact'] = (curr['Artifact'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Enchantment')) {
      curr['Enchantment'] = (curr['Enchantment'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Battle')) {
      curr['Battle'] = (curr['Battle'] ?? []).concat(next);
    } else if (next.hcEntry?.['Card Type(s)'][0]?.includes('Land') || !next.hcEntry) {
      curr['Land'] = (curr['Land'] ?? []).concat(next);
    } else {
      curr[next.hcEntry['Card Type(s)'][0] || '????'] = (
        curr[next.hcEntry['Card Type(s)'][0] || '????'] ?? []
      ).concat(next);
    }

    return curr;
  }, {});

  return (
    <BiggestContainer>
      <BigContainer showGutter={window.innerWidth > 800}>
        <h2>{deck.title}</h2>
        <h3>By: {deck.author}</h3>
        <TextContainer>{deck.text}</TextContainer>
        <DeckCon>
          <div>
            <DeckHeading key="main">Maindeck</DeckHeading>
            <CardContainer />
            {Object.entries(reduddd).map(([key, val]) => {
              return (
                <CategorySection setActive={setActiveCard} title={key} key={key} cards={val} />
              );
            })}
            <DeckHeading key="side">Sideboard</DeckHeading>
            {Object.entries(redudddS).map(([key, val]) => {
              return (
                <CategorySection setActive={setActiveCard} title={key} key={key} cards={val} />
              );
            })}
          </div>
        </DeckCon>
      </BigContainer>
    </BiggestContainer>
  );
};

const DeckHeading = styled.h3({ marginTop: '40px', marginBottom: '0px' });
const BigContainer = styled.div(({ showGutter }: { showGutter: boolean }) => ({
  width: showGutter ? '80vw' : '100%',
  maxWidth: '1600px',
  backgroundColor: 'white',

  height: '100vw',
  ...(showGutter && { marginLeft: '10vw', marginRight: '10vw' }),
}));
const BiggestContainer = styled.div({
  backgroundColor: 'grey',
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
});
const TextContainer = styled.div({
  marginLeft: '40px',
  marginRight: '40px',
  whiteSpace: 'pre-wrap',

  marginTop: '40px',
  fontSize: '18px',
});
const CardContainer = () => {
  const [activeCard] = useAtom(activeCardAtom);

  return (
    <>
      {activeCard && (
        <ActiveCardContainer showGutter={window.innerWidth > 800}>
          <HellfallCard data={activeCard} />
        </ActiveCardContainer>
      )}
    </>
  );
};

const DeckCon = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minHeight: '600px',
  paddingLeft: '20px',
});

const ActiveCardContainer = styled.div(({ showGutter }: { showGutter: boolean }) => ({
  width: '380px',
  maxHeight: '900px',
  top: '50px',
  overflowY: 'scroll',
  position: 'fixed',
  right: showGutter ? '10vw' : '0px',
}));
const CategorySection = ({
  cards,
  title,
  setActive,
}: {
  cards: RenderEntry[];
  title: string;
  setActive: (val?: HCEntry) => void;
}) => {
  return (
    <CatCon key={title}>
      <StyledH4>{`${title} (${cards.reduce((curr, next) => {
        return curr + next.count;
      }, 0)})`}</StyledH4>
      <CatSecCon>
        {cards
          .sort((a, b) => {
            return (a.hcEntry?.CMC || 0) > (b.hcEntry?.CMC || 0) ? 1 : -1;
          })
          .map(entry => {
            return (
              <CardLineContainer key={entry.name}>
                <CardColumn onMouseOver={() => setActive(entry.hcEntry)}>
                  {entry.count}{' '}
                  <BoldSpan href={'/hellfall/card/' + entry.hcEntry?.Name}>{entry.name}</BoldSpan>{' '}
                </CardColumn>{' '}
                <CostColumn>{stringToMana(entry.hcEntry?.Cost[0] || '')}</CostColumn>
                <MoneyColumn key={entry.name + 'cash'}>{getPrice(entry.name)}</MoneyColumn>
              </CardLineContainer>
            );
          })}
      </CatSecCon>
    </CatCon>
  );
};
const StyledH4 = styled.h4({ marginBottom: '10px' });
const CardColumn = styled.div({});
const CostColumn = styled.div({});
const MoneyColumn = styled.div({
  textAlign: 'end',
});
const CatCon = styled.div({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',
});
const CatSecCon = styled.div({
  width: '35vw',
  display: 'grid',
  gridTemplateColumns: '3fr 1.25fr 0.5fr',
  gap: '0',
  rowGap: '2px',
});
const BoldSpan = styled.a({
  fontWeight: 'bold',
  color: 'black',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: 'darkgrey' },
});
const CardLineContainer = styled.div({
  display: 'contents',
});

type RenderEntry = { name: string; count: number; hcEntry?: HCEntry };

// TODO: write a function that takes a hash of the name and use it to generate number of index spaces between 0.01 and 100.00
const getPrice = (name: string) => {
  const { length } = name;
  let nameV = 0;
  for (let i = 0; i < length; i++) {
    nameV += name.charCodeAt(i);
  }

  const now = new Date();
  //@ts-ignore
  const fullDaysSinceEpoch = Math.floor(now / 8.64e7);

  const uhhh = (fullDaysSinceEpoch * nameV) % 10;

  const bigString = (nameV * fullDaysSinceEpoch).toString();
  if (uhhh < 4) {
    return `$0.${bigString.slice(0, 2)}`;
  }
  if (uhhh === 9) {
    return `$${bigString.slice(0, 3)}.${bigString.slice(4, 6)}`;
  }

  return `$${bigString.slice(0, 2)}.${bigString.slice(3, 5)}`;
};
