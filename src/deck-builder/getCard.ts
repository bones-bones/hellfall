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
    Name: 'CardCustom',
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
    Description: description || '',
    GMNotes: '',
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
    XmlUI: '',
    LuaScript: '',
    LuaScriptState: '',
    GUID: '',
  };
};
