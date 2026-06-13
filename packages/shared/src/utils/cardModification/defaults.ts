import {
  BothLayoutType,
  HCBorderColor,
  HCCard,
  HCCardFace,
  HCColors,
  HCFinish,
  HCFrame,
  HCImageStatus,
  HCKind,
  HCLayout,
  HCLayoutGroup,
  HCLegalitiesField,
  HCLegality,
  HCObject,
  SetCode,
} from '@hellfall/shared/types';
import {
  facePropOrder,
  facePropType,
  faceMappedType,
  faceType,
  partMappedType,
  rootEntriesType,
  rootPropOrder,
  rootPropType,
  rootMappedType,
  toFaces,
  faceEntriesType,
  getRootEntries,
  addPropToRoot,
  getFaceEntries,
  addPropToFace,
  getPartEntries,
  getCardEntries,
  getCardFaceEntries,
  rootValueType,
  faceValueType,
} from '@hellfall/shared/utils';

const defaultRootProps: rootMappedType = {
  id: '',
  oracle_id: '',
  hcid: '',
  name: '',
  set: '' as SetCode,
  collector_number: '',
  image_status: HCImageStatus.Inapplicable,
  mana_cost: '',
  mana_value: 0,
  type_line: '',
  colors: [] as HCColors,
  color_identity: [] as HCColors,
  color_identity_hybrid: [] as HCColors[],
  keywords: [] as string[],
  legalities: {
    standard: HCLegality.NotLegal,
    '4cb': HCLegality.NotLegal,
    commander: HCLegality.NotLegal,
  } as HCLegalitiesField,
  creators: [],
  rulings: '',
  finish: HCFinish.Nonfoil,
  border_color: HCBorderColor.Black,
};

const defaultFaceProps: faceMappedType = {
  name: '',
  // image_status: HCImageStatus.Inapplicable,
  mana_cost: '',
  mana_value: 0,
  type_line: '',
  oracle_text: '',
  colors: [] as HCColors,
};
const defaultPartProps: partMappedType = {
  id: '',
  hcid: '',
  name: '',
  set: '' as SetCode,
};

// export const restoreMissingFields = (card: HCCard.Any) => {
//   getRootEntries(defaultRootProps).forEach(([prop, value]) => {
//     if (card[prop] == undefined) {
//       addPropToRoot(card, prop, value);
//     }
//   });
//   toFaces(card).forEach((face, i) => {
//     getFaceEntries(defaultFaceProps).forEach(([prop, value]) => {
//       if (face[prop] == undefined) {
//         addPropToFace(card, prop, value, i);
//       }
//     });
//   });
//   card.all_parts?.forEach(part => {
//     getPartEntries(defaultPartProps).forEach(([prop, value]) => {
//       if (part[prop] == undefined) {
//         (part as any)[prop] = value;
//       }
//     });
//   });
// };

// const kindToSet:Record<HCKind,string> = {
//   card:'',
//   token:'HCT',
//   land:'HBB',
//   front:'FHCJ',
//   scryfall:'SFT',
//   notmagic:'NotMagic'
// }

export const kindToFaceLayout: Record<HCKind, BothLayoutType> = {
  card: HCLayout.Normal,
  token: HCLayout.Token,
  land: HCLayout.Normal,
  front: HCLayout.Front,
  scryfall: HCLayout.Normal,
  notmagic: HCLayout.NotMagic,
};
export const kindToMultiLayout: Record<HCKind, HCLayoutGroup.MultiFacedType> = {
  card: HCLayout.Multi,
  token: HCLayout.MultiToken,
  land: HCLayout.Multi,
  front: HCLayout.Multi,
  scryfall: HCLayout.Multi,
  notmagic: HCLayout.MultiNotMagic,
};

export const kindToDefaultFrame: Record<HCKind, HCFrame> = {
  card: HCFrame.Stamp,
  token: HCFrame.FullToken,
  land: HCFrame.Stamp,
  front: HCFrame.Stamp,
  scryfall: HCFrame.Stamp,
  notmagic: HCFrame.NotMagic,
};

const tokenTypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  emblem: HCLayout.Emblem,
  // 'reminder card': HCLayout.Reminder,
  stickers: HCLayout.Stickers,
  dungeon: HCLayout.Dungeon,
  // 'real card': HCLayout.RealCardToken,
  'ad card': HCLayout.Misc,
  misc: HCLayout.Misc,
  checklist: HCLayout.Checklist,
};
const typeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  plane: HCLayout.Planar,
  phenomenon: HCLayout.Planar,
  scheme: HCLayout.Scheme,
  vanguard: HCLayout.Vanguard,
  battle: HCLayout.Battle,
};
const subtypeLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
  saga: HCLayout.Saga,
  class: HCLayout.Class,
  case: HCLayout.Case,
  spacecraft: HCLayout.Station,
  watercraft: HCLayout.Station,
  planet: HCLayout.Station,
};

export const getDefaultTypeLayout = (card: HCCard.Any, index?: number): HCLayout | undefined => {
  const isTokenRoot = !('card_faces' in card) && card.kind == 'token';
  const face = toFaces(card)[index ?? 0];
  const tokenType = face.types?.find(type => type.toLowerCase() in tokenTypeLayouts)?.toLowerCase();
  if (tokenType) {
    return tokenTypeLayouts[tokenType];
  } else if (isTokenRoot) {
    return;
  }
  const type = face.types?.find(type => type.toLowerCase() in typeLayouts)?.toLowerCase();
  if (type) {
    return typeLayouts[type];
  }

  const subtype = face.subtypes?.find(type => type.toLowerCase() in subtypeLayouts)?.toLowerCase();
  if (subtype) {
    return subtypeLayouts[subtype];
  }
};

export const getDefaultKindLayout = (card: HCCard.Any, index?: number): HCLayout =>
  card.kind == 'card' && index ? HCLayout.Multi : kindToFaceLayout[card.kind];

// TODO: better handle cases with multiple layout tags
export const getDefaultFaceLayout = (card: HCCard.Any, index?: number): HCLayout =>
  getDefaultTypeLayout(card, index) ?? getDefaultKindLayout(card, index);

export const getDefaultRootValue = <K extends rootPropType>(
  card: HCCard.Any,
  prop: K
): rootValueType<K> | undefined => {
  switch (prop) {
    case 'border_color':
      return HCBorderColor.Black as rootValueType<K>;
    case 'image_status':
      return HCImageStatus.Inapplicable as rootValueType<K>;
    case 'layout':
      return ('card_faces' in card ? kindToMultiLayout : kindToFaceLayout)[
        card.kind
      ] as rootValueType<K>;
    case 'collector_number':
      return '' as rootValueType<K>;
  }
};

export const getDefaultFaceValue = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  index?: number
): faceValueType<K> | undefined => {
  switch (prop) {
    case 'finish':
      return HCFinish.Nonfoil as faceValueType<K>;
    case 'border_color':
      return HCBorderColor.Black as faceValueType<K>;
    case 'image_status':
      return (index ? HCImageStatus.Inapplicable : HCImageStatus.Front) as faceValueType<K>;
    case 'layout':
      return getDefaultFaceLayout(card, index) as faceValueType<K>;
    case 'frame':
      return kindToDefaultFrame[card.kind] as faceValueType<K>;
  }
};
/**
 * Gets the default card given certain props
 * @param kind the kind of card
 * @param isMultiFaced whether the card is multifaced
 * @param entryProps props to add to the root; ignores values of '', [], and [''].
 * @param faceProps props to add to the first face or to the root, depending on whether the card is multifaced; ignores values of '', [], and [''].
 * @returns
 */
