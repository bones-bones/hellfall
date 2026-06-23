import { useState } from 'react';
import { HCCard } from '@hellfall/shared/types';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledImg } from '../styling';
import { Box } from '@workday/canvas-kit-react';

export const DeckConstruction = ({ cards }: { cards: HCCard.Any[] }) => {
  const [localCards, setLocalCards] = useState([...cards]);
  const [deck, setDeck] = useState<HCCard.Any[]>([]);
  const draftedCmcColumns = localCards.reduce<Record<number, HCCard.Any[]>>((curr, next) => {
    curr[next.mana_value] = curr[next.mana_value] ? [...curr[next.mana_value], next] : [next];
    return curr;
  }, []);

  const deckCmcColumns = deck.reduce<Record<number, HCCard.Any[]>>((curr, next) => {
    curr[next.mana_value] = curr[next.mana_value] ? [...curr[next.mana_value], next] : [next];
    return curr;
  }, []);

  return (
    <>
      <h3>drafted</h3>
      <DraftedCardsContainer>
        {Object.entries(draftedCmcColumns).map(entry => {
          return (
            <DeckColumn key={entry[0]}>
              <h5>{entry[0]}</h5>
              <div>
                {entry[1].map((entry, i) => {
                  return (
                    <CardContainer key={entry.name + i}>
                      <Card
                        width="210px"
                        title={entry.name}
                        key={entry.name + i}
                        src={entry.image!}
                        crossOrigin="anonymous"
                        onClick={() => {
                          setLocalCards(
                            localCards.filter(localEntry => localEntry.name !== entry.name)
                          );
                          setDeck([entry, ...deck]);
                        }}
                      />
                    </CardContainer>
                  );
                })}
              </div>
            </DeckColumn>
          );
        })}
      </DraftedCardsContainer>
      <h3>deck ({deck.length} cards)</h3>
      <DeckContainer>
        {Object.entries(deckCmcColumns).map(([cmc, cmcCards]) => {
          return (
            <DeckColumn key={cmc}>
              <h5>{cmc}</h5>
              <div>
                {cmcCards.map((entry, i) => {
                  return (
                    <CardContainer key={entry.name + i}>
                      <Card
                        width="210px"
                        title={entry.name}
                        key={entry.name + i}
                        src={entry.image!}
                        crossOrigin="anonymous"
                        onClick={() => {
                          setDeck(deck.filter(localEntry => localEntry.name !== entry.name));
                          setLocalCards([entry, ...localCards]);
                        }}
                      />
                    </CardContainer>
                  );
                })}
              </div>
            </DeckColumn>
          );
        })}
      </DeckContainer>
      <div>{deck.map(e => e.name).join('\n')}</div>
    </>
  );
};

const draftedCardsContainerStyles = createStyles({
  display: 'flex',
  overflowY: 'hidden',
});
const DraftedCardsContainer = createStyledDiv(draftedCardsContainerStyles);

const deckContainerStyles = createStyles({ display: 'flex' });
const DeckContainer = createStyledDiv(deckContainerStyles);

const DeckColumn = Box;

const cardStyles = createStyles({ width: '220px' });
const Card = createStyledImg(cardStyles);

const cardContainerStyles = createStyles({
  height: '40px',
  ':hover': { width: '220px', zIndex: 2, height: 'auto' },
});
const CardContainer = createStyledDiv(cardContainerStyles);
