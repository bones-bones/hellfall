// https://draftmancer.com/cubeformat.html#cube
import { SetCode } from '@hellfall/shared/types';
import { HCToDraftmancer } from './HCToDraftmancer.ts';
import { CardMap } from '../cardHandling';

/**
 * Gets a draftmancer cube txt file
 * @param name the name to use
 * @param cardMap the map of all cards
 * @param set the set to get
 * @param idList the ids to get, if any
 * @param multMap the ids that have multiple copies and their corresponding number of copies, if any
 * @param draftMode the draft mode, if any
 */
export const toDraftmancerCube = ({
  name,
  cardMap,
  set,
  idList,
  multMap,
  draftMode,
}: {
  name: string;
  cardMap: CardMap;
  set: SetCode;
  idList?: string[];
  multMap?: Map<string, number>;
  draftMode?: 'commander' | 'jumpstart';
}) => {
  const { cards, tokens } = HCToDraftmancer(cardMap, set, idList, draftMode);

  if (draftMode == 'commander') {
    const commanderCards = cards.filter(card => card.canBeACommander);
    const nonCommanderCards = cards.filter(card => !card.canBeACommander);

    const formatted = `[Settings]
{
    "name": "${name}",
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
      .map(e => `${multMap?.get(e.id) ?? 1} ${e.name}`)
      .join('\n')}\n[OtherSlot(18)]\n${nonCommanderCards
      .map(e => {
        return `${multMap?.get(e.id) ?? 1} ${e.name}`;
      })
      .join('\n')}`;

    return formatted;
  }

  if (draftMode == 'jumpstart') {
    // get 4, pick 1, pick 1, burn 2
    const formatted = `[Settings]
{
    "name": "${name}",
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
[CustomCards]\n${JSON.stringify([...cards, ...tokens], null, '\t')}\n[MainSlot(4)]\n${cards
      .map(e => `1 ${e.name}`)
      .join('\n')}`;

    return formatted;
  } else {
    const formatted = `[Settings]
{
    "name": "${name}",
    "colorBalance": false,
    "boostersPerPlayer": 3,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA"
}
[CustomCards]\n${JSON.stringify([...cards, ...tokens], null, '\t')}\n[MainSlot]\n${cards
      .map(e => `${multMap?.get(e.id) ?? 1} ${e.name}`)
      .join('\n')}`;

    return formatted;
  }
};
