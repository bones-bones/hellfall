import { HCCard, HCLayout, HCLayoutGroup } from '@hellfall/shared/types';
import { funcOp, cardStringFilter, looseOpType, opType, funcOpTwo } from './types';
const toCardLayout: Record<string, HCLayout | HCLayout[]> = {
  normal: HCLayout.Normal,
  meldpart: HCLayout.MeldPart,
  meldresult: HCLayout.MeldResult,
  meld: [HCLayout.MeldPart, HCLayout.MeldResult],
  token: HCLayout.Token,
  emblem: HCLayout.Emblem,
  multitoken: HCLayout.MultiToken,
  doublefacedtoken: HCLayout.MultiToken,
  reminder: HCLayout.Reminder,
  multireminder: HCLayout.MultiReminder,
  stickers: HCLayout.Stickers,
  sticker: HCLayout.Stickers,
  dungeon: HCLayout.Dungeon,
  checklist: HCLayout.Checklist,
  misc: HCLayout.Misc,
  notmagic: HCLayout.NotMagic,
  multinotmagic: HCLayout.MultiNotMagic,
  draftpartner: HCLayout.DraftPartner,
  reminderonback: HCLayout.ReminderOnBack,
  reminderback: HCLayout.ReminderOnBack,
  dungeononback: HCLayout.DungeonOnBack,
  dungeonback: HCLayout.DungeonOnBack,
  tokenonback: HCLayout.TokenOnBack,
  tokenback: HCLayout.TokenOnBack,
  stickersonback: HCLayout.StickersOnBack,
  stickeronback: HCLayout.StickersOnBack,
  stickersback: HCLayout.StickersOnBack,
  stickerback: HCLayout.StickersOnBack,
  anyonback: [
    HCLayout.ReminderOnBack,
    HCLayout.TokenOnBack,
    HCLayout.DungeonOnBack,
    HCLayout.TokenOnBack,
  ],
  anyback: [
    HCLayout.ReminderOnBack,
    HCLayout.TokenOnBack,
    HCLayout.DungeonOnBack,
    HCLayout.TokenOnBack,
  ],
  tokenininset: HCLayout.TokenInInset,
  tokeninset: HCLayout.TokenInInset,
  dungeonininset: HCLayout.DungeonInInset,
  dungeoninset: HCLayout.DungeonInInset,
  anyininset: [HCLayout.TokenInInset, HCLayout.DungeonInInset],
  inset: HCLayout.Inset,
  adventure: HCLayout.Inset,
  omen: HCLayout.Inset,
  prepare: HCLayout.Prepare,
  prepared: HCLayout.Prepare,
  insetface: [HCLayout.Inset, HCLayout.Prepare],
  anyinset: [HCLayout.TokenInInset, HCLayout.DungeonInInset, HCLayout.Inset, HCLayout.Prepare],
  anytoken: [HCLayout.Token, HCLayout.MultiToken, HCLayout.TokenInInset, HCLayout.TokenOnBack],
  anynotmagic: [HCLayout.NotMagic, HCLayout.MultiNotMagic],
  anyreminder: [HCLayout.Reminder, HCLayout.MultiReminder, HCLayout.ReminderOnBack],
  anystickers: [HCLayout.Stickers, HCLayout.StickersOnBack],
  anysticker: [HCLayout.Stickers, HCLayout.StickersOnBack],
  anydungeon: [HCLayout.Dungeon, HCLayout.DungeonInInset, HCLayout.DungeonOnBack],
  modal: HCLayout.Modal,
  mdfc: HCLayout.Modal,
  transform: HCLayout.Transform,
  tdfc: HCLayout.Transform,
  specialize: HCLayout.Specialize,
  flip: HCLayout.Flip,
  split: HCLayout.Split,
  aftermath: HCLayout.Aftermath,
  leveler: HCLayout.Leveler,
  level: HCLayout.Leveler,
  class: HCLayout.Class,
  case: HCLayout.Case,
  saga: HCLayout.Saga,
  mutate: HCLayout.Mutate,
  prototype: HCLayout.Prototype,
  planar: HCLayout.Planar,
  plane: HCLayout.Planar,
  phenomenon: HCLayout.Planar,
  scheme: HCLayout.Scheme,
  vanguard: HCLayout.Vanguard,
  station: HCLayout.Station,
  spacecraft: HCLayout.Station,
  planet: HCLayout.Station,
};
const toFaceLayout: Record<string, HCLayoutGroup.FaceLayoutType | HCLayoutGroup.FaceLayoutType[]> =
  {
    normal: HCLayout.Normal,
    meldpart: HCLayout.MeldPart,
    meldresult: HCLayout.MeldResult,
    meld: [HCLayout.MeldPart, HCLayout.MeldResult],
    token: HCLayout.Token,
    emblem: HCLayout.Emblem,
    reminder: HCLayout.Reminder,
    stickers: HCLayout.Stickers,
    sticker: HCLayout.Stickers,
    dungeon: HCLayout.Dungeon,
    checklist: HCLayout.Checklist,
    misc: HCLayout.Misc,
    notmagic: HCLayout.NotMagic,
    draftpartner: HCLayout.DraftPartner,
    inset: HCLayout.Inset,
    adventure: HCLayout.Inset,
    omen: HCLayout.Inset,
    prepare: HCLayout.Prepare,
    prepared: HCLayout.Prepare,
    anyinset: [HCLayout.Inset, HCLayout.Prepare],
    modal: HCLayout.Modal,
    mdfc: HCLayout.Modal,
    transform: HCLayout.Transform,
    tdfc: HCLayout.Transform,
    specialize: HCLayout.Specialize,
    flip: HCLayout.Flip,
    split: HCLayout.Split,
    aftermath: HCLayout.Aftermath,
    leveler: HCLayout.Leveler,
    level: HCLayout.Leveler,
    class: HCLayout.Class,
    case: HCLayout.Case,
    saga: HCLayout.Saga,
    mutate: HCLayout.Mutate,
    prototype: HCLayout.Prototype,
    planar: HCLayout.Planar,
    plane: HCLayout.Planar,
    phenomenon: HCLayout.Planar,
    scheme: HCLayout.Scheme,
    vanguard: HCLayout.Vanguard,
    station: HCLayout.Station,
    spacecraft: HCLayout.Station,
    planet: HCLayout.Station,
  };

