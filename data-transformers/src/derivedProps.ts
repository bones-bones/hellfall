import {
  HCCard,
  HCCardFace,
  HCImageStatus,
  HCLayout,
  HCLayoutGroup,
} from '../../src/api-types/Card';
import { pipsAtom } from '../../src/hellfall/atoms/pipsAtom';
import { getDefaultStore } from 'jotai';
import { HCColor, HCColors } from '../../src/api-types/Card';
import { splitParens } from '../../src/hellfall/splitParens';
const store = getDefaultStore();

const ignoreFaceIdentityImageStatus: HCImageStatus[] = [
  HCImageStatus.Dungeon,
  HCImageStatus.Token,
  HCImageStatus.Reminder,
  HCImageStatus.Stickers,
  HCImageStatus.DraftPartner,
];

export const getColorIdentityProps = (
  card: HCCard.Any
): { color_identity: HCColors; color_identity_hybrid: HCColors[] } => {
  const colorIdentity = new Set<string>();
  const colorIdentityHybrid: HCColors[] = [];
  const addColors = (colors: HCColors) => {
    colors.forEach(color => {
      if (color != HCColor.Colorless) {
        colorIdentity.add(color);
      }
    });
    if (colors && !colors.includes(HCColor.Colorless) && colors.length > 0) {
      // if the new colors do not contain some existing colorSet
      if (!colorIdentityHybrid.some(colorSet => colorSet.every(color => colors.includes(color)))) {
        for (let i = colorIdentityHybrid.length - 1; i >= 0; i--) {
          // if the new colorSet is completely inside the existing colorSet, delete the existing one
          if (colors.every(color => colorIdentityHybrid[i].includes(color))) {
            colorIdentityHybrid.splice(i, 1);
          }
        }
        colorIdentityHybrid.push(colors);
      }
    }
  };
  const pips = store.get(pipsAtom);
  const addColorsFromFace = (face: HCCard.AnySingleFaced | HCCardFace.MultiFaced) => {
    const costNames = face.mana_cost.match(/{([^}]+)}/g)?.map(match => match.slice(1, -1));

    costNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        addColors(pip.colors!);
      } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            addColors([mappedColor]);
          }
        }*/
    });

    const minusReminderText = splitParens(face.oracle_text)
      .filter(e => e[0] && e[0] != '(')
      .join('');
    const textNames = (minusReminderText || '')
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1));

    textNames?.forEach(name => {
      const pip = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
      if (pip && pip?.represents_mana) {
        addColors(pip.colors!);
      } /*else {
          const mappedColor = manaSymbolColorMatching[name];
          if (mappedColor) {
            addColors([mappedColor]);
          }
        }*/
    });

    const splitSubtypes = face.subtypes || [];
    splitSubtypes.forEach(typeEntry => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        addColors([mappedColor]);
      }
    });

    if ('color_indicator' in face) {
      face.color_indicator?.forEach(color => {
        addColors([color]);
      });
    }
  };

  if ('card_faces' in card) {
    // this way it ignores face 0
    const lastImageIndex = card.card_faces.findLastIndex((face, i) => face.image && i);
    // add each face that isn't an ignored image_status or the last image in a layout that ignores the last image
    card.card_faces.forEach((entry, i) => {
      if (
        !ignoreFaceIdentityImageStatus.includes(entry.image_status as HCImageStatus) &&
        !(
          HCLayoutGroup.FrontIdentityLayout.includes(
            card.layout as HCLayoutGroup.FrontIdentityLayoutType
          ) && i == lastImageIndex
        ) &&
        !(card.layout == HCLayout.Specialize && i != 0)
      ) {
        addColorsFromFace(entry);
      }
    });
  } else {
    addColorsFromFace(card);
  }
  return {
    color_identity: Array.from(colorIdentity) as HCColors,
    color_identity_hybrid: colorIdentityHybrid,
  };
};

export const getMVFromCost = (cost: string): number => {
  const pips = store.get(pipsAtom);
  return (
    cost
      .match(/{([^}]+)}/g)
      ?.map(match => match.slice(1, -1))
      ?.reduce((totalMV, pipName) => {
        const pip = pips?.find(e => e.symbol.toLowerCase() === pipName.toLowerCase());
        return totalMV + (pip?.mana_value || 0);
      }, 0) || 0
  );
};

export const setDerivedProps = (card: HCCard.Any) => {
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach(face => {
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      face.cmc = getMVFromCost(face.mana_cost);
      mana_cost_list.push(face.mana_cost);
    });
    card.type_line = type_line_list.join(' // ');
    card.mana_cost = mana_cost_list.filter(e => e).join(' // ');
  } else {
    card.type_line = [
      card.supertypes?.join(' '),
      [card.types?.join(' '), card.subtypes?.join(' ')].filter(Boolean).join(' — '),
    ]
      .filter(Boolean)
      .join(' ') as string;
  }
  const { color_identity, color_identity_hybrid } = getColorIdentityProps(card);
  card.color_identity = color_identity;
  card.color_identity_hybrid = color_identity_hybrid;
};

const manaSymbolColorMatching: Record<
  string,
  | 'White'
  | 'Black'
  | 'Red'
  | 'Blue'
  | 'Green'
  | 'Purple'
  | 'Pickle'
  | 'Yellow'
  | 'Brown'
  | 'Pink'
  | 'Teal'
  | 'Orange'
> = {};

const landToColorMapping = {
  Plains: 'W',
  Ploons: 'W',
  Swamp: 'B',
  Island: 'U',
  // IslandGX: 'Blue', // TODO: I have sinned
  Mountain: 'R',
  Moontain: 'R',
  Forest: 'G',
  Nebula: 'P',
  // Oasis: 'Orange',
  // Mudflats: 'Brown',
  // 'Gas-Station': 'Yellow',
  // Carnival: 'Pink',
} as Record<string, HCColor>;
