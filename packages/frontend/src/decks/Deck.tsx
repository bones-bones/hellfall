import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { HCCard } from '@hellfall/shared/types';
import { HellfallCard } from '../hellfall/card/HellfallCard.tsx';
import { CardEntry } from './types.ts';
import { useParams } from 'react-router-dom';
import { allDecks } from './allDecks.ts';
import { stringToMana } from '../hellfall/stringToMana.tsx';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledDiv,
  createStyledDiv,
  createStyledIntrinsic,
  createStyledLink,
} from '../styling';
import { Box, BoxProps } from '@workday/canvas-kit-react';
import { useEffect } from 'react';

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
    return 'card_faces' in card.hcCard
      ? card.hcCard.card_faces[0].types?.map(type => type.toLowerCase())
      : card.hcCard.types?.map(types => types.toLowerCase());
  };

  const reduddd = resolvedMainDeck.reduce<Record<string, RenderEntry[]>>((curr, next) => {
    if (renderTypes(next)?.includes('land') || !next.hcCard) {
      curr['land'] = (curr['land'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('creature')) {
      curr['creature'] = (curr['creature'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('planeswalker')) {
      curr['planeswalker'] = (curr['planeswalker'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('instant')) {
      curr['instant'] = (curr['instant'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('sorcery')) {
      curr['sorcery'] = (curr['sorcery'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('artifact')) {
      curr['artifact'] = (curr['artifact'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('enchantment')) {
      curr['enchantment'] = (curr['enchantment'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('battle')) {
      curr['battle'] = (curr['battle'] ?? []).concat(next);
    } else {
      curr[renderTypes(next)?.join() || '????'] = (
        curr[renderTypes(next)?.join() || '????'] ?? []
      ).concat(next);
    }

    return curr;
  }, {});
  const redudddS = resolvedSideBoard.reduce<Record<string, RenderEntry[]>>((curr, next) => {
    if (renderTypes(next)?.includes('creature')) {
      curr['creature'] = (curr['creature'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('planeswalker')) {
      curr['planeswalker'] = (curr['planeswalker'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('instant')) {
      curr['instant'] = (curr['instant'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('sorcery')) {
      curr['sorcery'] = (curr['sorcery'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('artifact')) {
      curr['artifact'] = (curr['artifact'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('enchantment')) {
      curr['enchantment'] = (curr['enchantment'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('battle')) {
      curr['battle'] = (curr['battle'] ?? []).concat(next);
    } else if (renderTypes(next)?.includes('land') || !next.hcCard) {
      curr['land'] = (curr['land'] ?? []).concat(next);
    } else {
      curr[renderTypes(next)?.join() || '????'] = (
        curr[renderTypes(next)?.join() || '????'] ?? []
      ).concat(next);
    }

    return curr;
  }, {});
  useEffect(() => {
    if (!deck.title) {
      document.title = `Loading | Hellfall`;
    } else {
      document.title = `${deck.title} | Hellfall`;
    }
  }, [deck]);

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

const deckHeadingStyles = createStyles({ marginTop: '40px', marginBottom: '0px' });
const DeckHeading = createStyledIntrinsic('h3', deckHeadingStyles);

const bigContainerStencil = createStencil({
  vars: {},
  base: {
    width: '100%',
    maxWidth: '1600px',
    backgroundColor: 'white',
    height: '100vw',
  },
  modifiers: {
    showGutter: {
      true: {
        width: '80vw',
        marginLeft: '10vw',
        marginRight: '10vw',
      },
    },
  },
});
interface GutterDivProps extends BoxProps {
  showGutter?: boolean;
}
const BigContainer = createStenciledDiv<GutterDivProps>(bigContainerStencil);

const biggestContainerStyles = createStyles({
  backgroundColor: 'grey',
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
});
const BiggestContainer = createStyledDiv(biggestContainerStyles);

const textContainerStyles = createStyles({
  marginLeft: '40px',
  marginRight: '40px',
  whiteSpace: 'pre-wrap',

  marginTop: '40px',
  fontSize: '18px',
});
const TextContainer = createStyledDiv(textContainerStyles);

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

const deckConStyles = createStyles({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minHeight: '600px',
  paddingLeft: '20px',
});
const DeckCon = createStyledDiv(deckConStyles);

const activeCardContainerStencil = createStencil({
  vars: {},
  base: {
    width: '380px',
    maxHeight: '900px',
    top: '50px',
    overflowY: 'scroll',
    position: 'fixed',
    right: '0px',
  },
  modifiers: {
    showGutter: {
      true: {
        right: '10vw',
      },
    },
  },
});
const ActiveCardContainer = createStenciledDiv<GutterDivProps>(activeCardContainerStencil);

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
                  <BoldSpan to={'/card/' + (entry.hcCard?.hcid || '')}>{entry.name}</BoldSpan>{' '}
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

const h4Styles = createStyles({ marginBottom: '10px' });
const StyledH4 = createStyledIntrinsic('h4', h4Styles);

const CardColumn = Box;
const CostColumn = Box;

const moneyColumnStyles = createStyles({ textAlign: 'end' });
const MoneyColumn = createStyledDiv(moneyColumnStyles);

const catConStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});
const CatCon = createStyledDiv(catConStyles);

const catSecConStyles = createStyles({
  width: '35vw',
  display: 'grid',
  gridTemplateColumns: '3fr 1.25fr 0.5fr',
  gap: '0',
  rowGap: '2px',
});
const CatSecCon = createStyledDiv(catSecConStyles);

const boldSpanStyles = createStyles({
  fontWeight: 'bold',
  color: 'black',
  ':hover': { textDecoration: 'underline' },
  ':visited': { color: 'darkgrey' },
});
const BoldSpan = createStyledLink(boldSpanStyles);

const cardLineContainerStyles = createStyles({
  display: 'contents',
});
const CardLineContainer = createStyledDiv(cardLineContainerStyles);

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

  const fullDaysSinceEpoch = Math.floor(Date.now() / 8.64e7);

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
