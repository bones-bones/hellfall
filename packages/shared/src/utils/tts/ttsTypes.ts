export type ttsCustomCard = {
  FaceURL: string;
  BackURL: string;
  NumWidth: 1;
  NumHeight: 1;
  BackIsHidden: true;
  UniqueBack?: boolean;
  Type?: number;
};
export type ttsCustomDeck = { [key: number]: ttsCustomCard };

export type ttsCard = {
  Name: 'Card';
  CardID: number;
  Nickname: string;
  Transform: {
    posX: number;
    posY: number;
    posZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
  };
  Description: string;
  SidewaysCard?: boolean;
};
export const CardPosition = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 180,
  rotZ: 180,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
};
export const DeckPositions = {
  MAIN: {
    posX: 0,
    posY: 1,
    posZ: 0,
    rotX: 0,
    rotY: 180,
    rotZ: 180,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  },
  SIDEBOARD: {
    posX: 2.2,
    posY: 1,
    posZ: 0,
    rotX: 0,
    rotY: 180,
    rotZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  },
  TOKENS: {
    posX: 2.2,
    posY: 1,
    posZ: 0,
    rotX: 0,
    rotY: 180,
    rotZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  }, // Same as sideboard
  COMMAND_ZONE: {
    posX: -2.2,
    posY: 1,
    rotX: 0,
    rotY: 180,
    posZ: 0,
    rotZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  },
} as const;
export type DeckPositionsType = (typeof DeckPositions)[
  | 'MAIN'
  | 'COMMAND_ZONE'
  | 'SIDEBOARD'
  | 'TOKENS'];

export type ttsDeckState = {
  Name: 'DeckCustom';
  CustomDeck: ttsCustomDeck;
  DeckIDs: number[];
  Transform: DeckPositionsType;
  ContainedObjects: ttsCard[];
  Nickname: string;
  Description?: string;
};
// export type ttsDeckBundle = {
//   mainDeck: ttsDeckState;
//   dfcs?: ttsDeckState;
//   tokens?: ttsDeckState;
//   command?: ttsDeckState;
// }
export type ttsDeck = {
  SaveName: string;
  ObjectStates: ttsDeckState[];
};

// export type ttsCard = {
//   Name:'Card'
//   CardID:string
//   Nickname:string
//   Description:string
//   CustomDeck: {
//     [key: number]: {
//       FaceURL: string;
//       BackURL: string;
//       NumWidth: number;
//       NumHeight: number;
//       BackIsHidden: boolean;
//       UniqueBack: boolean;
//       Type: number;
//     };
//   }
//   SidewaysCard: boolean
//   ColorDiffuse: {
//       r: 0.713235259,
//       g: 0.713235259,
//       b: 0.713235259,
//     }
//   Locked: false
//   Grid: true
//   Snap: true
//   IgnoreFoW: false
//   MeasureMovement: false
//   DragSelectable: true
//   Autoraise: true
//   Sticky: true
//   Tooltip: true
//   GridProjection: false
//   HideWhenFaceDown: true
//   Hands: true
//   XmlUI: ''
//   LuaScript: ''
//   LuaScriptState: ''
//   GUID: ''
// }

// export type ttsDeck = {
//   Name:'DeckCustom',
//   Nickname:string,
//   DeckIDs:string[],
//   CustomDeck:{
//     [key: number]: {
//       FaceURL: string;
//       BackURL: string;
//       NumWidth: number;
//       NumHeight: number;
//       BackIsHidden: boolean;
//       UniqueBack: boolean;
//       Type: number;
//     };
//   },
//   ContainedObjects: Array<ttsCard>;
//   Transform: {
//     posX: 0,
//     posY: 0,
//     posZ: 0,
//     rotX: 0,
//     rotY: 180,
//     rotZ: 180,
//     scaleX: 1.1339285714285714,
//     scaleY: 1,
//     scaleZ: 1.11125,
//   }
//   GMNotes: ''
//   ColorDiffuse: {
//     r: 0.713235259,
//     g: 0.713235259,
//     b: 0.713235259,
//   }
//   Locked: false
//   Grid: true
//   Snap: true
//   IgnoreFoW: false
//   MeasureMovement: false
//   DragSelectable: true
//   Autoraise: true
//   Sticky: true
//   Tooltip: true
//   GridProjection: false
//   HideWhenFaceDown: true
//   Hands: false
//   SidewaysCard: false
//   XmlUI: ''
//   LuaScript: ''
//   LuaScriptState: ''
//   GUID: ''

// }
