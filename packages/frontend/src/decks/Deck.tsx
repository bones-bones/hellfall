import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom';
import { HCCard } from '@hellfall/shared/types';
import styled from '@emotion/styled';
import { HellfallCard } from '../hellfall/card/HellfallCard';
import { CardEntry } from './types';
import { useParams } from 'react-router-dom';
import { allDecks } from './allDecks';
import { stringToMana } from '../hellfall/stringToMana';

const activeCardAtom = atom<HCCard.Any | undefined>(undefined);

export const Deck = () => {
  const { '*': deckName } = useParams();
  const deck = allDecks.find(e => e.title == deckName)!;
  const cards = useAtomValue(cardsAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const resolveCard = (entry: CardEntry): RenderEntry => {
    if (entry.name[0] == '%') {
      return {
        count: entry.count,
        name: cards.find(e => e.id == entry.name.slice(1))!.id,
        id: entry.name.slice(1),
        hcCard: cards.find(e => e.id == entry.name.slice(1)),
      };
    } else {
      return {
        count: entry.count,
        name: entry.name,
        id: cards.find(e => e.name.toLowerCase() == entry.name.toLowerCase())?.id,
        hcCard: cards.find(e => e.name.toLowerCase() == entry.name.toLowerCase()),
      };
    }
  };
  const resolvedMainDeck = deck.cards.main.map(resolveCard) as RenderEntry[];

  const resolvedSideBoard = deck.cards.sideboard.map(resolveCard) as RenderEntry[];
  const renderTypes = (card: RenderEntry): string[] | undefined => {
    if (!card.hcCard) {
      return undefined;
    }
    return 'card_faces' in card.hcCard ? card.hcCard.card_faces[0].types : card.hcCard.types;
  };

  const reduddd = resolvedMainDeck.reduce<Record<string, RenderEntry[]>>((curr, next) => {
    if (renderTypes(next)?.includes('Land') || !next.hcCard) {
      curr['Land'] = (curr['Land'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Creature')) {
      curr['Creature'] = (curr['Creature'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Planeswalker')) {
      curr['Planeswalker'] = (curr['Planeswalker'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Instant')) {
      curr['Instant'] = (curr['Instant'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Sorcery')) {
      curr['Sorcery'] = (curr['Sorcery'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Artifact')) {
      curr['Artifact'] = (curr['Artifact'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Enchantment')) {
      curr['Enchantment'] = (curr['Enchantment'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Battle')) {
      curr['Battle'] = (curr['Battle'] ?? []).concat(next);
    } else {
      curr[renderTypes(next)?.join() || '????'] = (
        curr[renderTypes(next)?.join() || '????'] ?? []
      ).concat(next);
    }

    return curr;
  }, {});
  const redudddS = resolvedSideBoard.reduce<Record<string, RenderEntry[]>>((curr, next) => {
    if (renderTypes(next)?.includes('Creature')) {
      curr['Creature'] = (curr['Creature'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Planeswalker')) {
      curr['Planeswalker'] = (curr['Planeswalker'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Instant')) {
      curr['Instant'] = (curr['Instant'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Sorcery')) {
      curr['Sorcery'] = (curr['Sorcery'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Artifact')) {
      curr['Artifact'] = (curr['Artifact'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Enchantment')) {
      curr['Enchantment'] = (curr['Enchantment'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Battle')) {
      curr['Battle'] = (curr['Battle'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('Land') || !next.hcCard) {
      curr['Land'] = (curr['Land'] ?? []).concat(next);
    } else {
      curr[renderTypes(next)?.join() || '????'] = (
        curr[renderTypes(next)?.join() || '????'] ?? []
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

const ActiveCardContainer = styled.div<{ showGutter: boolean }>(({ showGutter }) => ({
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
  setActive: (val?: HCCard.Any) => void;
}) => {
  return (
    <CatCon key={title}>
      <StyledH4>{`${title} (${cards.reduce((curr, next) => {
        return curr + next.count;
      }, 0)})`}</StyledH4>
      <CatSecCon>
        {cards
          .sort((a, b) => {
            return (a.hcCard?.mana_value || 0) > (b.hcCard?.mana_value || 0) ? 1 : -1;
          })
          .map(entry => {
            return (
              <CardLineContainer key={entry.name}>
                <CardColumn onMouseOver={() => setActive(entry.hcCard)}>
                  {entry.count}{' '}
                  <BoldSpan href={'/hellfall/card/' + entry.hcCard?.name}>{entry.name}</BoldSpan>{' '}
                </CardColumn>{' '}
                <CostColumn>{stringToMana(entry.hcCard?.mana_cost || '')}</CostColumn>
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

type RenderEntry = {
  name: string;
  id: string | undefined;
  count: number;
  hcCard?: HCCard.Any;
};

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