export const getDefaultCard = (
  kind: HCKind,
  isMultiFaced: boolean,
  entryProps: Partial<HCCard.Any>,
  faceProps: Partial<faceType>
): HCCard.Any => {
  const card = (
    isMultiFaced
      ? ({
          ...structuredClone(defaultRootProps),
          object: HCObject.ObjectType.Card,
          kind,
          layout: kindToMultiLayout[kind],
          frame: kindToDefaultFrame[kind],
          card_faces: [] as HCCardFace.MultiFaced[],
        } as HCCard.AnyMultiFaced)
      : ({
          ...structuredClone(defaultRootProps),
          object: HCObject.ObjectType.Card,
          kind,
          layout: kindToFaceLayout[kind],
          frame: kindToDefaultFrame[kind],
          oracle_text: '',
        } as HCCard.AnySingleFaced)
  ) as HCCard.Any;
  (Object.entries(entryProps) as rootEntriesType)
    .filter(([prop, value]) =>
      Array.isArray(value)
        ? value.length && !(value.length == 1 && value[0] == '')
        : value != '' && value != undefined && !(typeof value == 'number' && isNaN(value))
    )
    .forEach(([prop, value]) => addPropToRoot(card, prop, value));
  (Object.entries(faceProps) as faceEntriesType)
    .filter(([prop, value]) =>
      Array.isArray(value)
        ? value.length && !(/* prop != 'colors' &&  */ (value.length == 1 && value[0] == ''))
        : value != '' && value != undefined && !(typeof value == 'number' && isNaN(value))
    )
    .forEach(([prop, value]) => addPropToFace(card, prop, value, 0));
  return card;
};

export const fillFacesTo = (card: HCCard.AnyMultiFaced, index: number) => {
  while (card.card_faces.length <= index) {
    card.card_faces.push({
      ...structuredClone(defaultFaceProps),
      object: HCObject.ObjectType.CardFace,
      layout: card.kind == 'card' && index ? HCLayout.Multi : kindToFaceLayout[card.kind],
      image_status: index ? HCImageStatus.Inapplicable : HCImageStatus.Front,
    } as HCCardFace.MultiFaced);
  }
};
const keepInRoot: (rootPropType & facePropType)[] = [
  'image_status',
  'image',
  'rotated_image',
  'still_image',
  'finish',
  'border_color',
  'frame',
  'frame_effects',
];
const onlyInFace: (keyof HCCardFace.MultiFaced)[] = ['object', 'compress_face', 'drop_face'];

export const toMultiFaced = (card: HCCard.AnySingleFaced): HCCard.AnyMultiFaced => {
  const entryProps: Partial<HCCard.Any> = {};
  const faceProps: Partial<faceType> = {};
  getCardEntries(card).forEach(([key, value]) => {
    if (rootPropOrder.includes(key as rootPropType) && !['layout'].includes(key)) {
      (entryProps as any)[key] = value;
    }
    if (
      facePropOrder.includes(key as facePropType) &&
      !keepInRoot.includes(key as rootPropType & facePropType) &&
      !onlyInFace.includes(key as keyof HCCardFace.MultiFaced)
    ) {
      (faceProps as any)[key] = value;
    }
  });
  return getDefaultCard(card.kind, true, entryProps, faceProps) as HCCard.AnyMultiFaced;
};
export const toSingleFaced = (card: HCCard.AnyMultiFaced): HCCard.AnySingleFaced => {
  const entryProps: Partial<HCCard.Any> = {};
  const faceProps: Partial<faceType> = {};
  getCardEntries(card).forEach(([key, value]) => {
    if (rootPropOrder.includes(key as rootPropType) && !['layout'].includes(key)) {
      (entryProps as any)[key] = value;
    }
  });
  getCardFaceEntries(card, 0).forEach(([key, value]) => {
    if (
      facePropOrder.includes(key as facePropType) &&
      !keepInRoot.includes(key as rootPropType & facePropType) &&
      !onlyInFace.includes(key as keyof HCCardFace.MultiFaced)
    ) {
      (faceProps as any)[key] = value;
    }
  });
  return getDefaultCard(card.kind, false, entryProps, faceProps) as HCCard.AnySingleFaced;
};

// export const layoutIsDefault = (card: HCCard.Any, index?: number) => {
//   if (!('card_faces' in card)) {
//     return card.layout == kindToFaceLayout[card.kind];
//   }
//   if (index == undefined) {
//     return card.layout == kindToMultiLayout[card.kind];
//   }
//   return (
//     card.card_faces[index].layout ==
//     (index && kindToFaceLayout[card.kind] == 'normal'
//       ? HCLayout.Multi
//       : kindToFaceLayout[card.kind])
//   );
// };
