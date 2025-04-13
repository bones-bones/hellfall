import { useEffect, useState } from "react";
import { HCEntry } from "../../types";
import { HandCard } from "./HandCard";
import { PlayCard } from "./PlayCard";
import styled from "@emotion/styled";

const PlayArea = styled.div({ border: "1px solid black" });

type Props = { cards: HCEntry[] };
export const PlaytestArea = ({ cards }: Props) => {
  const { hand, drawCards, ready, playCard, play } = useCardState(cards);
  const [life, setLife] = useState(20);

  useEffect(() => {
    drawCards(7);
  }, [ready]);
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
        {play.map((entry) => {
          return <PlayCard key={entry.id} image={entry.card.Image[0]!} />;
        })}
      </PlayArea>
      <div>
        <h3>Hand</h3>
        {hand.map((entry) => {
          return (
            <HandCard
              key={entry.id}
              image={entry.card.Image[0]!}
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
    </>
  );
};

type CardRepresentation = { card: HCEntry; id: number };

const useCardState = (cards: HCEntry[]) => {
  const [deck, setDeck] = useState<CardRepresentation[]>(
    cards
      .map((entry, i) => ({ card: entry, id: i }))
      .sort(() => Math.random() - Math.random())
  );

  const [hand, setHand] = useState<CardRepresentation[]>([]);

  const [play, setPlay] = useState<CardRepresentation[]>([]);

  const [ready, setReady] = useState(false);

  // useEffect(() => {
  //   if (cards.length > 0) {
  //     const playObjects = cards
  //       .map((entry, i) => ({ card: entry, id: i }))
  //       .sort(() => Math.random() - Math.random());

  //     setDeck(playObjects);
  //     setReady(true);
  //   }
  // }, [cards]);

  const drawCards = (amount: number) => {
    const cardsToDraw = Math.min(deck.length, amount);
    const cardsForHand = deck.slice(0, cardsToDraw);

    setDeck(deck.slice(cardsToDraw));
    setHand(hand.concat(cardsForHand));
  };

  const playCard = (id: number) => {
    console.log(
      hand.filter((entry) => {
        return entry.id == id;
      }),
      id,
      hand.map((entry) => entry.id)
    );
    setPlay(
      play.concat(
        hand.filter((entry) => {
          return entry.id == id;
        })
      )
    );
    setHand(hand.filter((entry) => entry.id !== id));
  };

  return { deck, hand, play, drawCards, playCard, ready };
};
