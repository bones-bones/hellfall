// https://draftmancer.com/cubeformat.html#cube
import { canBeACommander } from '../../hellfall/canBeACommander.ts';
import { HCCard } from '@hellfall/shared/types';
import { hcjFrontCards, packInfoToCard } from '../hellstart/hcj.ts';
import { getDraftMancerCard } from './getDraftMancerCard.ts';

export const toDraftmancerCube = ({ set, cards }: { set: string; cards: HCCard.Any[] }) => {
  cards.forEach(card => {
    card.name = card.name
      .replace(/\[/g, 'OPENBRACKET')
      .replace(/\]/g, 'CLOSEBRACKET')
      .replace(/^ /g, 'SPACE');
  });
  // TODO: make sure this works
  const componentCards = cards.filter(card =>
    Boolean(card.all_parts?.find(e => e.id == card.id && e.component != 'token_maker'))
  );

  const componentCardsAsDraftmancer = componentCards.map(getDraftMancerCard);

  const noComponentCards = cards.filter(
    card => !card.all_parts?.find(e => e.id == card.id && e.component != 'token_maker')
  );

  if (set === 'HC6') {
    const cardsToWrite = noComponentCards.filter(canBeACommander);

    const commanderCardsToWrite = cardsToWrite.map(getDraftMancerCard);
    commanderCardsToWrite.forEach(dmCard => {
      const cardsThatBelongToThis = componentCards.filter(e =>
        e.all_parts?.find(entry => entry.id == dmCard.id)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter(e =>
          cardsThatBelongToThis.find(secondE => secondE.id === e.id)
        );
        dmCard.related_cards = matchingDmCards.map(e => e.id);
        dmCard.draft_effects = [
          ...(dmCard.draft_effects || []),
          { type: 'AddCards', cards: matchingDmCards.map(e => e.id) },
        ];
      }
    });

    const canNotBeCommander = noComponentCards.filter(entry => !canBeACommander(entry));

    const otherCardsToWrite = canNotBeCommander.map(getDraftMancerCard);

    otherCardsToWrite.forEach(dmCard => {
      const cardsThatBelongToThis = componentCards.filter(e =>
        e.all_parts?.find(entry => entry.id == dmCard.id)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter(e =>
          cardsThatBelongToThis.find(secondE => secondE.id === e.id)
        );
        dmCard.related_cards = matchingDmCards.map(e => e.id);
        dmCard.draft_effects = [
          ...(dmCard.draft_effects || []),
          { type: 'AddCards', cards: matchingDmCards.map(e => e.id) },
        ];
      }
    });

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
      [...commanderCardsToWrite, ...otherCardsToWrite, ...componentCardsAsDraftmancer],
      null,
      '\t'
    )}\n[CommanderSlot(2)]\n${commanderCardsToWrite
      .filter(e => e.name != 'Prismatic Pardner')
      .map(e => `1 ${e.name}`)
      .join('\n')}\n[OtherSlot(18)]\n${otherCardsToWrite
      .map(e => {
        return `1 ${e.name}`;
      })
      .join('\n')}`;

    return formatted;
  } else if (set === 'HCJ') {
    const cardsToWrite = hcjFrontCards.map(e => getDraftMancerCard(packInfoToCard(e)));
    // augh this sucks and is messy. technically these are just undraftable component cards
    const hcjAsDraftmancer = noComponentCards.map(getDraftMancerCard);

    cardsToWrite.forEach((entry, i) => {
      const contentNames = noComponentCards
        .filter(cardEntry => {
          return cardEntry.tags?.includes(hcjFrontCards[i].tag);
        })
        .map(e => e.name)
        .map(e => e.replace(/^(\d+) /, 'Number $1'));
      entry.draft_effects = [
        'FaceUp',
        {
          type: 'AddCards',
          cards: contentNames,
        },
      ];
      entry.related_cards = contentNames;
    });

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
[CustomCards]\n${JSON.stringify(
      [
        ...cardsToWrite,
        ...hcjAsDraftmancer.map(e => {
          return { ...e, name: e.name.replace(/^(\d+) /, 'Number $1') };
        }),
      ],
      null,
      '\t'
    )}\n[MainSlot(4)]\n${cardsToWrite.map(e => `1 ${e.name}`).join('\n')}`;

    return formatted;
  } else {
    const cardsToWrite = noComponentCards.map(getDraftMancerCard);

    cardsToWrite.forEach(dmCard => {
      const cardsThatBelongToThis = componentCards.filter(e =>
        e.all_parts?.find(entry => entry.id == dmCard.id)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter(e =>
          cardsThatBelongToThis.find(secondE => secondE.id === e.id)
        );
        dmCard.related_cards = matchingDmCards.map(e => e.id);
        dmCard.draft_effects = [
          ...(dmCard.draft_effects || []),

          { type: 'AddCards', cards: matchingDmCards.map(e => e.id) },
        ];
      }
    });

    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA"
}
[CustomCards]\n${JSON.stringify(
      [...cardsToWrite, ...componentCardsAsDraftmancer],
      null,
      '\t'
    )}\n[MainSlot]\n${cardsToWrite.map(e => `1 ${e.name}`).join('\n')}`;

    return formatted;
  }
};
