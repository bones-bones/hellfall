import { useEffect, useState } from 'react';
import { HCCard } from '@hellfall/shared/types';
import { HandCard } from './HandCard.tsx';
import { PlayCard } from './PlayCard.tsx';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv } from '../../styling';

const playAreaStyles = createStyles({ border: '1px solid black' });
const PlayArea = createStyledDiv(playAreaStyles, 'PlayArea');
// make sure images work properly

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const toRep = (cards: HCCard.Any[]) => cards.map((entry, i) => ({ card: entry, id: i }));

type Props = { cards: HCCard.Any[] };
export const PlaytestArea = ({ cards }: Props) => {
  const { hand, drawCards, playCard, play, resetCards } = useCardState(cards);
  const [life, setLife] = useState(20);

  console.log(play);

  return (
    <>
      <>
        <button
          onClick={() => {
            setLife(life + 1);
          }}
        >
          +
        </button>
        life {life}
        <button
          onClick={() => {
            setLife(life - 1);
          }}
        >
          -
        </button>
      </>
      <h3>battlefield</h3>
      <PlayArea>
        {play.map(entry => {
          return (
            <PlayCard
              key={entry.id}
              image={
                'card_faces' in entry.card && entry.card.card_faces[0].image
                  ? entry.card.card_faces[0].image
                  : entry.card.image!
              }
            />
          );
        })}
      </PlayArea>
      <div>
        <h3>Hand</h3>
        {hand.map(entry => {
          return (
            <HandCard
              key={entry.id}
              image={
                'card_faces' in entry.card && entry.card.card_faces[0].image
                  ? entry.card.card_faces[0].image
                  : entry.card.image!
              }
              onClick={() => {
                playCard(entry.id);
              }}
            />
          );
        })}
      </div>
      <button
        onClick={() => {
          drawCards(1);
        }}
      >
        draw a card
      </button>
      <button
        onClick={() => {
          resetCards();
          setLife(20);
        }}
      >
        restart the playtest
      </button>
    </>
  );
};

type CardRepresentation = { card: HCCard.Any; id: number };
const useCardState = (cards: HCCard.Any[]) => {
  const [deck, setDeck] = useState<CardRepresentation[]>(shuffle(toRep(cards)));

  const [hand, setHand] = useState<CardRepresentation[]>([]);

  const [play, setPlay] = useState<CardRepresentation[]>([]);

  useEffect(() => resetCards(), [cards]);

  const resetCards = () => {
    setDeck(shuffle(toRep(cards)));
    setHand([]);
    setPlay([]);
    drawCards(7);
  };

  const drawCards = (amount: number) => {
    const cardsToDraw = Math.min(deck.length, amount);
    const cardsForHand = deck.slice(0, cardsToDraw);

    setDeck(deck.slice(cardsToDraw));
    setHand(hand.concat(cardsForHand));
  };

  const playCard = (id: number) => {
    console.log(
      hand.filter(entry => {
        return entry.id == id;
      }),
      id,
      hand.map(entry => entry.id)
    );
    setPlay(
      play.concat(
        hand.filter(entry => {
          return entry.id == id;
        })
      )
    );
    setHand(hand.filter(entry => entry.id !== id));
  };

  return { deck, hand, play, drawCards, playCard, resetCards };
};
