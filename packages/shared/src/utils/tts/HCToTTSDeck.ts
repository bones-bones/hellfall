import { HCCard, HCLayout, HCLayoutGroup } from '@hellfall/shared/types';
import {
  CardPosition,
  DeckPositions,
  ttsCard,
  ttsCustomCard,
  ttsDeck,
  ttsDeckState,
} from './ttsTypes';
import {
  CardMap,
  compressHCCardFaces,
  getRelatedsFromCards,
  mergeHCCardFaces,
  toFaces,
  toPlainText,
} from '../cardHandling';

const cardBackURL =
  'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg';
const commandLayouts: HCLayoutGroup.FaceLayoutType[] = [
  HCLayout.Dungeon,
  HCLayout.Reminder,
  HCLayout.Stickers,
  HCLayout.Emblem,
];
export const HCToTTSDeckStates = (idList: string[], cardMap: CardMap): ttsDeckState[] => {
  const { cards, tokens } = getRelatedsFromCards(idList, cardMap);
  const mainDeck: ttsDeckState = {
    Name: 'DeckCustom',
    CustomDeck: {},
    DeckIDs: [],
    Transform: DeckPositions.MAIN,
    ContainedObjects: [],
    Nickname: 'Main Deck',
  };
  const dfcDeck: ttsDeckState = {
    Name: 'DeckCustom',
    CustomDeck: {},
    DeckIDs: [],
    Transform: DeckPositions.DFCS,
    ContainedObjects: [],
    Nickname: 'DFCs',
  };
  const tokenDeck: ttsDeckState = {
    Name: 'DeckCustom',
    CustomDeck: {},
    DeckIDs: [],
    Transform: DeckPositions.TOKENS,
    ContainedObjects: [],
    Nickname: 'Tokens',
  };
  // const commandDeck: ttsDeckState = {
  //   Name: 'DeckCustom',
  //   CustomDeck: {},
  //   DeckIDs: [],
  //   Transform: DeckPositions.COMMAND_ZONE,
  //   ContainedObjects: [],
  //   Nickname: 'Emblems and Reminder Cards',
  // };
  cards.forEach(card => {
    const compressed = toFaces(compressHCCardFaces(card));
    const mainID = (mainDeck.DeckIDs.at(-1) ?? 0) + 100;
    const plain = toPlainText(card);
    const mainCustom: ttsCustomCard = {
      FaceURL: compressed[0].still_image ?? compressed[0].rotated_image ?? compressed[0].image!,
      BackURL: cardBackURL,
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
    };
    const mainCard: ttsCard = {
      Name: 'Card',
      CardID: mainID,
      Nickname: card.name,
      Transform: CardPosition,
      Description: plain,
    };
    if (compressed[0].rotated_image) {
      mainCard.SidewaysCard = true;
    }
    mainDeck.DeckIDs.push(mainID);
    mainDeck.CustomDeck[Object.keys(mainDeck.CustomDeck).length + 1] = mainCustom;
    mainDeck.ContainedObjects.push(mainCard);
    if (compressed.length > 1) {
      const dfcID = (dfcDeck.DeckIDs.at(-1) ?? 0) + 100;
      const dfcCustom: ttsCustomCard = {
        FaceURL: compressed[0].still_image ?? compressed[0].rotated_image ?? compressed[0].image!,
        BackURL: compressed[1].still_image ?? compressed[1].rotated_image ?? compressed[1].image!,
        NumWidth: 1,
        NumHeight: 1,
        BackIsHidden: true,
        UniqueBack: true,
      };
      const dfcCard: ttsCard = {
        Name: 'Card',
        CardID: dfcID,
        Nickname: card.name,
        Transform: CardPosition,
        Description: plain,
      };
      if (compressed[0].rotated_image) {
        dfcCard.SidewaysCard = true;
      }
      dfcDeck.DeckIDs.push(dfcID);
      dfcDeck.CustomDeck[Object.keys(dfcDeck.CustomDeck).length + 1] = dfcCustom;
      dfcDeck.ContainedObjects.push(dfcCard);
    }
  });
  tokens.forEach(token => {
    const compressed = toFaces(compressHCCardFaces(token));
    const plain = toPlainText(token);
    // if (!commandLayouts.includes(compressed[0].layout as HCLayoutGroup.FaceLayoutType)) {
    const tokenID = (tokenDeck.DeckIDs.at(-1) ?? 0) + 100;
    const tokenCustom: ttsCustomCard = {
      FaceURL: compressed[0].still_image ?? compressed[0].rotated_image ?? compressed[0].image!,
      BackURL:
        compressed[1].still_image ??
        compressed[1].rotated_image ??
        compressed[1].image ??
        cardBackURL,
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
    };
    const tokenCard: ttsCard = {
      Name: 'Card',
      CardID: tokenID,
      Nickname: token.name,
      Transform: CardPosition,
      Description: plain,
    };
    if (compressed[0].rotated_image) {
      tokenCard.SidewaysCard = true;
    }
    tokenDeck.DeckIDs.push(tokenID);
    tokenDeck.CustomDeck[Object.keys(tokenDeck.CustomDeck).length + 1] = tokenCustom;
    tokenDeck.ContainedObjects.push(tokenCard);
    // } else {
    //   const commandID = (commandDeck.DeckIDs.at(-1) ?? 0) + 100;
    //   const commandCustom: ttsCustomCard = {
    //     FaceURL: compressed[0].still_image ?? compressed[0].rotated_image ?? compressed[0].image!,
    //     BackURL: cardBackURL,
    //     NumWidth: 1,
    //     NumHeight: 1,
    //     BackIsHidden: true,
    //   };
    //   const commandCard: ttsCard = {
    //     Name: 'Card',
    //     CardID: commandID,
    //     Nickname: token.name,
    //     Transform: CardPosition,
    //     Description: plain,
    //   };
    //   if (compressed[0].rotated_image) {
    //     commandCard.SidewaysCard = true;
    //   }
    //   commandDeck.DeckIDs.push(commandID);
    //   commandDeck.CustomDeck[Object.keys(commandDeck.CustomDeck).length + 1] = commandCustom;
    //   commandDeck.ContainedObjects.push(commandCard);
    // }
  });
  const bundle = [mainDeck];
  if (dfcDeck.DeckIDs.length) {
    bundle.push(dfcDeck);
  }
  if (tokenDeck.DeckIDs.length) {
    bundle.push(tokenDeck);
  }
  // if (commandDeck.DeckIDs.length) {
  //   bundle.push(commandDeck);
  // }
  return bundle;
};

export const HCToTTSDeck = (name: string, idList: string[], cardMap: CardMap): ttsDeck => {
  const deck: ttsDeck = {
    SaveName: name,
    ObjectStates: HCToTTSDeckStates(idList, cardMap),
  };
  return deck;
};
