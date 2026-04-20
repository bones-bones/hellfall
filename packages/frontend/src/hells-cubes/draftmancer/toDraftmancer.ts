// https://draftmancer.com/cubeformat.html#cube
import { HCCard } from '@hellfall/shared/types';
// import { getDraftMancerCard } from './getDraftMancerCard.ts';
import { HCToDraftmancer } from './HCToDraftmancer.ts';
import { DraftmancerCustomCard } from '../types.ts';

export const toDraftmancerCube = ({ set, allCards }: { set: string; allCards: HCCard.Any[] }) => {
  // cards.forEach(card => {
  //   card.name = card.name
  //     .replace(/\[/g, 'OPENBRACKET')
  //     .replace(/\]/g, 'CLOSEBRACKET')
  //     .replace(/^ /g, 'SPACE');
  // });
  // TODO: make sure this works
  // const componentCards = cards.filter(card =>
  //   Boolean(card.all_parts?.find(e => e.id == card.id && e.component != 'token_maker'))
  // );

  // const componentCardsAsDraftmancer = componentCards.map(getDraftMancerCard);

  const { cards: cards, tokens: tokens } = HCToDraftmancer(allCards, set);

  // const noComponentCards = cards.filter(
  //   card => !card.all_parts?.find(e => e.id == card.id && e.component != 'token_maker')
  // );

  if (set === 'HC6') {
    const commanderCards = cards.filter(card => card.canBeACommander);
    const nonCommanderCards = cards.filter(card => !card.canBeACommander);

    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA",
    "boosterSettings": [
        {
            "picks": 2
        },
        {
            "picks": 2
        },
        {
            "picks": 2
        }
    ]
}
[CustomCards]\n${JSON.stringify(
      [...commanderCards, ...nonCommanderCards, ...tokens],
      null,
      '\t'
    )}\n[CommanderSlot(2)]\n${commanderCards
      .map(e => `1 ${e.name}`)
      .join('\n')}\n[OtherSlot(18)]\n${nonCommanderCards
      .map(e => {
        return `1 ${e.name}`;
      })
      .join('\n')}`;

    return formatted;
  }

  if (set === 'HCJ') {
    // get 4, pick 1, pick 1, burn 2
    const formatted = `[Settings]
{
    "colorBalance": false,
    "boostersPerPlayer": 1,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA",
    "boosterSettings": [
      {
        "picks": 1,
        "burns": [0,2]
      }
    ]
}
[CustomCards]\n${JSON.stringify([...tokens, ...cards], null, '\t')}\n[MainSlot(4)]\n${cards
      .map(e => `1 ${e.name}`)
      .join('\n')}`;

    return formatted;
  } else {
    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA"
}
[CustomCards]\n${JSON.stringify([...tokens, ...cards], null, '\t')}\n[MainSlot]\n${cards
      .map(e => `1 ${e.name}`)
      .join('\n')}`;

    return formatted;
  }
};
