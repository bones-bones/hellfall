import { HCEntry } from "../types";

export const toDeck = (cards: HCEntry[]) => {
  const baseDeck = getBaseObject();

  const deckCards = cards.map((entry, i) => {
    (baseDeck.ObjectStates[0].DeckIDs as number[]).push((i + 1) * 100);

    const thing = {
      FaceURL: entry.Image,
      BackURL:
        "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/x/K/D/fxKDU/Custom-Back_l.jpg",
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
      UniqueBack: false,
      Type: 1,
    };
    (baseDeck.ObjectStates[0].CustomDeck as any)[i + 1 + ""] = thing;

    return getCard({ [i + 1 + ""]: thing }, entry.Name, (i + 1) * 100);
  });
  (baseDeck.ObjectStates[0].ContainedObjects as any) = deckCards;
  return baseDeck;
};

const getBaseObject = () => ({
  SaveName: "",
  GameMode: "",
  Date: "",
  Gravity: 0.5,
  PlayArea: 0.5,
  GameType: "",
  GameComplexity: "",
  Tags: [],
  Table: "",
  Sky: "",
  Note: "",
  Rules: "",
  LuaScript: null,
  LuaScriptState: null,
  XmlUI: null,
  TabStates: {},
  VersionNumber: "",
  ObjectStates: [
    {
      Name: "Deck",
      Transform: {
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 180,
        rotZ: 180,
        scaleX: 1.1339285714285714,
        scaleY: 1,
        scaleZ: 1.11125,
      },
      Nickname: "",
      Description: "",
      GMNotes: "",
      ColorDiffuse: {
        r: 0.713235259,
        g: 0.713235259,
        b: 0.713235259,
      },
      Locked: false,
      Grid: true,
      Snap: true,
      IgnoreFoW: false,
      DeckIDs: [], //Fill this
      CustomDeck: {}, // and this
      ContainedObjects: [], // aaand this
      MeasureMovement: false,
      DragSelectable: true,
      Autoraise: true,
      Sticky: true,
      Tooltip: true,
      GridProjection: false,
      HideWhenFaceDown: true,
      Hands: false,
      SidewaysCard: false,
      XmlUI: "",
      LuaScript: "",
      LuaScriptState: "",
      GUID: "",
    },
  ],
});

const getCard = (thing: any, name: string, id: number) => {
  return {
    Name: "CardCustom",
    Transform: {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 180,
      rotZ: 0,
      scaleX: 1.1339285714285714,
      scaleY: 1,
      scaleZ: 1.11125,
    },
    Nickname: name,
    Description: "",
    GMNotes: "",
    ColorDiffuse: {
      r: 0.713235259,
      g: 0.713235259,
      b: 0.713235259,
    },
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: true,
    CardID: id,
    SidewaysCard: false,
    CustomDeck: thing,
    XmlUI: "",
    LuaScript: "",
    LuaScriptState: "",
    GUID: "",
  };
};