export const filterCardLayout: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterCardLayout.defaultOp : operator;
    const cardLayoutMatches = (searchTerm: string) => {
      if (!(searchTerm in toCardLayout)) {
        return false;
      }
      const layoutsToCheck = toCardLayout[searchTerm];
      if (typeof layoutsToCheck == 'string') {
        return layoutsToCheck == value1.layout;
      } else {
        return layoutsToCheck.some(layout => layout == value1.layout);
      }
    };
    return funcOp(actualOp, cardLayoutMatches, value2);
  },
  { defaultOp: '=' as opType }
);
export const filterFaceLayout: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterFaceLayout.defaultOp : operator;
    const faceLayoutMatches = (searchTerm: string) => {
      if (!(searchTerm in toFaceLayout)) {
        return false;
      }
      const layoutsToCheck = toFaceLayout[searchTerm];
      const allFaceLayouts = value1.toFaces().map(e => e.layout);
      if (typeof layoutsToCheck == 'string') {
        return allFaceLayouts.some(faceLayout => layoutsToCheck == faceLayout);
      } else {
        return allFaceLayouts.some(faceLayout =>
          layoutsToCheck.some(layout => layout == faceLayout)
        );
      }
    };
    return funcOp(actualOp, faceLayoutMatches, value2);
  },
  { defaultOp: '=' as opType }
);
export const filterAnyLayout: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterAnyLayout.defaultOp : operator;
    return filterCardLayout(value1, actualOp, value2) || filterFaceLayout(value1, actualOp, value2);
  },
  { defaultOp: '=' as opType }
);
