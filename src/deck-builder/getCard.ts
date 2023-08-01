export const getCard = ({
  thing,
  name,
  id,
  description,
}: {
  thing: any;
  name: string;
  id: number;
  description: string;
}) => {
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
    Description: description || "",
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
    // States: {
    //   "2": {
    //     GUID: "",
    //     Name: "Card",
    //     Transform: {
    //       posX: 0.0,
    //       posY: 1.0,
    //       posZ: 0.0,
    //       rotX: 0.0,
    //       rotY: 180.0,
    //       rotZ: 0.0,
    //       scaleX: 1.0,
    //       scaleY: 1.0,
    //       scaleZ: 1.0,
    //     },
    //     Nickname: "Shatterskull, the Hammer Pass\nLand 2CMC",
    //     Description:
    //       "As Shatterskull, the Hammer Pass enters the battlefield, you may pay 3 life. If you don't, it enters the battlefield tapped.\n{T}: Add {R}.",
    //     GMNotes: "",
    //     AltLookAngle: {
    //       x: 0.0,
    //       y: 0.0,
    //       z: 0.0,
    //     },
    //     LayoutGroupSortIndex: 0,
    //     Value: 0,
    //     Locked: false,
    //     Grid: true,
    //     Snap: true,
    //     IgnoreFoW: false,
    //     MeasureMovement: false,
    //     DragSelectable: true,
    //     Autoraise: true,
    //     Sticky: true,
    //     Tooltip: true,
    //     GridProjection: false,
    //     HideWhenFaceDown: true,
    //     CardID: 7200,
    //     CustomDeck: {
    //       "72": {
    //         FaceURL:
    //           "https://cards.scryfall.io/large/back/b/c/bc7239ea-f8aa-4a6f-87bd-c35359635673.jpg?1604197844",
    //         BackURL:
    //           "http://cloud-3.steamusercontent.com/ugc/1647720103762682461/35EF6E87970E2A5D6581E7D96A99F8A575B7A15F/",
    //         NumWidth: 1,
    //         NumHeight: 1,
    //         BackIsHidden: true,
    //         UniqueBack: false,
    //         Type: 0,
    //       },
    //     },
    //     LuaScript: "",
    //     LuaScriptState: "",
    //     XmlUI: "",
    //   },
    // },
  };
};
