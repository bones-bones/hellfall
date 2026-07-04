import { HCLayout, HCLayoutGroup } from '@hellfall/shared/types';
import { opType, summaryFunction, textListFilterFunction } from '../types';
import { shareOp, opToNot, opToDont, createCorrectedSummary } from '../utils';
import { listsShare } from '../../utils';
export const toCardLayoutRecord: Record<string, HCLayout | HCLayout[]> = {
  normal: HCLayout.Normal,
  front: HCLayout.Front,
  meldpart: HCLayout.MeldPart,
  meldresult: HCLayout.MeldResult,
  meld: [HCLayout.MeldPart, HCLayout.MeldResult],
  cube: HCLayout.Cube,
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
  modaldfc: HCLayout.Modal,
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
const toCardLayout = (text: string): HCLayout[] | undefined => {
  const layout = toCardLayoutRecord[text];
  return typeof layout == 'string' ? [layout] : layout;
};
const getCardLayoutName = (text: string) =>
  toCardLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');

export const toFaceLayoutRecord: Record<
  string,
  HCLayoutGroup.FaceLayoutType | HCLayoutGroup.FaceLayoutType[]
> = {
  normal: HCLayout.Normal,
  front: HCLayout.Front,
  meldpart: HCLayout.MeldPart,
  meldresult: HCLayout.MeldResult,
  meld: [HCLayout.MeldPart, HCLayout.MeldResult],
  cube: HCLayout.Cube,
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

const toFaceLayout = (text: string): HCLayout[] | undefined => {
  const layout = toFaceLayoutRecord[text];
  return typeof layout == 'string' ? [layout] : layout;
};
const getFaceLayoutName = (text: string) =>
  toFaceLayout(text)
    ?.map(e => `"${e.replaceAll('_', ' ')}"`)
    .join(' or ');

export const cardLayoutFilter: textListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: string
) => shareOp(operator, listsShare, value1, toCardLayout(value2));
export const cardLayoutSummary = createCorrectedSummary(
  getCardLayoutName,
  (operator, value) => `the card layout is ${opToNot(operator)} ${value}`,
  (operator, value) => `!Unknown card layout "${value}"`
);

export const faceLayoutFilter: textListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: string
) => shareOp(operator, listsShare, value1, toFaceLayout(value2));
export const faceLayoutSummary = createCorrectedSummary(
  getFaceLayoutName,
  (operator, value) => `the cards ${opToDont(operator)} have a face with layout ${value}`,
  (operator, value) => `!Unknown face layout "${value}"`
);

export const anyLayoutFilter: textListFilterFunction = (
  value1: string[],
  operator: opType,
  value2: string
) => cardLayoutFilter(value1, operator, value2) || faceLayoutFilter(value1, operator, value2);
export const anyLayoutSummary: summaryFunction<string> = (operator: opType, value: string) => {
  const cardLayout = getCardLayoutName(value);
  const faceLayout = getFaceLayoutName(value);
  if (cardLayout) {
    return cardLayoutSummary(operator, value);
  } else if (faceLayout) {
    return faceLayoutSummary(operator, value);
  } else {
    return `!Unknown layout "${value}"`;
  }
};
